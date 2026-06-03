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
            window.addEventListener('message', function(event) {
                // Validate origin
                if (event.origin !== window.location.origin) return;

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
            }, false);
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
            if (!window.API) {
                window.API = {
                    LMSInitialize: function() { instance.debugLog("SCORM: LMSInitialize"); return "true"; },
                    LMSGetValue: function(k) { 
                        var val = instance.allScoStates[instance.activeScoId][k];
                        if (k === 'cmi.core.lesson_status' && !val) return 'not attempted';
                        return val || ""; 
                    },
                    LMSSetValue: function(k, v) { 
                        instance.allScoStates[instance.activeScoId][k] = v; 
                        instance.debugLog("SCORM: LMSSetValue", k + "=" + v); 
                        return "true"; 
                    },
                    LMSCommit: function() { instance.persistScormState('LMSCommit', JSON.stringify(instance.allScoStates[instance.activeScoId])); return "true"; },
                    LMSFinish: function() { instance.persistScormState('LMSFinish', JSON.stringify(instance.allScoStates[instance.activeScoId])); return "true"; },
                    LMSGetLastError: function() { return "0"; },
                    LMSGetErrorString: function(e) { return "No error"; },
                    LMSGetDiagnostic: function(e) { return "No diagnostic"; }
                };
            }
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
        var queryParams = 'contentId=' + encodeURIComponent(data.identifier) + 
                          '&launchData=' + encodeURIComponent(JSON.stringify(launchData)) + 
                          '&appInfo=' + encodeURIComponent(JSON.stringify(GlobalContext.config.appInfo));
        var path = prefix_url + '/' + launchFile + '?' + queryParams;
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
            
            if (instance.scoList && instance.scoList.length > 1) {
                EkstepRendererAPI.dispatchEvent('renderer:next:hide');
                EkstepRendererAPI.dispatchEvent('renderer:previous:hide');
                instance.showMultiScoNavigation();
            } else {
                EkstepRendererAPI.dispatchEvent('renderer:next:hide');
                EkstepRendererAPI.dispatchEvent('renderer:previous:hide');
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

        var navHtml = '<div id="multi-sco-nav" style="position: absolute; top: 50%; transform: translateY(-50%); width: 100%; display: flex; justify-content: space-between; padding: 0 10px; box-sizing: border-box; pointer-events: none;">' +
                      '<button id="sco-prev" style="pointer-events: auto; background: none; border: none; cursor: pointer; padding: 0;" ' + (instance.currentScoIndex === 0 ? 'disabled style="opacity: 0.5; pointer-events: none;"' : '') + '><img src="assets/icons/previous.png" style="width: 40px; height: 40px;"></button>' +
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
        EkstepRendererAPI.dispatchEvent('renderer:next:show')
        EkstepRendererAPI.dispatchEvent('renderer:previous:show')
    }
});
//# sourceURL=HTMLRendererePlugin.js