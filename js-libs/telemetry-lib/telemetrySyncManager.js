/**
 * This is responsible for syncing of Telemetry
 * @class TelemetrySyncManager
 * @author Krushanu Mohapatra <Krushanu.Mohapatra@tarento.com>
 */

var TelemetrySyncManager = {

    /**
     * This is the telemetry data for the perticular stage.
     * @member {object} _teleData
     * @memberof TelemetryPlugin
     */
    _teleData: [],
    init: function() {
        var instance = this;
        document.addEventListener('TelemetryEvent', this.sendTelemetry);
    },
    sendTelemetry: function(event) {
        var telemetryEvent = event.detail;
        console.log("Telemetry Events ", telemetryEvent);
        var instance = TelemetrySyncManager;
        instance._teleData.push(Object.assign({}, telemetryEvent));
        if ((telemetryEvent.eid.toUpperCase() === "END") || (instance._teleData.length >= Telemetry.config.batchsize)) {
            TelemetrySyncManager.syncEvents();
        }
    },
    updateEventStack: function(events) {
        TelemetrySyncManager._teleData = TelemetrySyncManager._teleData.concat(events);
    },
    syncEvents: function() {
        var Telemetry = EkTelemetry || Telemetry;
        var instance = TelemetrySyncManager;
        var telemetryData = instance._teleData.splice(0, Telemetry.config.batchsize);
        var telemetryObj = {
            "id": "ekstep.telemetry",
            "ver": Telemetry._version,
            "ets": (new Date()).getTime(),
            "events": telemetryData
        };
        var headersParam = {};
        if ('undefined' != typeof Telemetry.config.authtoken)
            headersParam["Authorization"] = 'Bearer ' + Telemetry.config.authtoken;

        var fullPath = Telemetry.config.host + Telemetry.config.apislug + Telemetry.config.endpoint;
        headersParam['dataType'] = 'json';
        headersParam["Content-Type"] = "application/json";
        jQuery.ajax({
            url: fullPath,
            type: "POST",
            headers: headersParam,
            data: JSON.stringify(telemetryObj)
        }).done(function(resp) {
            console.log("Telemetry API success", resp);
        }).fail(function(error, textStatus, errorThrown) {
            instance.updateEventStack(telemetryData);
            if (error.status == 403) {
                console.error("Authentication error: ", error);
            } else {
                console.log("Error while Telemetry sync to server: ", error);
            }
        });
    }
}
if (typeof document != 'undefined') {
    TelemetrySyncManager.init();
}