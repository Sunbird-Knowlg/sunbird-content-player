org.ekstep.contentrenderer.baseLauncher.extend({
    s3_folders: {
        'application/vnd.ekstep.html-archive': "html/",
        'application/vnd.ekstep.h5p-archive': 'h5p/',
        'application/vnd.ekstep.scorm-archive': 'scorm/'
    },
    heartBeatData: {},
    currentIndex: 50,
    totalIndex: 100,
    enableHeartBeatEvent: true,
    _constants: {
        mimeType: ["application/vnd.ekstep.html-archive", "application/vnd.ekstep.h5p-archive", "application/vnd.ekstep.scorm-archive"],
        events: {
            launchEvent: "renderer:launch:html"
        }
    },

    initLauncher: function () {
        EkstepRendererAPI.addEventListener(this._constants.events.launchEvent, this.start, this);
    },


    fireTelemetry: function (eid, edata) {
        var telemetry = EkstepRendererAPI.getTelemetryService();
        if (!telemetry) return;
        if (eid === 'END') {
            if (telemetry.end) telemetry.end(edata);
        } else {
            if (telemetry.interact) {
                telemetry.interact(
                    edata.type || 'OTHER',
                    edata.id || (edata.subtype || '').toLowerCase(),
                    edata.subtype,
                    edata
                );
            }
        }
    },

    // Persists SCO state into the in-memory store
    saveScormState: function (scoId, state) {
        this.allScoStates[scoId] = state;
        console.info("SCORM: State saved for SCO", scoId);
    },

    computeOverallStatus: function () {
        var instance = this;
        var allStatuses = instance.scoList.map(function (sco) {
            return instance.allScoStates[sco.identifier]['cmi.core.lesson_status'] || 'not attempted';
        });

        var allComplete = allStatuses.every(function (s) {
            return s === 'completed' || s === 'passed';
        });
        var anyFailed = allStatuses.some(function (s) {
            return s === 'failed';
        });

        if (anyFailed) return 'failed';
        if (allComplete) return 'completed';
        return 'incomplete';
    },

    setupScormAPI: function () {
        var instance = this;
        var scormAPI = null;

        // Tracks whether the real SCORM session has been opened
        var scormSessionStarted = false;

        if (window.Scorm12API) {
            try {
                scormAPI = new window.Scorm12API({
                    autocommit: false,
                    autocommitSeconds: 60,
                    lmsCommitUrl: null,
                    dataCommitFormat: 'json',
                    logLevel: 1,
                });
            } catch (error) {
                console.error('Error initializing SCORM API:', error);
            }
        }

        window.API = {

            // Opens the real SCORM session only once across all SCOs.
            LMSInitialize: function () {
                if (!scormSessionStarted) {
                    var result = scormAPI ? scormAPI.LMSInitialize() : "true";
                    if (result === "true") {
                        scormSessionStarted = true;
                        instance.fireTelemetry('INTERACT', {
                            type: 'OTHER',
                            subtype: 'SCORM_INITIALIZE',
                            id: 'scorm_initialize',
                            stageId: EkstepRendererAPI.getCurrentStageId(),
                            target: "Content"
                        });
                    }
                    return result;
                }
                return "true";
            },

            LMSGetValue: function (k) {
                var val = instance.allScoStates[instance.activeScoId][k];
                if (k === 'cmi.core.lesson_status' && !val) return 'not attempted';
                return val !== undefined ? val : "";
            },

            // Writes to the local store only.
            LMSSetValue: function (k, v) {
                instance.allScoStates[instance.activeScoId][k] = v;
                console.info("SCORM: LMSSetValue", k + "=" + v);
                if (k === 'cmi.core.score.raw') {
                    instance.fireTelemetry('ASSESSMENT', {
                        type: 'ASSESSMENT',
                        subtype: 'SCORM_SCORE',
                        id: 'scorm_score',
                        score: v
                    });
                }
                if (k === 'cmi.core.lesson_status') {
                    instance.fireTelemetry('INTERACT', {
                        type: 'OTHER',
                        subtype: 'SCORM_PROGRESS',
                        id: 'scorm_progress',
                        status: v,
                        scoId: instance.activeScoId
                    });
                    var overallStatus = instance.computeOverallStatus();
                    if (overallStatus === 'completed' || overallStatus === 'passed' || overallStatus === 'failed') {
                        console.info("SCORM: Course completion detected via status change to", v);
                        EkstepRendererAPI.dispatchEvent('renderer:content:end');
                    }
                }
                if (k === 'cmi.core.exit') {
                    instance.fireTelemetry('INTERACT', {
                        type: 'OTHER',
                        subtype: 'SCORM_EXIT_CHANGE',
                        id: 'scorm_exit_change',
                        exit: v
                    });
                }

                if (k.indexOf('cmi.interactions.') === 0 && k.endsWith('.result')) {
                    instance.fireTelemetry('INTERACT', {
                        type: 'OTHER',
                        subtype: 'SCORM_INTERACTION_RESULT',
                        id: 'scorm_interaction_result',
                        result: v
                    });
                }

                return "true";
            },

            LMSCommit: function () {
                var state = instance.allScoStates[instance.activeScoId];
                if (scormAPI) {
                    Object.keys(state).forEach(function (k) {

                        if (k !== '_finished') {
                            scormAPI.LMSSetValue(k, state[k]);
                        }
                    });
                    scormAPI.LMSCommit();
                }
                instance.fireTelemetry('LMSCommit', JSON.stringify(state));
                return "true";
            },


            LMSFinish: function () {
                instance.allScoStates[instance.activeScoId]._finished = true;

                var isLastSco = instance.currentScoIndex === instance.scoList.length - 1;
                if (isLastSco) {
                    var overallStatus = instance.computeOverallStatus();
                    console.info("SCORM: Overall course status", overallStatus);

                    var result = scormAPI ? scormAPI.LMSFinish() : "true";
                    if (result === "true") {
                        EkstepRendererAPI.dispatchEvent('renderer:content:end');
                    }
                    return result;
                }

                instance.fireTelemetry('LMSFinish',
                    JSON.stringify(instance.allScoStates[instance.activeScoId])
                );
                return "true";
            },

            LMSGetLastError: function () { return scormAPI ? scormAPI.LMSGetLastError() : "0"; },
            LMSGetErrorString: function (e) { return scormAPI ? scormAPI.LMSGetErrorString(e) : "No error"; },
            LMSGetDiagnostic: function (e) { return scormAPI ? scormAPI.LMSGetDiagnostic(e) : "No diagnostic"; }
        };
    },

    start: function () {
        this._super();
        var instance = this;
        instance.data = content;
        this.reset();

        instance.allScoStates = {};
        instance.scoList = [];
        instance.currentScoIndex = 0;

        var isMobile = window.cordova ? true : false;
        var envHTML = isMobile ? "app" : "portal";
        var launchData = { "env": envHTML, "envpath": 'dev' };
        var globalConfigObj = EkstepRendererAPI.getGlobalConfig();
        var prefix_url = isbrowserpreview ? this.getAsseturl(instance.data) : globalConfigObj.basepath;
        var path = prefix_url + '/index.html?contentId=' + instance.data.identifier + '&launchData=' + JSON.stringify(launchData) + "&appInfo=" + JSON.stringify(globalConfigObj.appInfo);


        if (isbrowserpreview) {
            path += "&flavor=" + "t=" + getTime();
        }

        jQuery(instance.manifest.id).remove();

        if (instance.data.scoList) {
            try {
                instance.scoList = typeof instance.data.scoList === 'string'
                    ? JSON.parse(instance.data.scoList)
                    : instance.data.scoList;
            } catch (e) {
                console.error("SCORM: Error parsing scoList", e);
            }
        }

        if (instance.scoList.length === 0) {
            instance.scoList = [{
                identifier: 'default',
                title: 'Default',
                href: instance.data.launchFile || 'index.html'
            }];
        }

        instance.scoList.forEach(function (sco) {
            instance.allScoStates[sco.identifier] = {};
        });

        jQuery(instance.manifest.id).remove();

        if (instance.data.mimeType === 'application/vnd.ekstep.scorm-archive') {
            instance.setupScormAPI();
        }

        instance.navigateToSCO(0);

        var obj = { "tempName": "" };
        EkstepRendererAPI.dispatchEvent("renderer:navigation:load", obj);
    },

    navigateToSCO: function (index) {
        var instance = this;
        if (!instance.scoList || index < 0 || index >= instance.scoList.length) return;

        if (instance.activeScoId && instance.allScoStates[instance.activeScoId]._finished) {
            instance.fireTelemetry('LMSFinish',
                JSON.stringify(instance.allScoStates[instance.activeScoId])
            );
        }

        instance.currentScoIndex = index;
        var sco = instance.scoList[index];
        instance.activeScoId = sco.identifier;

        if (!instance.allScoStates[instance.activeScoId]) {
            instance.allScoStates[instance.activeScoId] = {};
        }

        var globalConfigObj = EkstepRendererAPI.getGlobalConfig();
        var prefix_url = isbrowserpreview
            ? this.getAsseturl(instance.data)
            : globalConfigObj.basepath;



        var path = prefix_url + '/' + sco.href;

        console.info("SCORM: Loading path", path);

        var oldIframe = document.getElementById(instance.manifest.id);
        if (oldIframe) oldIframe.parentNode.removeChild(oldIframe);

        var iframe = document.createElement('iframe');
        iframe.id = instance.manifest.id;
        iframe.src = path;
        instance.validateSrc(path, iframe);
    },

    validateSrc: function (path, iframe) {
        var instance = this;
        org.ekstep.pluginframework.resourceManager.loadResource(path, 'TEXT', function (err, data) {
            if (err) {
                showToaster("error", "Sorry!!.. Unable to open the Game!", { timeOut: 200000 });
                EkstepRendererAPI.logErrorEvent('Launch file not found.', { 'type': 'content', 'action': 'play', 'severity': 'fatal' });
            } else {
                EkstepRendererAPI.dispatchEvent("renderer:splash:hide");
                instance.configOverlay();
                instance.addToGameArea(iframe);
            }
        });
    },

    configOverlay: function () {
        var instance = this;
        setTimeout(function () {
            EkstepRendererAPI.dispatchEvent("renderer:overlay:show");
            EkstepRendererAPI.dispatchEvent('renderer:stagereload:hide');
            EkstepRendererAPI.dispatchEvent('renderer:next:hide');
            EkstepRendererAPI.dispatchEvent('renderer:previous:hide');

            if (instance.scoList && instance.scoList.length > 1) {
                instance.showMultiScoNavigation();
            }
        }, 100);
    },

    showMultiScoNavigation: function () {
        var instance = this;
        jQuery('#multi-sco-nav').remove();

        var isLastSco = instance.currentScoIndex === instance.scoList.length - 1;
        var nextButtonHtml = isLastSco ?
            '<button id="sco-complete" style="pointer-events: auto; padding: 10px 20px; cursor: pointer; background: #28a745; color: white; border: none; border-radius: 4px; font-weight: bold;">Complete</button>' :
            '<button id="sco-next" style="pointer-events: auto; background: none; border: none; cursor: pointer; padding: 0;"><img src="assets/icons/next.png" style="width: 40px; height: 40px;"></button>';

        var isPrevDisabled = instance.currentScoIndex === 0;
        var prevStyle = isPrevDisabled
            ? 'opacity: 0.5; pointer-events: none; background: none; border: none; padding: 0;'
            : 'pointer-events: auto; background: none; border: none; cursor: pointer; padding: 0;';
        var disabledAttr = isPrevDisabled ? 'disabled' : '';

        var navHtml = '<div id="multi-sco-nav" style="position: absolute; top: 50%; transform: translateY(-50%); width: 100%; display: flex; justify-content: space-between; padding: 0 10px; box-sizing: border-box; pointer-events: none;">' +
            '<button id="sco-prev" style="' + prevStyle + '" ' + disabledAttr + '><img src="assets/icons/previous.png" style="width: 40px; height: 40px;"></button>' +
            nextButtonHtml +
            '</div>';

        jQuery('#gameArea').append(navHtml);

        jQuery('#sco-prev').click(function () {
            if (instance.currentScoIndex > 0) {
                instance.navigateToSCO(instance.currentScoIndex - 1);
            }
        });

        if (isLastSco) {
            jQuery('#sco-complete').click(function () {
                EkstepRendererAPI.dispatchEvent('renderer:content:end');
            });
        } else {
            jQuery('#sco-next').click(function () {
                if (instance.currentScoIndex < instance.scoList.length - 1) {
                    instance.navigateToSCO(instance.currentScoIndex + 1);
                }
            });
        }
    },

    getAsseturl: function (content) {
        var globalConfigObj = EkstepRendererAPI.getGlobalConfig();
        var path = globalConfigObj.host + globalConfigObj.s3ContentHost + this.s3_folders[content.mimeType];
        path += content.status == "Live" ? content.identifier + "-latest" : content.identifier + "-snapshot";
        return path;
    },

    end: function () {
        this.currentIndex = 100;
        this.totalIndex = 100;
        this._super();
    },

    contentProgress: function () {
        return this.progres(this.currentIndex, this.totalIndex);
    },

    reset: function () {
        this.currentIndex = 50;
        this.totalIndex = 100;
    },

    cleanUp: function () {
        this._super();
        EkstepRendererAPI.dispatchEvent('renderer:next:show');
        EkstepRendererAPI.dispatchEvent('renderer:previous:show');
    }
});