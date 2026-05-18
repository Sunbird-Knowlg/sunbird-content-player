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
        var instance = this;
        window.addEventListener('message', function(event) {
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
        var instance = this;
        data = content;
        this.reset();
        if (data.mimeType === 'application/vnd.ekstep.scorm-archive' && !window.API) {
            var scormState = {};
            window.API = {
                LMSInitialize: function() { instance.debugLog("SCORM: LMSInitialize"); return "true"; },
                LMSGetValue: function(k) { return scormState[k] || ""; },
                LMSSetValue: function(k, v) { scormState[k] = v; instance.debugLog("SCORM: LMSSetValue", k + "=" + v); return "true"; },
                LMSCommit: function() { instance.persistScormState('LMSCommit', JSON.stringify(scormState)); return "true"; },
                LMSFinish: function() { instance.persistScormState('LMSFinish', JSON.stringify(scormState)); return "true"; },
                LMSGetLastError: function() { return "0"; },
                LMSGetErrorString: function(e) { return "No error"; },
                LMSGetDiagnostic: function(e) { return "No diagnostic"; }
            };
        }
        var isMobile = window.cordova ? true : false;
        var envHTML = isMobile ? "app" : "portal";
        var launchData = { "env": envHTML, "envpath": 'dev' };
        var globalConfigObj = EkstepRendererAPI.getGlobalConfig();
        var prefix_url = isbrowserpreview ? this.getAsseturl(data) : globalConfigObj.basepath;
        var launchFile = data.launchFile || 'index.html';
        var path = prefix_url + '/' + launchFile + '?contentId=' + data.identifier + '&launchData=' + JSON.stringify(launchData) + "&appInfo=" + JSON.stringify(GlobalContext.config.appInfo);
        if (isbrowserpreview) {
            path += "&flavor=" + "t=" + getTime();
        }
        jQuery(this.manifest.id).remove();
        var iframe = document.createElement('iframe');
        iframe.src = path;
        iframe.onload = function() {
            instance.debugLog("Iframe loaded");
        };
        this.validateSrc(path, iframe);
        var obj = {"tempName": ""};
        EkstepRendererAPI.dispatchEvent("renderer:navigation:load", obj);
        setTimeout(function() {
            jQuery('custom-previous-navigation').hide();
            jQuery('custom-next-navigation').hide();
        }, 100);
    },
    startTelemetry: function() {
        this._super();
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