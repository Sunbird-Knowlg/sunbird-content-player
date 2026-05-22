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
        
        // --- Multi-SCO initialization ---
        instance.allScoStates = {};
        instance.scoList = [];
        if (data.scoList) {
            try {
                instance.scoList = typeof data.scoList === 'string' ? JSON.parse(data.scoList) : data.scoList;
            } catch (e) {
                instance.debugLog("SCORM: Error parsing scoList", e);
            }
        }
        
        if (instance.scoList.length === 0) {
            // Fallback for single-SCO packages
            instance.scoList = [{ identifier: 'default', title: 'Default', href: data.launchFile || 'index.html' }];
        }
        
        instance.activeScoId = instance.scoList[0].identifier;
        instance.scoList.forEach(function(sco) {
            instance.allScoStates[sco.identifier] = {};
        });
        
        // --- End Multi-SCO initialization ---
        
        jQuery(this.manifest.id).remove();

        if (data.mimeType === 'application/vnd.ekstep.scorm-archive') {
            if (!window.API) {
                window.API = {
                    LMSInitialize: function() { instance.debugLog("SCORM: LMSInitialize"); return "true"; },
                    LMSGetValue: function(k) { return instance.allScoStates[instance.activeScoId][k] || ""; },
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
            } else {
                instance.debugLog("SCORM: window.API already exists, skipping legacy implementation.");
            }
        }
        
        instance.loadSco(instance.activeScoId);

        var obj = {"tempName": ""};
        EkstepRendererAPI.dispatchEvent("renderer:navigation:load", obj);
    },
    
    loadSco: function(scoId) {
        var instance = this;
        var sco = instance.scoList.find(function(s) { return s.identifier === scoId; });
        if (!sco) return;

        instance.debugLog("SCORM: Loading SCO", sco);
        
        // Persist current SCO state before switching
        if (instance.activeScoId) {
            instance.persistScormState('LMSFinish', JSON.stringify(instance.allScoStates[instance.activeScoId]));
        }
        
        instance.activeScoId = scoId;
        
        var isMobile = window.cordova ? true : false;
        var envHTML = isMobile ? "app" : "portal";
        var launchData = { "env": envHTML, "envpath": 'dev' };
        var globalConfigObj = EkstepRendererAPI.getGlobalConfig();
        var prefix_url = isbrowserpreview ? this.getAsseturl(data) : globalConfigObj.basepath;
        
        var launchFile = sco.href;
        
        var path = prefix_url + '/' + launchFile + '?contentId=' + data.identifier + '&launchData=' + JSON.stringify(launchData) + "&appInfo=" + JSON.stringify(GlobalContext.config.appInfo);
        if (isbrowserpreview) {
            path += "&flavor=" + "t=" + getTime();
        }
        
        instance.debugLog("SCORM: Trying to load path: " + path);
        
        // --- Clean up / Wipe and Recreate ---
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
        setTimeout(function() {
            EkstepRendererAPI.dispatchEvent("renderer:overlay:show");
            EkstepRendererAPI.dispatchEvent('renderer:stagereload:hide');
            EkstepRendererAPI.dispatchEvent('renderer:next:hide');
            EkstepRendererAPI.dispatchEvent('renderer:previous:hide');
        }, 100)
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