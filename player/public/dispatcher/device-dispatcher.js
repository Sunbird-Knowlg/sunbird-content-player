org.ekstep.contentrenderer.deviceDispatcher = new(org.ekstep.contentrenderer.IDispatcher.extend({
    type: "deviceDispatcher",
    initDispatcher: function() {},
    dispatch: function(event) {        
        event = (typeof event === "string") ? event : JSON.stringify(event);
        if(event.eid.toUpperCase() === "FEEDBACK")
            telemetry.send(event, "sendFeedback");
        else
            telemetry.send(event, "sendTelemetry");    
        
    }
}));
