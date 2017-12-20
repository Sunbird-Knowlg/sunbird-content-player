org.ekstep.contentrenderer.deviceDispatcher = new(org.ekstep.contentrenderer.IDispatcher.extend({
    type: "deviceDispatcher",
    initDispatcher: function() {},
    dispatch: function(event) {        
        var eventStr = (typeof event === "string") ? event : JSON.stringify(event);
        if(event.eid.toUpperCase() === "FEEDBACK")
            telemetry.send(eventStr, "sendFeedback");
        else
            telemetry.send(eventStr, "sendTelemetry");    
        
    }
}));
