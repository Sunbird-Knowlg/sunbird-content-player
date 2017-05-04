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
    *   Invoked by framework when plugin instance created/renderered on stage.
    *   Use this plugin to create different shapes like Square, Circle, Rectangle, Polygon, Star etc..
    *   @param data {object} data is input object for the shape plugin.
    *   @memberof TelemetryPlugin
    *   @override
    */

    /**
     * A Constant for max telemetry data to send in one api call
     * @member {number} _maxTeleInstance
     * @memberof TelemetryPlugin
     **/
     _maxTeleInstance : 10,

    initPlugin: function(data) {
        this.registerTelemetryEvents();
        this._teleData = TelemetryService._data;
        var instance = this;
        this.generateTelemetryManifest();
    },
    // initialize: function() {
    //     console.log("Telemetry plugin initialize done!!!");
    //     var instance = this;
    //     // console.log("_teledata: ", TelemetryService._data);
    //     EventBus.addEventListener("telemetryEvent", function(data) {
    //         instance._teleData.push(data.terget);
    //         console.log("instance._teleData: ", instance._teleData);
    //     });
    // },
    registerTelemetryEvents: function() {
        console.log("Telemetry plugin initialize done!!!");
        var instance = this;
        // console.log("_teledata: ", TelemetryService._data);
        EventBus.addEventListener("telemetryEvent", function(data) {
            instance._teleData.push(data.target);
            console.log("instance._teleData: ", instance._teleData);
            instance.generateTelemetryManifest();
        });
    },
    sendTelemetry: function(telemetryData) {
        console.log("telemetryData to send to api", telemetryData)
    },
    generateTelemetryManifest: function() {
        if (this._teleData.length >= this._maxTeleInstance) {
                var telemetryData = _.clone(this._teleData);
                this._teleData.splice(0,this._maxTeleInstance);
                this.sendTelemetry(telemetryData);
            }
    }
});
PluginManager.registerPlugin('telemetry', TelemetryPlugin);
