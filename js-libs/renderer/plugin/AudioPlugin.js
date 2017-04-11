/**
 * Plugin to play the audio on canvas using AudioManager. 
 * @class AudioPlugin
 * @extends EkstepRenderer.Plugin
 * @author Vinu Kumar V S <vinu.kumar@tarento.com>
 */

var AudioPlugin = Plugin.extend({

    /**
     * This explains the type of the plugin 
     * @member {String} _type
     * @memberof AudioPlugin
     */
    _type: 'audio',

    /**
     * This explains audio is container or not. 
     * @member {boolean} _isContainer.
     * default value for this is false.
     * @memberof AudioPlugin
     */
    _isContainer: false,

    /**
     * This explains audio instance identifier. 
     * @member {String} _id
     * @memberof AudioPlugin
     */
    _id: undefined,

    /**
     * This explains Defalult state of audio. 
     * @member {String} _state
     * @memberof AudioPlugin
     */
    _state: 'stop',

    /**
     * This explains audio should render on canvas,
     * default it is set to false 
     * @member {boolean} _render
     * @memberof AudioPlugin
     */
    _render: false,

    /**
     *   Invoked by framework when plugin instance created/renderered on stage,
     *   Use this plugin to play the audio on stage.
     *   @param data {object} data is input object for the audio plugin.
     *   @memberof AudioPlugin
     *   @override
     */
    initPlugin: function(data) {
        this._id = data.asset;
    },

    /**
     *   Use this method to play the audio on stage.
     *   By passing action object from from the play command.
     *   @param action {object} action is input object for the audio to play.
     *   @memberof AudioPlugin
     */
    play: function(action) {
        AudioManager.play(action);
    },

    /**
     *   Use this method to toggelPlay the audio on stage
     *   by passing action object from from the togglePlay command.
     *   @param action {object} action is input object for toggelPlay of audio.
     *   @memberof AudioPlugin
     */
    togglePlay: function(action) {
        AudioManager.togglePlay(action);
    },

    /**
     *   Use this method to pause the audio on stage.
     *   by passing action object from the pause command.
     *   @param action {object} action is input object to pause the particular audio instance.
     *   @memberof AudioPlugin
     */
    pause: function(action) {
        AudioManager.pause(action);

    },

    /**
     *   Use this method to stop the audio on stage.
     *   by passing action object from the stop command.
     *   @param action {object} action is input object to stop the particular audio instance.
     *   @memberof AudioPlugin
     */
    stop: function(action) {
        if (action.sound === true) {
            AudioManager.stopAll(action);
        } else {
            AudioManager.stop(action);
        }
    },

    /**
     *   Use this method to stop all currently playing audio instances on stage.
     *   @memberof AudioPlugin
     */
    stopAll: function(action) {
        AudioManager.stopAll(action);
    }

});
PluginManager.registerPlugin('audio', AudioPlugin);