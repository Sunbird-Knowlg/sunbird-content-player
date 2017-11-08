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
    sendTelemetry: function(telemetryEvent) {
        this._teleData.push(telemetryEvent);
        if((telemetryEvent.eid.toUpperCase() == "OE_END") || (this._teleData.length >= Telemetry.config.batchsize)) {
            var telemetryData = this._teleData;
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
                data: telemetryObj
            }).done(function(resp) {
                this._teleData = [];
                console.log("Telemetry API success", resp);
            }).fail(function(error, textStatus, errorThrown) {
                if (error.status == 403) {
                    console.error("Authentication error " + textStatus);
                } else {
                    console.error("Error while sync of Telemetry: " + textStatus);
                }
            });
        }
    }
}
