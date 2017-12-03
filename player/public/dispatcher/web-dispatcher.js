org.ekstep.contentrenderer.webDispatcher = new(org.ekstep.contentrenderer.IDispatcher.extend({
    type: "webDispatcher",
    initDispatcher: function() {},
    dispatch: function(event) {        
        event = (typeof event === "string") ? event : JSON.stringify(event);
        if ("undefined" != typeof telemetry) {
            TelemetryService.eventDispatcher('telemetryEvent', JSON.stringify(instance.event));
            telemetry.send(JSON.stringify(this.event), apiName).then(function() {
                return JSON.stringify(this.event);
            }).catch(function(err) {
                if(instance.event.uid){    // TODO Find the Unknow events from(Jquery/cordova/ionic)
                     TelemetryService.logError(instance.name, err);
                }else{
                    console.warn("uid is not Present",instance.event);
                }
            });
        } else {
            console.log(JSON.stringify(this.event));
        }
    }
}));
