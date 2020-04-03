org.ekstep.contentrenderer.baseLauncher.extend({
    s3_folders: {
        'application/vnd.ekstep.html-archive': "html/",
        'application/vnd.ekstep.h5p-archive': 'h5p/'
    },
    heartBeatData: {},
    currentIndex: 50,
    totalIndex: 100,
    enableHeartBeatEvent: true,
    _constants: {
        mimeType: ["application/vnd.ekstep.html-archive", "application/vnd.ekstep.h5p-archive"],
        events: {
            launchEvent: "renderer:launch:html"
        }
    },
    initLauncher: function() {
        EkstepRendererAPI.addEventListener(this._constants.events.launchEvent, this.start, this);
    },
    start: function() {
        this._super();
        data = content;
        this.reset();
        var isMobile = window.cordova ? true : false;
        var envHTML = isMobile ? "app" : "portal";
        var launchData = { "env": envHTML, "envpath": 'dev' };
        var globalConfigObj = EkstepRendererAPI.getGlobalConfig();
        var prefix_url = isbrowserpreview ? this.getAsseturl(data) : globalConfigObj.basepath;
        var path = prefix_url + '/index.html?contentId=' + data.identifier + '&launchData=' + JSON.stringify(launchData) + "&appInfo=" + JSON.stringify(GlobalContext.config.appInfo);
        if (isbrowserpreview) {
            path += "&flavor=" + "t=" + getTime();
        }
        jQuery(this.manifest.id).remove();
        var iframe = document.createElement('iframe');
        iframe.src = path;
        this.validateSrc(path, iframe);
        var instance = this;
        iframe.contentWindow.addEventListener('message', function(event) {
           instance.postMessageHandler(event, instance);
        });
    },
    validateSrc: function(path, iframe) {
        var instance = this;
        org.ekstep.pluginframework.resourceManager.loadResource(path, 'TEXT', function(err, data) {
            if (err) {
                showToaster("error", "Sorry!!.. Unable to open the Game!", { timeOut: 200000 });
                EkstepRendererAPI.logErrorEvent('index.html file not found.', { 'type': 'content', 'action': 'play', 'severity': 'fatal' });
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
    },
    postMessageHandler: function(event, instance) {
        try{
           var postData = event.data;
           console.log("CP postMessageHandler", postData);
           var isJSON = true;
           try {
               JSON.parse(postData);
           } catch (e) {
               isJSON = false;
           }

           var postMessageData = isJSON ? JSON.parse(postData) : postData.event;
           // if(isJSON && postMessage.event == 'telemetry'){
               //to generate telemetry
               instance.generateTelemetry(postMessageData);
           //     return;
           // }

           var eventName = postMessageData.event.toString();
           window.postMessage(postMessageData.event.toString(), "*");
        } catch(e) {
           // Log telemetry error event
           console.log("Post message failed", e);
        }
        
    },
    generateTelemetry: function(data) {
       console.log('generate Telemetry', data);
       var assessStartEvent = TelemetryService.assess("html.ques.onboarding", undefined, "MEDIUM", {"maxscore":1}).start();
       var resvalues = [];
       var feilds = Object.keys(data.data);
       for (var a = feilds.length, i = 0; i < a; i++) {
           var obj = {};
           obj[i] = data.data[feilds[i]];
           resvalues.push(obj);
       }
       var assessData = {
           pass: true,
           score: 1,
           res: resvalues,
           mmc: [],
           qindex: 1,
           mc: [],
           qtitle: 'HTML question onboarding',
           qdesc: ""
       };
       TelemetryService.assessEnd(assessStartEvent, assessData);

       // if(data.event == 'telemetry') {
       //     switch(data.type){
       //         case 'assessmentStart': assessStartEvent = TelemetryService.assess("html.ques.onboarding", undefined, "MEDIUM", {"maxscore":1}).start();
       //                                 break;
       //         case 'assess':  var data = {
       //                             pass: true,
       //                             score: 1,
       //                             res: [],
       //                             mmc: [],
       //                             qindex: 1,
       //                             mc: [],
       //                             qtitle: 'HTML question onboarding',
       //                             qdesc: ""
       //                         };
       //                         TelemetryService.assessEnd(this.assessStartEvent, data);
       //                         break;
       //     }
       // }       
    }
});
//# sourceURL=HTMLRendererePlugin.js