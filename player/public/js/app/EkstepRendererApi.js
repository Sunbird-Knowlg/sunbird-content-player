/**
 * The EkStep Renderer API is the core interface of the plugins with the rest of the render framework. It allows the plugins
 * to access the framework resources, launch popups, and handle events raised by the framework. Plugins should not call any
 * other framework classes directly.
 *
 * @class EkstepRendererAPI
 * @author Vinu Kumar <vinu.kumat@tarento.com>
 */
window.EkstepRendererAPI = {
    baseURL: "",
    /**
     * Register an event listener callback function for the events raised by the framework.
     * @param type {string} name of the event (e.g. org.ekstep.quickstart:configure)
     * @param callback {function} callback function
     * @param scope {object} the scope of the callback (use this)
     * @memberof EkstepRendererAPI
     */
    addEventListener: function(type, callback, scope) {
        EventBus.addEventListener(type, callback, scope);
    },
    /**
     * Fires an event to the framework, allowing other plugins who may have registered to receive the callback notification. All
     * communication between the framework and other plugins is via the events.
     * @param type {string} name of the event to fire (e.g. org.ekstep.quickstart:configure)
     * @param data {object} event data to carry along with the notification
     * @param target {object} the scope of the event (use this)
     * @memberof EkstepRendererAPI
     */
    dispatchEvent: function(type, data, target) {
        EventBus.dispatchEvent(type, data, target);
    },

    /**
     * Returns all event which are being registed on element.
     * empty if the none of the events are being registed.
     * @memberof EkstepRendererAPI
     */
    getEvents: function() {
        return EventBus.getEvents();
    },

    /**
     * Remove an event listener to an event. Plugins should cleanup when they are removed.
     * @param type {string} name of the event registered with (e.g. org.ekstep.quickstart:configure)
     * @param callback {function} remove the callback function
     * @param scope {object} the scope of the event (use this)
     * @memberof EkstepRendererAPI
     */
    /*removeEventListener: function(type, callback, scope) {
        EventBus.removeEventListener(type, callback, scope)
    },*/

    /**
     * Notifies the framework to render the canvas once again. This can be done by the plugin when
     * plugin wants to rendre the content again
     * @memberof EkstepRendererAPI
     */
    render: function() {
        Renderer.theme.update = true;
    },

    /**
     * Returns the content manifest(media). This can be done by the plugin when
     * plugin wants to get the content manifest(media)
     * @memberof EkstepRendererAPI
     */
    getContext: function() {
        return Renderer.theme._data.manifest;
    },

    /**
     * Removes current stage HTML elements. This could be useful when plugins work across stages
     * Using this, a plugin can get access to remove the current stage HTML element such vidoe html element etc.,
     * @memberof EkstepRendererAPI
     */
    removeHtmlElements: function() {
        Renderer.theme.removeHtmlElements();
    },

    /**
     * Reload the rendering of current stage - plugins can request the stages to be reload if any change
     * has been made.
     * @memberof EkstepRendererAPI
     */
    reloadStage: function() {
        EventBus.dispatch('actionReload');
    },

    /**
     * Returns all stages in the current content. This could be useful when plugins work across stages
     * such as timers that work across stages or page number plugins. Using this, a plugin can get access to all
     * stages, and instantiate plugins on each stage.
     * @memberof EkstepRendererAPI
     */
    getAllStages: function() {
        return Renderer.theme._data.stage;
    },

    /**
     * Returns current stage data in the content. This could be useful when plugins work across stages
     * such as timers that work across stages or page number plugins. Using this a plugin can get access to
     * current stage. undefined if the currentStage is not loaded or present.
     * @memberof EkstepRendererAPI
     */
    getCurrentStage: function() {
        return Renderer.theme._currentScene;
    },

    /**
     * Returns current stage ID in the content. This could be useful when plugins can get access to
     * current stage ID.undefined if the currentstageId is not present.
     * @memberof EkstepRendererAPI
     */
    getCurrentStageId: function() {
        return Renderer.theme._currentStage;
    },

    /**
     * Returns current canvas object. This could be useful when plugins can get access to
     * current canvas object properties
     * @memberof EkstepRendererAPI
     */
    getCanvas: function() {
        return document.getElementById('gameCanvas');
    },

    /**
     * Returns current content data. This could be useful when plugins can get access to
     * current content data object
     * @memberof EkstepRendererAPI
     */
    getContentData: function() {
        return Renderer.theme._data;
    },

    /**
     * Returns a plugin instance for the given plugin ID once the plugin registarion/invoke is done. Plugins can use this work with dependencies
     * or build plugins that enhance the behavior of other plugins.
     * @memberof EkstepRendererAPI
     */
    getPluginInstance: function(pluginId) {
        return PluginManager.getPluginObject(pluginId);
    },

    /**
     * Clear the current stage rendered objects, Plugins can get access to
     * current stage canvas object and plugin can clean all current stage rendrered object
     * @memberof EkstepRendererAPI
     */
    cleanRenderer: function() {
        Renderer.cleanUp();
    },

    /**
     * Returns the controller instance based on controller id
     * @param id {string} Controller id to return. Undefined if the Controller has not been registed.
     * @memberof EkstepRendererAPI
     */
    getController: function(id) {
        return ControllerManager.getControllerInstance(id);
    },

    /**
     * Returns the controller instance.
     * Undefined if the currentstage controller has not been registred.
     * @memberof EkstepRendererAPI
     */
    getCurrentController: function() {
        return Renderer.theme._currentScene._stageController;
    },

    /**
     * set the param to scope level.
     * @param scope {string} name of the scope (e.g. stage,theme,app)
     * @paramName {string} name to param to set.
     * @paramName {object} value of the param.
     * @memberof EkstepRendererAPI
     */
    setParam: function(scope, paramName, value) {
        if (scope === 'theme') {
            Renderer.theme.setParam(paramName, value);
        }
        if (scope === 'stage') {
            Renderer.theme._currentScene.setParam(paramName, value);
        }
        if (scope === 'app') {
            GlobalContext.setParam(paramName, value);
        }
    },

    /**
     * Returns the param value based on scope and paramName.
     * empty if the paramValue is not present in the scope.
     * @param scope {string} name of the scope (e.g. stage,theme,app)
     * @paramName {string} name to get from the particular scope.
     * @memberof EkstepRendererAPI
     */
    getParam: function(scope, paramName) {
        var paramData = '';
        if (scope === 'theme') {
            paramData = Renderer.theme.getParam(paramName);
        }
        if (scope === 'stage') {
            paramData = Renderer.theme._currentScene.getParam(paramName);
        }
        if (scope === 'app') {
            paramData = GlobalContext.getParam(paramName);
        }
        return paramData;
    },

    /**
     * Returns the param value based on the scope (e.g. stage,theme,app).
     * empty if the scope is not having param.
     * @memberof EkstepRendererAPI
     */
    getParams: function(scope) {
        var paramData = '';
        if (scope === 'theme') {
            paramData = Renderer.theme._contentParams;
        }
        if (scope === 'stage') {
            paramData = Renderer.theme._currentScene.params;
        }
        if (scope === 'app') {
            paramData = GlobalContext._params;
        }
        return paramData;
    },

    /**
     * Returns state of the param.
     * Undefined if the param is not present is the currentState.
     * @param paramName {string} name of the param.
     * @memberof EkstepRendererAPI
     */
    getState: function(paramName) {
        return Renderer.theme._currentScene.getState(paramName);
    },

    /*--------------------------*/

    /**
     * It takes the value and the param to set its state
     * @param param {string} Param is a string defining the type of question (mcq/mtf/ftb)
     * @param value {object/array} value for mcq and mtf type is an array and for ftb type is an object
     * @param isStateChanged {boolean} state true or false if state is changed
     * @memberof EkstepRendererAPI
     **/
    setState: function(param, value, isStateChanged) {
        Renderer.theme._currentScene.setState(param, value, isStateChanged);
    },

    /**
     * It takes the action as an object and invokes to the renderer
     * @param action {object} pass the complete object required format to execute the actoin
     * @memberof EkstepRendererAPI
     **/
    invokeAction: function(action) {
        CommandManager.handle(action);
    },

    /**
     * Returns the complete telemetry instance
     * @memberof EkstepRendererAPI
     **/
    getTelemetry: function() {
        return TelemetryService;
    },

    /**
     * Returns the complete Telemetry data obj
     * @memberof EkstepRendererAPI
     **/
    getTelemetryData: function() {
        return TelemetryService._data;
    },

    /**
     * Returns the instance of the plugin
     * @param id {string} id is a string defining the name of the plugin
     * @param data {object} data to instantiate plugin
     * @param parent {object} state parent instance
     * @memberof EkstepRendererAPI
     **/
    instantiatePlugin: function(id, data, parent) {
        return PluginManager.invoke(id, data, parent, Renderer.theme._currentScene, Renderer.theme);
    },

    /**
     * Transition command executes with given stage id
     * @param stageId {string} Moves to given stage id
     * @memberof EkstepRendererAPI
     **/
    tansitionTo: function(stageId) {
        var action = {
            "asset": "theme",
            "command": "transitionTo",
            "duration": "100",
            "ease": "linear",
            "effect": "fadeIn",
            "type": "command",
            "pluginId": "theme",
            "value": stageId,
            "transitionType": "next"
        };
        CommandManager.handle(action);
    },

    /**
     * Returns the complete Game area
     * @memberof EkstepRendererAPI
     **/
    getGameArea: function() {
        return document.getElementById('gameArea');;
    },

    /**
     * Returns the complete asset object from the manifest of the given assetId
     * @param assetId {string} assetId of the desired asset
     * @memberof EkstepRendererAPI
     **/
    getAsset: function(assetId) {
        return AssetManager.strategy.assetMap[assetId];
    },

    /**
     * Loads the asset of teh given assetId
     * @param assetId {string} assetId of the desired asset
     * @memberof EkstepRendererAPI
     **/
    loadAsset: function(assetId) {
        var asset = AssetManager.strategy.assetMap[assetId];
        return AssetManager.loadAsset(Renderer.theme._currentStage, asset.id, asset.src);
    },

    /**
     * It takes the assetID of the given audio and plays it
     * @param action {string} assetId is received as a string
     * @memberof EkstepRendererAPI
     **/
    playAudio: function(assetId) {
        var action = {
            "type": "command",
            "command": "play",
            "asset": assetId,
            "disableTelemetry": false,
            "stageInstanceId": Renderer.theme._currentScene._stageInstanceId,
            "stageId": Renderer.theme._currentStage
        };
        AudioManager.play(action);
    },

    /**
     * It takes the assetID of the given audio and pauses it
     * @param action {string} assetId is received as a string
     * @memberof EkstepRendererAPI
     **/
    pauseAudio: function(assetId) {
        var action = {
            "type": "command",
            "command": "pause",
            "asset": assetId,
            "disableTelemetry": false,
            "stageInstanceId": Renderer.theme._currentScene._stageInstanceId,
            "stageId": Renderer.theme._currentStage
        };
        AudioManager.togglePlay(action);
    },

    /**
     * It takes the assetID of the given audio and stops it
     * @param action {string} assetId is received as a string
     * @memberof EkstepRendererAPI
     **/
    stopAudio: function(assetId) {
        var action = {
            "type": "command",
            "command": "stop",
            "asset": assetId,
            "disableTelemetry": false,
            "stageInstanceId": Renderer.theme._currentScene._stageInstanceId,
            "stageId": Renderer.theme._currentStage
        };
        AudioManager.stop(action);
    },

    /**
     * It takes the assetID of the given audio and toggelPlays it
     * @param action {string} assetId is received as a string
     * @memberof EkstepRendererAPI
     **/
    toggelPlayAudio: function(assetId) {
        var action = {
            "type": "command",
            "command": "togglePlay",
            "asset": assetId,
            "disableTelemetry": false,
            "stageInstanceId": Renderer.theme._currentScene._stageInstanceId,
            "stageId": Renderer.theme._currentStage
        };
        AudioManager.togglePlay(action);
    },

    /**
     * It is going to stop all the audios
     * @memberof EkstepRendererAPI
     **/
    stopAllAudio: function() {
        var action = {
            "type": "command",
            "command": "stopAll",
            "asset": "allAssets",
            "disableTelemetry": false,
            "stageInstanceId": Renderer.theme._currentScene._stageInstanceId,
            "stageId": Renderer.theme._currentStage
        };
        AudioManager.stopAll(action);
    },

    /**
     * It is going to mute all the audios
     * @memberof EkstepRendererAPI
     **/
    muteAudio: function() {
        AudioManager.mute();
    },

    /**
     * It is going to unmute all the audios
     * @memberof EkstepRendererAPI
     **/
    muteAudio: function() {
        AudioManager.unmute();
    },

    /**
     * It starts recording with intake proper assetId
     * @param action {string} assetId is received as a string
     * @memberof EkstepRendererAPI
     **/
    startRecording: function(assetId) {
        var action = {
            "type": "command",
            "command": "startRecord",
            "asset": assetId,
            "disableTelemetry": false,
            "success": "recordingInfo",
            "stageInstanceId": Renderer.theme._currentScene._stageInstanceId,
            "stageId": Renderer.theme._currentStage
        };
        RecorderManager.startRecording(action);
    },

    /**
     * It stops recording with intake of proper assetId
     * @param action {string} assetId is received as a string
     * @memberof EkstepRendererAPI
     **/
    stopRecording: function(assetId) {
        var action = {
            "type": "command",
            "command": "stopRecord",
            "asset": assetId,
            "disableTelemetry": false,
            "success": "recordingInfo",
            "stageInstanceId": Renderer.theme._currentScene._stageInstanceId,
            "stageId": Renderer.theme._currentStage
        };
        RecorderManager.stopRecording(action);
    },

    /**
     * Navigate to next stage. Incase of item stage navigates to next question
     * @memberof EkstepRendererAPI
     **/
    next: function() {
        EventBus.dispatch("actionNavigateNext", "next");
    },

    /**
     * Navigate to previous stage.
     * @memberof EkstepRendererAPI
     **/
    previous: function() {
        EventBus.dispatch("actionNavigatePrevious", "previous");
    },

    /**
     * skips current stage.
     * @memberof EkstepRendererAPI
     **/
    skip: function() {
        EventBus.dispatch("actionNavigateSkip", "skip");
    }

}
