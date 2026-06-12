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
        var instance = this;
        window.addEventListener('beforeunload', function () {
            instance.isUnloading = true;
        });
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


    saveScormState: function (scoId, state) {
        this.allScoStates[scoId] = state;
    },

    computeOverallStatus: function () {
        var instance = this;

        if (instance.scormVersion === '2004') {
            var allComplete2004 = instance.scoList.every(function (sco) {
                return instance.allScoStates[sco.identifier]['cmi.completion_status'] === 'completed';
            });
            var anyFailed2004 = instance.scoList.some(function (sco) {
                return instance.allScoStates[sco.identifier]['cmi.success_status'] === 'failed';
            });
            if (anyFailed2004) return 'failed';
            if (allComplete2004) return 'completed';
            return 'incomplete';
        }

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

            LMSSetValue: function (k, v) {
                instance.allScoStates[instance.activeScoId][k] = v;
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

                    if (v === 'completed' || v === 'passed' || v === 'failed') {
                        instance.allScoStates[instance.activeScoId]._finished = true;
                        if (instance.scoList && instance.scoList.length > 1) {
                            instance.showMultiScoNavigation();
                        }
                    }

                    var overallStatus = instance.computeOverallStatus();
                    if (!instance.isUnloading && (instance.scoList.length === 1) && (overallStatus === 'completed' || overallStatus === 'passed' || overallStatus === 'failed')) {
                        instance.allScoStates[instance.activeScoId]._finished = true;
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
                return "true";
            },


            LMSFinish: function () {
                return instance.handleScoFinish(scormAPI, false);
            },

            LMSGetLastError: function () { return scormAPI ? scormAPI.LMSGetLastError() : "0"; },
            LMSGetErrorString: function (e) { return scormAPI ? scormAPI.LMSGetErrorString(e) : "No error"; },
            LMSGetDiagnostic: function (e) { return scormAPI ? scormAPI.LMSGetDiagnostic(e) : "No diagnostic"; }
        };
    },

    handleScoFinish: function (scormAPI, isScorm2004) {
        var instance = this;
        instance.allScoStates[instance.activeScoId]._finished = true;
        var isLastSco = instance.currentScoIndex === instance.scoList.length - 1;
        if (isLastSco) {
            var overallStatus = instance.computeOverallStatus();
            var result = scormAPI && !isScorm2004
                ? scormAPI.LMSFinish()
                : "true";
            if (!instance.isUnloading && result === "true") {
                EkstepRendererAPI.dispatchEvent('renderer:content:end');
            }
            return result;
        }
        if (instance.scoList && instance.scoList.length > 1) {
            instance.showMultiScoNavigation();
        }
        return "true";
    },

    setupScorm2004API: function () {
        var instance = this;
        var scorm2004API = null;
        var scormSessionStarted = false;

        if (window.Scorm2004API) {
            try {
                scorm2004API = new window.Scorm2004API({
                    autocommit: false,
                    autocommitSeconds: 60,
                    lmsCommitUrl: null,
                    dataCommitFormat: 'json',
                    logLevel: 1,
                });
            } catch (error) {
                console.error('Error initializing SCORM 2004 API:', error);
            }
        }

        window.API_1484_11 = {
            Initialize: function (_) {
                if (!scormSessionStarted) {
                    var result = scorm2004API ? scorm2004API.Initialize("") : "true";
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

            GetValue: function (k) {
                var val = instance.allScoStates[instance.activeScoId][k];
                if (k === 'cmi.completion_status' && !val) return 'unknown';
                if (k === 'cmi.success_status' && !val) return 'unknown';
                return val !== undefined ? val : "";
            },

            SetValue: function (k, v) {
                instance.allScoStates[instance.activeScoId][k] = v;

                if (k === 'cmi.score.raw') {
                    instance.fireTelemetry('ASSESSMENT', {
                        type: 'ASSESSMENT',
                        subtype: 'SCORM_SCORE',
                        id: 'scorm_score',
                        score: v
                    });
                }

                if (k === 'cmi.completion_status' || k === 'cmi.success_status') {
                    instance.fireTelemetry('INTERACT', {
                        type: 'OTHER',
                        subtype: 'SCORM_PROGRESS',
                        id: 'scorm_progress',
                        status: v,
                        scoId: instance.activeScoId
                    });

                    if (v === 'completed' || v === 'passed' || v === 'failed') {
                        instance.allScoStates[instance.activeScoId]._finished = true;
                        if (instance.scoList && instance.scoList.length > 1) {
                            instance.showMultiScoNavigation();
                        }
                    }

                    var overallStatus = instance.computeOverallStatus();
                    if (!instance.isUnloading && (instance.scoList.length === 1) && (overallStatus === 'completed' || overallStatus === 'passed' || overallStatus === 'failed')) {
                        instance.allScoStates[instance.activeScoId]._finished = true;
                        EkstepRendererAPI.dispatchEvent('renderer:content:end');
                    }
                }

                if (k === 'cmi.exit') {
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

            Commit: function (_) {
                var state = instance.allScoStates[instance.activeScoId];
                return "true";
            },

            Terminate: function (_) {
                return instance.handleScoFinish(scorm2004API, true);
            },

            GetLastError: function () { return scorm2004API ? scorm2004API.GetLastError() : "0"; },
            GetErrorString: function (e) { return scorm2004API ? scorm2004API.GetErrorString(e) : "No error"; },
            GetDiagnostic: function (e) { return scorm2004API ? scorm2004API.GetDiagnostic(e) : "No diagnostic"; }
        };
    },

    start: function () {
        this._super();
        var instance = this;
        instance.isUnloading = false;
        instance.data = content;
        instance.scormVersion = instance.data.scormVersion || '1.2';
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
            if (instance.scormVersion === '2004') {
                instance.allScoStates[sco.identifier] = {
                    'cmi.completion_status': 'unknown',
                    'cmi.success_status': 'unknown'
                };
            } else {
                instance.allScoStates[sco.identifier] = {
                    'cmi.core.lesson_status': 'not attempted'
                };
            }
        });

        jQuery(instance.manifest.id).remove();

        if (instance.data.mimeType === 'application/vnd.ekstep.scorm-archive') {
            if (instance.scormVersion === '2004') {
                instance.setupScorm2004API();
            } else {
                instance.setupScormAPI();
            }
        }

        instance.navigateToSCO(0);

        var obj = { "tempName": "" };
        EkstepRendererAPI.dispatchEvent("renderer:navigation:load", obj);
    },

    navigateToSCO: function (index) {
        var instance = this;
        if (!instance.scoList || index < 0 || index >= instance.scoList.length) return;

        var oldIframe = document.getElementById(instance.manifest.id);
        if (oldIframe) {
            oldIframe.parentNode.removeChild(oldIframe);
        }

        jQuery('#multi-sco-nav').remove();

        instance.currentScoIndex = index;
        var sco = instance.scoList[index];
        instance.activeScoId = sco.identifier;

        if (!instance.allScoStates[instance.activeScoId]) {
            instance.allScoStates[instance.activeScoId] = {};
        }

        instance.allScoStates[instance.activeScoId]._finished = false;

        var globalConfigObj = EkstepRendererAPI.getGlobalConfig();
        var prefix_url = isbrowserpreview
            ? this.getAsseturl(instance.data)
            : globalConfigObj.basepath;



        var path = prefix_url + '/' + sco.href;

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

        jQuery('#multi-sco-nav').remove();

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

        var isFirstSco = instance.currentScoIndex === 0;
        var prevButtonHtml = '';

        if (isFirstSco) {
            prevButtonHtml = '<div style="width: 40px; height: 40px;"></div>';
        } else {
            prevButtonHtml = '<button id="sco-prev" style="pointer-events: auto; background: none; border: none; cursor: pointer; padding: 0;"><img src="assets/icons/previous.png" style="width: 40px; height: 40px;"></button>';
        }

        var navHtml = '<div id="multi-sco-nav" style="position: absolute; top: 50%; transform: translateY(-50%); width: 100%; display: flex; justify-content: space-between; padding: 0 10px; box-sizing: border-box; pointer-events: none; z-index: 9999;">' +
            prevButtonHtml +
            nextButtonHtml +
            '</div>';

        jQuery('#gameArea').append(navHtml);

        if (!isFirstSco) {
            jQuery('#sco-prev').click(function () {
                instance.navigateToSCO(instance.currentScoIndex - 1);
            });
        }

        if (isLastSco) {
            jQuery('#sco-complete').click(function () {
                EkstepRendererAPI.dispatchEvent('renderer:content:end');
            });
        } else {
            jQuery('#sco-next').click(function () {
                instance.navigateToSCO(instance.currentScoIndex + 1);
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