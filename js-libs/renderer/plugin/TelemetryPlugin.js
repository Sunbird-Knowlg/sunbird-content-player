/**
 * Plugin to create different shapes on canvas using createJS graphics object.
 * @class TelemetryPlugin
 * @extends EkstepRenderer.Plugin
 * @author Krushanu Mohapatra V S <Krushanu.Mohapatra@tarento.com>
 */
var TelemetryPlugin = Plugin.extend({

     /**
     * This explains the type of the plugin.
     * @member {String} _type.
     * @memberof TelemetryPlugin
     */
    _type: 'telemetry',

    /**
     * This explains plugin is container OR not.
     * @member {boolean} _isContainer
     * @memberof TelemetryPlugin
     */
    _isContainer: false,

    /**
     * This explains plugin should render on canvas OR not.
     * @member {boolean} _render
     * @memberof TelemetryPlugin
     */
    _render: true,

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

     /**
     *   Invoked by framework when plugin instance created/renderered on stage.
     *   Use this plugin to create different shapes like Square, Circle, Rectangle, Polygon, Star etc..
     *   @param data {object} data is input object for the shape plugin.
     *   @memberof TelemetryPlugin
     *   @override
     */
    initPlugin: function(data) {
        console.log("Telemetry plugin init done !!!");
    },
    /*
     * generating global scope of the plugin. Called by plugin-fraemwork as the plugin loads.
     * this plugin instance will we available globally
     */
    initialize: function(){
        EkstepRendererAPI.addEventListener('telemetryPlugin:intialize', this.initializeTelemetryPlugin, this);
    },
    initializeTelemetryPlugin: function() {
        if ("undefined" == typeof cordova) {
            this.listenTelementryEvent();
            var did = detectClient();
            this._requiredFields = {};
            var extConfig = EkstepRendererAPI.getPreviewData();
            this._requiredFields.uid = extConfig.context.uid || "anonymous";
            this._requiredFields.sid = extConfig.context.sid || CryptoJS.MD5(Math.random().toString()).toString();
            this._requiredFields.did = extConfig.context.did || CryptoJS.MD5(JSON.stringify(did)).toString();
        }
    },
    listenTelementryEvent: function() {
        var instance = this;
        EventBus.addEventListener("telemetryEvent", function(data) {
            data = JSON.parse(data.target);
            data = instance.appendRequiredFields(data);

            instance.addToQueue(data);
        });
    },
    appendRequiredFields: function(data){
        //updating sid, did, uid and mid to the telemetry event object
        _.extend(data, this._requiredFields);
        data.mid = 'OE_' + CryptoJS.MD5(JSON.stringify(data)).toString();
        return data;
    },
    sendTelemetry: function(telemetryData) {
        var currentTimeStamp = new Date().getTime();
        var teleObj = {
            "id": "ekstep.telemetry",
            "ver": "2.0",
            "ets": currentTimeStamp,
            "events": telemetryData
        };
        // "events": JSON.parse(telemetryData)
        // console.log("teleObj to send to api", teleObj);
        var configuration = EkstepRendererAPI.getPreviewData();
        var headers = {};
        if (!_.isUndefined(configuration.context.authToken)) {
            headers["Authorization"] = 'Bearer ' + configuration.context.authToken;
        }
        genieservice.sendTelemetry(teleObj, headers).then(function(data) {
           console.log("Telemetry API success", data);
        });
    },
    addToQueue: function(data) {
        this._teleData.push(data);
        if((data.eid.toUpperCase() == "OE_END") || (this._teleData.length >= this._maxTeleInstance)) {
            var telemetryData = _.clone(this._teleData);
            this._teleData = [];
            this.sendTelemetry(telemetryData);
        }
    }

});
PluginManager.registerPlugin('telemetry', TelemetryPlugin);
