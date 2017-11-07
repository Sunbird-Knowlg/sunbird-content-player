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

   /**
    * A Constant for max telemetry data to send in one api call
    * @member {number} _maxTeleInstance
    * @memberof TelemetryPlugin
    **/
    _maxTeleInstance : 10,

    /*
     * Holds addition required fileds for telemtry event
     */
    _requiredFields: {},

    updateConfig: function() {
        var did = detectClient();
        this._requiredFields = {};
        this._requiredFields.uid = Telemetry.config.uid;
        this._requiredFields.sid = Telemetry.config.sid;
        this._requiredFields.did = Telemetry.config.did || did;
        TelemetrySyncManager._maxTeleInstance = Telemetry.config.batchsize || TelemetrySyncManager._maxTeleInstance;
        TelemetrySyncManager._maxTeleInstance = (TelemetrySyncManager._maxTeleInstance <10) ? 10 : ((TelemetrySyncManager._maxTeleInstance >1000) ? 1000 : TelemetrySyncManager._maxTeleInstance);
    },
    initialize: function() {
        var instance = this;
        document.addEventListener("telemetryEvent", function(data) {
            data = data.detail;
            data = instance.appendRequiredFields(data);

            instance.addToQueue(data);
        });
    },
    appendRequiredFields: function(data) {
        jQuery.extend(data, this._requiredFields);
        data.mid = 'OE_' + CryptoJS.MD5(JSON.stringify(data)).toString();
        return data;
    },
    sendTelemetry: function(telemetryData) {
        var currentTimeStamp = getCurrentTime();
        var telemetryObj = {
            "id": "ekstep.telemetry",
            "ver": Telemetry._version,
            "ets": currentTimeStamp,
            "events": telemetryData
        };
        var headers = {};
        if ('undefined' != typeof Telemetry.config.authtoken)
            headers["Authorization"] = 'Bearer ' + Telemetry.config.authtoken;

        this.callApi(telemetryObj, headers, function(data) {
           console.log("Telemetry API success", data);
        });
    },
    addToQueue: function(data) {
        this._teleData.push(data);
        if((data.eid.toUpperCase() == "OE_END") || (this._teleData.length >= this._maxTeleInstance)) {
            var telemetryData = jQuery.extend({}, this._teleData);
            this._teleData = [];
            this.sendTelemetry(telemetryData);
        }
    },
    callApi: function(telemetryObj, headersParam, cb) {
        var fullPath = Telemetry.config.host + Telemetry.config.apislug + Telemetry.config.endpoint;
        headersParam['dataType'] = 'json';
        headersParam["Content-Type"] = "application/json";
        jQuery.ajax({
            url: fullPath,
            type: "POST",
            headers: headersParam,
            data: telemetryObj
        }).done(function(resp) {
            cb(resp)
        }).fail(function(error, textStatus, errorThrown) {
            if (error.status == 403) {
                console.error("Authentication error " + textStatus);
            } else {
                console.error("Error while sync of Telemetry: " + textStatus);
            }
        });
    }
}

TelemetrySyncManager.initialize();
