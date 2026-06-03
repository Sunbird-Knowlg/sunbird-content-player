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
    initLauncher: function() {
        EkstepRendererAPI.addEventListener(this._constants.events.launchEvent, this.start, this);
    },
    registerScormMessageListener: function() {
        var instance = this;
        var mimeType = (this.contentMetaData && this.contentMetaData.mimeType) || (window.content && window.content.mimeType) || (typeof content !== 'undefined' && content && content.mimeType);
        if (mimeType === 'application/vnd.ekstep.scorm-archive' && !window.API) {
            this._scormMessageHandler = function(event) {
                // Validate origin: allow local origin or the configured host origin
                var allowedOrigin = EkstepRendererAPI.getGlobalConfig().host || window.location.origin;
                if (event.origin !== window.location.origin && event.origin !== allowedOrigin) return;

                if (event.data && event.data.type === 'SCORM_API') {

                    switch(event.data.method) {
                        case 'LMSInitialize':
                            instance.debugLog("SCORM session started");
                            break;
                        case 'LMSCommit':
                        case 'LMSFinish':
                            instance.debugLog("SCORM API Method called: " + event.data.method);
                            if (event.data.state) {
                                instance.persistScormState(event.data.method, event.data.state);
                            }
                            break;
                    }
                }
            };
            window.addEventListener('message', this._scormMessageHandler, false);
        }
    },
    debugLog: function(message, data) {
        if (EkstepRendererAPI.getGlobalConfig() && EkstepRendererAPI.getGlobalConfig().debug) {
            if (data) {
                console.log(message, data);
            } else {
                console.log(message);
            }
        }
    },
    persistScormState: function(method, stateJson) {
        this.debugLog("Persisting SCORM state on " + method, stateJson);
        EkstepRendererAPI.getTelemetryService().interact(
            "OTHER",
            "scorm_" + method.toLowerCase(),
            "SCORM_" + method.toUpperCase(),
            {
                subtype: "SCORM_" + method.toUpperCase(),
                stageId: EkstepRendererAPI.getCurrentStageId(),
                target: "Content",
                plugin: {
                    id: this.manifest.id,
                    ver: this.manifest.ver
                }
            }
        );
    },
    setupScormAPI: function() {
        var instance = this;
        var scormAPI = null;
        if (window.Scorm12API) {
            try {
                scormAPI = new window.Scorm12API({
                    autocommit: false,
                    autocommitSeconds: 60,
                    lmsCommitUrl: null, // Disabled remote commit
                    dataCommitFormat: 'json',
                    logLevel: 1,
                });

                // Telemetry hooks
                var fireTelemetry = function(eid, edata) {
                    var telemetry = EkstepRendererAPI.getTelemetryService();
                    if (eid === 'END') {
                        if (telemetry && telemetry.end) telemetry.end(edata);
                    } else {
                        if (telemetry && telemetry.interact) {
                            telemetry.interact(edata.type || 'OTHER', edata.id || (edata.subtype || '').toLowerCase(), edata.subtype, edata);
                        }
                    }
                };

                scormAPI.on('LMSSetValue.cmi.core.score.raw', function (element, value) {
                    fireTelemetry('ASSESSMENT', { subtype: 'SCORM_SCORE', score: value });
                });
                scormAPI.on('LMSSetValue.cmi.core.lesson_status', function (element, value) {
                    fireTelemetry('INTERACT', { subtype: 'SCORM_STATUS_CHANGE', status: value });
                });
                scormAPI.on('LMSSetValue.cmi.core.exit', function (element, value) {
                    fireTelemetry('INTERACT', { subtype: 'SCORM_EXIT_CHANGE', exit: value });
                });
                scormAPI.on('LMSSetValue.cmi.*', function (element, value) {
                    if (element.indexOf('cmi.interactions.') === 0 && element.endsWith('.result')) {
                        fireTelemetry('INTERACT', { subtype: 'SCORM_INTERACTION_RESULT', result: value });
                    }
                });
                scormAPI.on('LMSCommit', function () {
                    fireTelemetry('INTERACT', { subtype: 'SCORM_COMMIT', state: scormAPI.runtimeData });
                });
                scormAPI.on('LMSFinish', function () {
                    fireTelemetry('END', { subtype: 'SCORM_FINISH', state: scormAPI.runtimeData });
                });
            } catch (error) {
                console.error('Error initializing SCORM API:', error);
            }
        }

        window.API = {
            LMSInitialize: function() {
                if (instance.currentScoIndex === 0) {
                    return scormAPI ? scormAPI.LMSInitialize() : "true";
                }
                return "true";
            },
            LMSGetValue: function(k) {
                var val = instance.allScoStates[instance.activeScoId][k];
                if (k === 'cmi.core.lesson_status' && !val) return 'not attempted';
                if (val) return val;
                return scormAPI ? scormAPI.LMSGetValue(k) : "";
            },
            LMSSetValue: function(k, v) {
                instance.allScoStates[instance.activeScoId][k] = v;
                instance.debugLog("SCORM: LMSSetValue", k + "=" + v);
                return scormAPI ? scormAPI.LMSSetValue(k, v) : "true";
            },
            LMSCommit: function() {
                instance.persistScormState('LMSCommit', JSON.stringify(instance.allScoStates[instance.activeScoId]));
                return scormAPI ? scormAPI.LMSCommit() : "true";
            },
            LMSFinish: function() {
                instance.persistScormState('LMSFinish', JSON.stringify(instance.allScoStates[instance.activeScoId]));
                
                // Only terminate the actual session if this is the last SCO
                var isLastSco = instance.currentScoIndex === instance.scoList.length - 1;
                if (isLastSco) {
                    var result = scormAPI ? scormAPI.LMSFinish() : "true";
                    // Notify player that content has finished
                    EkstepRendererAPI.dispatchEvent('renderer:content:end');
                    return result;
                }
                return "true";
            },
            LMSGetLastError: function() { return scormAPI ? scormAPI.LMSGetLastError() : "0"; },
            LMSGetErrorString: function(e) { return scormAPI ? scormAPI.LMSGetErrorString(e) : "No error"; },
            LMSGetDiagnostic: function(e) { return scormAPI ? scormAPI.LMSGetDiagnostic(e) : "No diagnostic"; }
        };
    },
    start: function() {
        this._super();
        this.registerScormMessageListener();
        var instance = this;
        data = content;
        this.reset();
        
        instance.allScoStates = {};
        instance.scoList = [];
        instance.currentScoIndex = 0;
        if (data.scoList) {
            try {
                instance.scoList = typeof data.scoList === 'string' ? JSON.parse(data.scoList) : data.scoList;
            } catch (e) {
                instance.debugLog("SCORM: Error parsing scoList", e);
            }
        }
        
        if (instance.scoList.length === 0) {
            instance.scoList = [{ identifier: 'default', title: 'Default', href: data.launchFile || 'index.html' }];
        }
        
        instance.scoList.forEach(function(sco) {
            instance.allScoStates[sco.identifier] = {};
        });
        
        jQuery(this.manifest.id).remove();

        if (data.mimeType === 'application/vnd.ekstep.scorm-archive') {
            this.setupScormAPI();
        }
        
        instance.navigateToSCO(0);

        var obj = {"tempName": ""};
        EkstepRendererAPI.dispatchEvent("renderer:navigation:load", obj);
    },
    navigateToSCO: function(index) {
        var instance = this;
        if (!instance.scoList || index < 0 || index >= instance.scoList.length) return;

        instance.currentScoIndex = index;
        var sco = instance.scoList[index];
        instance.debugLog("SCORM: Loading SCO", sco);
        
        if (instance.activeScoId) {
            instance.persistScormState('LMSFinish', JSON.stringify(instance.allScoStates[instance.activeScoId]));
        }
        
        instance.activeScoId = sco.identifier;
        if (!instance.allScoStates[instance.activeScoId]) {
            instance.allScoStates[instance.activeScoId] = {};
        }
        
        var isMobile = window.cordova ? true : false;
        var envHTML = isMobile ? "app" : "portal";
        var launchData = { "env": envHTML, "envpath": 'dev' };
        var globalConfigObj = EkstepRendererAPI.getGlobalConfig();
        var prefix_url = isbrowserpreview ? this.getAsseturl(data) : globalConfigObj.basepath;
        
        var launchFile = sco.href;
        var playerParams = 'contentId=' + encodeURIComponent(data.identifier) + 
                          '&launchData=' + encodeURIComponent(JSON.stringify(launchData)) + 
                          '&appInfo=' + encodeURIComponent(JSON.stringify(GlobalContext.config.appInfo));
        var path;
        
        if (launchFile === 'shared/assessmenttemplate.html') {
            var folderMap = {
                'playing': 'Playing',
                'etiquette': 'Etiquette',
                'havingfun': 'HavingFun',
                'handicapping': 'Handicapping'
            };
            var folder = folderMap[sco.identifier.split('_')[0]];
            path = prefix_url + '/' + launchFile + '?questions=' + folder + '#' + playerParams;
        } else {
            path = prefix_url + '/' + launchFile + '#' + playerParams;
        }
        
        if (isbrowserpreview) {
            path += "&flavor=" + "t=" + getTime();
        }
        
        instance.debugLog("SCORM: Trying to load path: " + path);
        
        var oldIframe = document.getElementById(this.manifest.id);
        if (oldIframe) {
            oldIframe.parentNode.removeChild(oldIframe);
        }
        
        var iframe = document.createElement('iframe');
        iframe.src = path;
        
        // Let baseLauncher handle insertion and overlay config via validateSrc
        this.validateSrc(path, iframe);
    },
    validateSrc: function(path, iframe) {
        var instance = this;
        org.ekstep.pluginframework.resourceManager.loadResource(path, 'TEXT', function(err, data) {
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
    configOverlay: function() {
        var instance = this;
        setTimeout(function() {
            EkstepRendererAPI.dispatchEvent("renderer:overlay:show");
            EkstepRendererAPI.dispatchEvent('renderer:stagereload:hide');
            
            EkstepRendererAPI.dispatchEvent('renderer:next:hide');
            EkstepRendererAPI.dispatchEvent('renderer:previous:hide');
            
            if (instance.scoList && instance.scoList.length > 1) {
                instance.showMultiScoNavigation();
            }
        }, 100)
    },
    showMultiScoNavigation: function() {
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
        
        jQuery('#sco-prev').click(function() {
            if (instance.currentScoIndex > 0) {
                instance.navigateToSCO(instance.currentScoIndex - 1);
            }
        });
        
        if (isLastSco) {
            jQuery('#sco-complete').click(function() {
                EkstepRendererAPI.dispatchEvent('renderer:content:end');
            });
        } else {
            jQuery('#sco-next').click(function() {
                if (instance.currentScoIndex < instance.scoList.length - 1) {
                    instance.navigateToSCO(instance.currentScoIndex + 1);
                }
            });
        }
    },

    getAsseturl: function(content) {
        var globalConfigObj = EkstepRendererAPI.getGlobalConfig();
        var path = globalConfigObj.host + globalConfigObj.s3ContentHost + this.s3_folders[content.mimeType];
        path += content.status == "Live" ? content.identifier + "-latest" : content.identifier + "-snapshot";
        return path;
    },
    end: function() {
        this.currentIndex = 100;
        this.totalIndex = 100;
        this._super();
    },
    contentProgress: function() {
        return this.progres(this.currentIndex, this.totalIndex);
    },
    reset: function() {
        this.currentIndex = 50;
        this.totalIndex = 100;
    },
    cleanUp: function() {
        this._super();
        // Remove the listener to prevent memory leaks
        if (this._scormMessageHandler) {
            window.removeEventListener('message', this._scormMessageHandler, false);
            this._scormMessageHandler = null;
        }
        EkstepRendererAPI.dispatchEvent('renderer:next:show')
        EkstepRendererAPI.dispatchEvent('renderer:previous:show')
    }
});
//# sourceURL=HTMLRendererePlugin.js