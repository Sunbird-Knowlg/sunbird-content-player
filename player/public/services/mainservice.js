/**
 * @author Manjunath Davanam <manjunathd@ilimi.in>
 */
var renderer_services = function() {};
window.org.ekstep.service = new renderer_services();
renderer_services = undefined;

org.ekstep.service.mainService = Class.extend({
    getAPISlug: function() {
        var globalConfig = EkstepRendererAPI.getGlobalConfig();
        return globalConfig.apislug;
    },
    init: function(config) {
        this.initService(config);
    },
    initService: function(config) {},
    initialize: function(){
    }
});
org.ekstep.service.init = function() {
    if (typeof cordova !== 'undefined') {
        org.ekstep.service.renderer = genieservice;
    }
};

/*TODO: Telemetry_web should be part of telemetryservice*/
telemetry_web = {
    tList: [],
    send: function(string) {
      console.log("V3 Telemetry Event - ", string);
        //EventBus.dispatch("telemetryEvent",string);
        return new Promise(function(resolve, reject) {
            telemetry_web.tList.push(string);
            resolve(true);
        });
    }
};
if ("undefined" == typeof cordova) telemetry = telemetry_web;
