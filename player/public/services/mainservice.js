/**
 * @author Manjunath Davanam <manjunathd@ilimi.in>
 */
var renderer_services = function() {};
window.org.ekstep.services = new renderer_services();
renderer_services = undefined;
org.ekstep.services.init = function() {
    if (typeof cordova == 'undefined') {
        if (typeof isbrowserpreview == 'undefined') {
            if (typeof AppConfig == 'undefined') {
                org.ekstep.services.rendererservice = org.ekstep.services.htmlservice;
            } else {
                org.ekstep.services.rendererservice = org.ekstep.services.local;
            }
        } else {
            org.ekstep.services.rendererservice = org.ekstep.services.web;
        }
    } else {
        org.ekstep.services.rendererservice = genieservice;
    }
};
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
