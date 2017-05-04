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

     /**
     *   Invoked by framework when plugin instance created/renderered on stage.
     *   Use this plugin to create different shapes like Square, Circle, Rectangle, Polygon, Star etc..
     *   @param data {object} data is input object for the shape plugin.
     *   @memberof TelemetryPlugin
     *   @override
     */
    initPlugin: function(data) {
        console.log("Telemetry plugin init done !!!", TelemetryService._data);
        this._teleData = TelemetryService._data;
        this.generateTelemetryManifest();
    },
    /*
     * generating global scope of the plugin. Called by plugin-fraemwork as the plugin loads.
     * this plugin instance will we available globally
     */
    initialize: function() {
        console.log("Telemetry initialize done !!!", TelemetryService._data);
        this.registerTelemetryEvents();
        TelemetryService._data = _.without(TelemetryService._data,undefined)
        this._teleData = TelemetryService._data;
        this.generateTelemetryManifest();
    },
    registerTelemetryEvents: function() {
        var instance = this;
        EventBus.addEventListener("telemetryEvent", function(data) {
            instance._teleData.push(data.target);
            console.log("instance._teleData: ", instance._teleData);
            instance.generateTelemetryManifest();
        });
    },
    sendTelemetry: function(telemetryData) {
        console.log("telemetryData to send to api", telemetryData);
        genieservice.sendTelemetry().then(function(data) {
           console.log("Telemetry API success", data);
        });
    },
    generateTelemetryManifest: function() {
        if (this._teleData.length >= this._maxTeleInstance) {
            var telemetryData = _.clone(this._teleData);
            this.sendTelemetry(telemetryData);
            this._teleData = [];
        }
    }
});
PluginManager.registerPlugin('telemetry', TelemetryPlugin);
