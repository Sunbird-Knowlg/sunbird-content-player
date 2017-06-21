/**
 * @author Manjunath Davanam <manjunathd@ilimi.in>
 */
var renderer_services = function() {};
window.org.ekstep.service = new renderer_services();
renderer_services = undefined;

org.ekstep.service.mainService = Class.extend({
    init: function(config) {
        this.initService(config);
    },
    initService: function(config) {},
    initialize: function(){
        console.info('main service is intialized');
    }, 
});

/*org.ekstep.service.init should be part of rendrer-bootstarp.js*/
org.ekstep.service.init = function() {
    if (typeof cordova == 'undefined') {
        if (typeof isbrowserpreview == 'undefined') {
            if (typeof AppConfig == 'undefined') {
                org.ekstep.service.renderer = org.ekstep.service.html;
            } else {
                org.ekstep.service.renderer = org.ekstep.service.local;
            }
        } else {
            org.ekstep.service.renderer = org.ekstep.service.web;
        }
    } else {
        org.ekstep.service.renderer = genieservice;
    }
};

/*TODO: Telemetry_web should be part of telemetryservice*/
telemetry_web = {
    tList: [],
    send: function(string) {
        EventBus.dispatch("telemetryEvent",string);
        console.log(string);
        return new Promise(function(resolve, reject) {
            telemetry_web.tList.push(string);
            resolve(true);
        });
    }
};
if ("undefined" == typeof cordova) telemetry = telemetry_web;
