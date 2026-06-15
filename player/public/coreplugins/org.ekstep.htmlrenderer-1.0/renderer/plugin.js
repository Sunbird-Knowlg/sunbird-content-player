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

    getScormProfile: function () {
        var raw = (this.data && this.data.scormVersion || '1.2').toString();
        var key = raw.indexOf('2004') !== -1 ? '2004' :
            raw.indexOf('1.2') !== -1 ? '1.2' : null;
            
        if (typeof window.SCORM_PROFILES === 'undefined') {
            try {
                var url = org.ekstep.pluginframework.pluginManager.resolvePluginResource(this.manifest.id, this.manifest.ver, "renderer/scormProfiles.js");
                jQuery.ajax({
                    async: false,
                    url: url,
                    dataType: "script",
                    cache: true
                });
            } catch (e) {
                console.error("Failed to load scormProfiles.js synchronously", e);
            }
        }

        if (typeof window.SCORM_PROFILES === 'undefined') {
            console.error("SCORM_PROFILES is not defined. Ensure scormProfiles.js is loaded.");
            return null;
        }

        if (!key || !window.SCORM_PROFILES[key]) {
            console.warn('SCORM: unrecognized version "' + raw + '", defaulting to 1.2');
            key = '1.2';
        }
        return window.SCORM_PROFILES[key];
    },

    initLauncher: function () {
        EkstepRendererAPI.addEventListener(this._constants.events.launchEvent, this.start, this);
        var instance = this;
        instance._unloadHandler = function () {
            instance.isUnloading = true;
        };
        window.addEventListener('beforeunload', instance._unloadHandler);
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

    computeOverallStatus: function () {
        var profile = this.scormProfile;
        var states = this.allScoStates;

        var scoStates = this.scoList.map(function (sco) {
            return states[sco.identifier];
        });

        if (scoStates.some(profile.isFailed)) {
            return 'failed';
        }

        if (scoStates.every(profile.isComplete)) {
            return 'completed';
        }

        return 'incomplete';
    },

    setupScormAPI: function (profile) {
        var instance = this;
        var scormAPI = null;
        var scormSessionStarted = false;

        if (window[profile.wrapperClass]) {
            try {
                scormAPI = new window[profile.wrapperClass]({
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

        window[profile.apiNamespace] = {};
        var api = window[profile.apiNamespace];

        api[profile.methods.init] = function (_) {
            if (!scormSessionStarted) {
                var result = scormAPI ? scormAPI[profile.methods.init]("") : "true";
                if (result === "true" || result === true) {
                    scormSessionStarted = true;
                    instance.fireTelemetry('INTERACT', {
                        type: 'OTHER',
                        subtype: 'SCORM_INITIALIZE',
                        id: 'scorm_initialize',
                        stageId: EkstepRendererAPI.getCurrentStageId(),
                        target: "Content"
                    });
                }
                return String(result);
            }
            return "true";
        };

        api[profile.methods.get] = function (k) {
            var val = instance.allScoStates[instance.activeScoId][k];
            if (val === undefined && profile.defaultState[k] !== undefined) {
                return profile.defaultState[k];
            }
            return val !== undefined ? val : "";
        };

        api[profile.methods.set] = function (k, v) {
            instance.allScoStates[instance.activeScoId][k] = v;

            if (k === profile.scoreKey) {
                instance.fireTelemetry('ASSESSMENT', {
                    type: 'ASSESSMENT',
                    subtype: 'SCORM_SCORE',
                    id: 'scorm_score',
                    score: v
                });
            }

            if (k === profile.statusKey || (profile.successKey && k === profile.successKey)) {
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
                        if (!instance._navShown) {
                            instance._navShown = true;
                            instance.showMultiScoNavigation();
                        }
                    }
                }

                var overallStatus = instance.computeOverallStatus();
                if (!instance.isUnloading && (instance.scoList.length === 1) && (overallStatus === 'completed' || overallStatus === 'passed' || overallStatus === 'failed')) {
                    EkstepRendererAPI.dispatchEvent('renderer:content:end');
                }
            }

            if (k === profile.exitKey) {
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
        };

        api[profile.methods.commit] = function (_) {
            var state = instance.allScoStates[instance.activeScoId];
            if (scormAPI) {
                try {
                    Object.keys(state).forEach(function (k) {
                        if (k !== '_finished') {
                            scormAPI[profile.methods.set](k, state[k]);
                        }
                    });
                    scormAPI[profile.methods.commit]("");
                } catch (e) {
                    console.warn("SCORM: Commit sync skipped (likely post-termination)", e);
                }
            }
            return "true";
        };

        api[profile.methods.finish] = function (_) {
            return instance.handleScoFinish(scormAPI, profile);
        };

        api[profile.methods.lastError] = function () { return scormAPI ? scormAPI[profile.methods.lastError]() : "0"; };
        api[profile.methods.errorString] = function (e) { return scormAPI ? scormAPI[profile.methods.errorString](e) : "No error"; };
        api[profile.methods.diagnostic] = function (e) { return scormAPI ? scormAPI[profile.methods.diagnostic](e) : "No diagnostic"; };
    },

    handleScoFinish: function (scormAPI, profile) {
        var instance = this;
        instance.allScoStates[instance.activeScoId]._finished = true;
        var isLastSco = instance.currentScoIndex === instance.scoList.length - 1;
        if (isLastSco) {
            var overallStatus = instance.computeOverallStatus();
            var result = scormAPI
                ? scormAPI[profile.methods.finish]("")
                : "true";
            if (!instance.isUnloading && (result === "true" || result === true) && (overallStatus === 'completed' || overallStatus === 'passed' || overallStatus === 'failed')) {
                EkstepRendererAPI.dispatchEvent('renderer:content:end');
            }
            return String(result);
        }
        if (instance.scoList && instance.scoList.length > 1) {
            instance.showMultiScoNavigation();
        }
        return "true";
    },

    start: function () {
        this._super();
        var instance = this;
        instance.isUnloading = false;
        instance.data = content;
        instance.scormVersion = instance.data.scormVersion || '1.2';
        var profile = instance.scormProfile = instance.getScormProfile();
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
            instance.allScoStates[sco.identifier] = Object.assign({}, profile.defaultState);
        });

        jQuery(instance.manifest.id).remove();

        if (instance.data.mimeType === 'application/vnd.ekstep.scorm-archive') {
            instance.setupScormAPI(profile);
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
        instance._navShown = false;

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
        if (this._unloadHandler) {
            window.removeEventListener('beforeunload', this._unloadHandler);
        }
        EkstepRendererAPI.dispatchEvent('renderer:next:show');
        EkstepRendererAPI.dispatchEvent('renderer:previous:show');
    }
});