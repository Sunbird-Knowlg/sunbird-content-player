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
     * @param type {string} name of the event (e.g. actionNavigateSkip).
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
     * @param type {string} name of the event to fire (e.g. actionNavigateSkip)
     * @param data {object} event data to carry along with the notification
     * @param target {object} the scope of the event (use this)
     * @memberof EkstepRendererAPI
     */
    dispatchEvent: function(type, data, target) {
        EventBus.dispatch(type, data, target);
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
     * @param type {string} name of the event registered with (e.g. actionNavigateSkip)
     * @param callback {function} remove the callback function
     * @param scope {object} the scope of the event (use this)
     * @memberof EkstepRendererAPI
     */
    removeEventListener: function(type, callback, scope) {
        EventBus.removeEventListener(type, callback, scope)
    },

    /**
     * Notifies to framework to update the canvas objects. This can be done by the plugin when
     * plugin wants to update OR render the object to canvas.
     * @memberof EkstepRendererAPI
     */
    render: function() {
        Renderer.update = true;
    },

    /**
     * Returns the current content manifest data which.
     * @memberof EkstepRendererAPI
     */
    getManifest: function() {
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
     * Refresh the rendering of current stage - plugins can request the stages to be refresh if any change
     * has been made.
     * @memberof EkstepRendererAPI
     */
    refreshStage: function() {
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
     * Returns current stage Id of the content. This could be useful when plugins can get access to
     * current stage identifier.undefined if the currentstage identifier is not present.
     * @memberof EkstepRendererAPI
     */
    getCurrentStageId: function() {
        return Renderer.theme._currentStage;
    },

    /**
     * Returns the HTML5 canvas for rendering plugins. By default, the rederer uses create.js and recommends the plugins to also use CreateJS. This helps in getting WYSIWYG on renderer canvas(CreateJS) & editor canvas(FabricJS).  However, this method provides access to the underlying native HTML5 canvas if needed. For example, if your plugin uses some other third-party graphics library for rendering.
     * @memberof EkstepRendererAPI
     */
    getCanvas: function() {
        return document.getElementById('gameCanvas');
    },

    /**
     * Returns the baseURL of asset.
     * Object to hold Base URL
     * @member {String} baseURL
     * @memberof EkstepRendererAPI
     */
    getBaseURL: function() {
        return Renderer.theme._basePath;
    },

    /**
     * Returns the complete current content data object(JSON object of Theme/ECML/Content). This is usefull for the plugins developer to know about no. of stages, stage elements, stage assets/media etc..
     * current content data object
     * @memberof EkstepRendererAPI
     */
    getContentData: function() {
        return Renderer.theme._data;
    },


    /**
     * Returns a plugin instance for the given plugin Id once the plugin registarion/invoke is done. Plugins can use this work with dependencies
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
     * It will map controller object, This could be useful when plugins can get access to
     * map the controller.
     * @param controller {object} controller is object. It should have id, name, type and __cdata.
     * type defines controller type e.g(item, data), name defines controller name, id defines controller identifier
     * @memberof EkstepRendererAPI
     */
    addController: function(controller) {
        Renderer.theme.addController(controller)
    },

    /**
     * Returns the controller instance based on identifier.
     * @param id {string} It will accetp the controller identifier as input. this could be usefull when plugin
     * get access to get the controller from canvas.
     * suppose if it returns undefined then Controller has not been registed.
     * @memberof EkstepRendererAPI
     */
    getController: function(id) {
        return ControllerManager.getControllerInstance(id);
    },

    /**
     * Returns the currentStage controller instance.
     * undefined if the currentstage controller has not been registred.
     * @memberof EkstepRendererAPI
     */
    getCurrentController: function() {
        var currentStage = EkstepRendererAPI.getCurrentStage();
        if (currentStage) {
            return currentStage._stageController;
        }
    },

    /**
     * set the param to scope level.
     * @param scope {string} name of the scope (e.g. stage, theme, app)
     * @paramName {string} name to param to set.
     * @paramName {object} value of the param.
     * @memberof EkstepRendererAPI
     */
    setParam: function(scope, paramName, value) {
        if (scope === 'theme') {
            Renderer.theme.setParam(paramName, value);
        }
        if (scope === 'stage') {
            var currentStage = EkstepRendererAPI.getCurrentStage();
            if (currentStage) {
                currentStage.setParam(paramName, value);
            }
        }
        if (scope === 'app') {
            GlobalContext.setParam(paramName, value);
        }
    },

    /**
     * return the param data
     * @paramName {string} name to param to set.
     * @memberof EkstepRendererAPI
     */
    getStageParam: function(paramName) {
        var currentStage = EkstepRendererAPI.getCurrentStage();
        var paramData;
        if (paramName && currentStage) {
            paramData = currentStage.getParam(paramName);
        } else if (currentStage) {
            paramData = currentStage.params
        }
        return paramData;
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
            paramData = EkstepRendererAPI.getStageParam(paramName);
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
            paramData = EkstepRendererAPI.getStageParam();
        }
        if (scope === 'app') {
            paramData = GlobalContext._params;
        }
        return paramData;
    },

    /**
     * Returns stageData for particular stage identifier.
     * undefined if the stage data is not present for the particular stage identfier.
     * this could be usefull when plugin wants to fetch some paticular stage data.
     * @param stageId {string} name of the identifier.
     * @memberof EkstepRendererAPI
     */
    getStage: function(stageId) {
        return Renderer.theme.getStageDataById(stageId);
    },

    /**
     * Returns state of the param.
     * Undefined if the param is not present is the currentState.
     * @param paramName {string} name of the param.
     * @memberof EkstepRendererAPI
     */
    getState: function(paramName) {
        var currentStage = EkstepRendererAPI.getCurrentStage();
        if (currentStage) {
            return currentStage.getState(paramName);
        }
    },

    /*--------------------------*/

    /**
     * It takes the value and the param to set its state
     * @param param {string} Param is a string defining the type of question (mcq/mtf/ftb)
     * @param value {object/array} value for mcq and mtf type is an array and for ftb type is an object
     * @param isStateChanged {boolean} state true or false if pluginState is changed
     * @memberof EkstepRendererAPI
     **/
    setState: function(param, value, isStateChanged) {
        var currentStage = EkstepRendererAPI.getCurrentStage();
        if (currentStage) {
            currentStage.setState(param, value, isStateChanged);
        }
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
     * Returns the complete Telemetry data obj.
     * This could be usefull when plugin get access to know the telemetry data for the current content.
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
        var props = {
            "duration": "100",
            "ease": "linear",
            "effect": "fadeIn",
            "value": stageId,
            "pluginId": Renderer.theme._id,
            "transitionType": "next"
        };
        this.invokeCommand("transitionTo", Renderer.theme._id, props);
    },

    /**
     * Returns the complete Game area
     * @memberof EkstepRendererAPI
     **/
    getGameArea: function() {
        return document.getElementById('gameArea');;
    },

    /**
     * Returns the asset/media instance of Image, Audio, video etc.. which is defined in the manifest of the given assetId
     * @param assetId {string} assetId of the desired asset/media defined in manifest
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
     * It will play any type of asset by passing respective assetId (e.g. video, audio).
     * @assetId {string} identifier of the asset.
     * @memberof EkstepRendererAPI
     **/
    play: function(assetId) {
        this.invokeCommand("play", assetId);
    },

    /**
     * It will pause any asset by passing respective assetId (e.g. video, audio).
     * @assetId {string} identifier of the asset.
     * @memberof EkstepRendererAPI
     **/
    pause: function(assetId) {
        this.invokeCommand("pause", assetId);
    },

    /**
     * It will stop any asset by passing respective assetId (e.g. video, audio).
     * @assetId {string} identifier of the asset.
     * @memberof EkstepRendererAPI
     **/
    stop: function(assetId) {
        this.invokeCommand("stop", assetId);
    },

    /**
     * It takes the assetId of the given audio and toggelPlays it.
     * @param action {string} assetId is received as a string
     * @memberof EkstepRendererAPI
     **/
    toggelPlay: function(assetId) {
        this.invokeCommand("togglePlay", assetId);
    },

    /**
     * This could be usefull when pluign wants to stop all currently playing audio on the stage.
     * @memberof EkstepRendererAPI
     **/
    stopAll: function() {
        this.invokeCommand("stop", "", {"sound": true});
    },

    /**
     * This could be usefull when pluign wants to Mute all currently playing audio on the stage.
     * @memberof EkstepRendererAPI
     **/
    muteAudio: function() {
        AudioManager.mute();
    },

    /**
     * This could be usefull when pluign wants to UnMute all currently playing audio on the stage.
     * @memberof EkstepRendererAPI
     **/
    unMuteAudio: function() {
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
     * To execute a sepecific command on the given input assetId. For list of commands refer https://community.ekstep.in/specifications-guides/55-ecml-how-to-guide#defining-events-and-actions
     * @param name {string} command name which has to execute, ex: "play", "show", "blur",
     * @param assetId {string} media/asset on which this command has to execute
     * @param props {object} To pass additional properties of command(key-value pair object). Ex: {"duration": 200, "effect": linear}
     * @memberof EkstepRendererAPI
     **/
    invokeCommand: function(name, assetId, props) {
        var stageId = this.getCurrentStage()._id;
        if (_.isUndefined(assetId) || _.isEmpty(assetId))
            assetId = stageId;

        var action = {
            'type': 'command',
            'command': name,
            'asset': assetId,
            'pluginId': stageId
        }
        if (props) {
            _.extend(action, props);
        }
        this.invokeAction(action);
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
     * Navigate to next stage without submitting the assessment answer. Skip the current question submission.
     * @memberof EkstepRendererAPI
     **/
    skip: function() {
        EventBus.dispatch("actionNavigateSkip", "skip");
    },

    /**
     * Adds a child to this plugin intance. This can be useful for composite scenarios.
     * @param pluginId {string} plugin id inside which child had to be added
     * @param child {object} child element which has to be added inside plugin(child is not a createjs/this._self element)
     * @memberof EkstepRendererAPI
     **/
    addChild: function(pluginId, child) {
        var plugin = this.getPluginInstance(pluginId);
        plugin.addChild(child._self, child);
        this.render();
    },

    /**
     * Removes a child from this plugin by child index. Use this to dynamically manage composite children.
     * @param pluginId {string} plugin id from which child has to be removed
     * @param index {Number} index of createjs element object
     * @memberof EkstepRendererAPI
     **/
    removeChildAt: function(pluginId, index) {
        var plugin = this.getPluginInstance(pluginId);
        plugin.removeChildAt(index);
        this.render();
    },

    /**
     * Removes a child from this plugin by child instance. Use this to dynamically manage composite children.
     * @param pluginId {string} plugin id from which child has to be removed
     * @param child {object} child element which has to be removed(child should not be createjs/this._self element)
     * @memberof EkstepRendererAPI
     **/
    removeChild: function(pluginId, child) {
        var plugin = this.getPluginInstance(pluginId);
        plugin.removeChild(child._self);
        this.render();
    },

    /**
     * To get plugin dimensions specified in ECML/JSON
     * @param pluginId {string} plugin id of element whose dimension is needed
     * @memberof EkstepRendererAPI
     **/
    dimensions: function(pluginId) {
        var plugin = this.getPluginInstance(pluginId);
        return plugin.dimensions();
    },

    /**
     * To get plugin dimensions relative to Canvas/device width & height also with respect to it's parents
     * @param pluginId {string} plugin id of element whose dimension is needed
     * @memberof EkstepRendererAPI
     **/
    relativeDims: function(pluginId) {
        var plugin = this.getPluginInstance(pluginId);
        return plugin.relativeDims();
    },

    /**
     * property of the plugin to show it's visiblity on stage
     * @param assetId {string} assetId of element to show
     * @param delay {number} [0] delay before action happened (optional)
     * @memberof EkstepRendererAPI
     **/
    show: function(assetId, delay) {
        var props = {
            'delay' : delay ? delay : 0,
        }
        this.invokeCommand('show', assetId, props);
    },

    /**
     * Property of the plugin to hide it's visiblity on stage
     * @param assetId {string} assetId of element to hide
     * @param delay {number} [0] delay before action happened (optional)
     * @memberof EkstepRendererAPI
     **/
    hide: function(assetId, delay) {
        var props = {
            'delay' : delay ? delay : 0,
        }
        this.invokeCommand('hide', assetId, props);
    },

    /**
     * property of the plugin to toggle it's visiblity on stage
     * @param assetId {string} assetId of element to toggle
     * @param delay {number} [0] delay before action happened (optional)
     * @memberof EkstepRendererAPI
     */
    toggleShow: function(assetId, delay) {
        var props = {
            'delay' : delay ? delay : 0,
        }
        this.invokeCommand('toggleShow', assetId, props);
    },

    /**
     * property of the plugin to toggle it's shadow
     * @param pluginId {string} plugin id of element whose shadow has to be toggled
     * @memberof EkstepRendererAPI
     */
    toggleShadow: function(pluginId) {
        var plugin = this.getPluginInstance(pluginId);
        plugin.toggleShadow();
    },

    /**
     * property of the plugin to add shadow using createJS shadow property
     * @param pluginId {string} plugin id of element whose shadow should be added
     * @memberof EkstepRendererAPI
     */
    addShadow: function(pluginId) {
        var plugin = this.getPluginInstance(pluginId);
        plugin.addShadow();
    },

    /**
     * property of the plugin to remove it's shadow
     * @param pluginId {string} plugin id of element whose shadow should be removed
     * @memberof EkstepRendererAPI
     */
    removeShadow: function(pluginId) {
        var plugin = this.getPluginInstance(pluginId);
        plugin.removeShadow();
    },

    /**
     * Returns the boolean which show if element has shawdow enabled or not.
     * @param pluginId {string} plugin id of element whose shadow needs to be findout
     * @memberof EkstepRendererAPI
     */
    hasShadow: function(pluginId) {
        var plugin = this.getPluginInstance(pluginId);
        return plugin.hasShadow();
    },

    /**
     * Draw a border on element
     * @param pluginId {string} plugin id of element border should be drawn
     * @param dims {object} dimension of border to be drawed
     * @memberof EkstepRendererAPI
     */
    drawBorder: function(pluginId, dims) {
        var plugin = this.getPluginInstance(pluginId);
        plugin.drawBorder(plugin, dims);
    },

    /**
     * Rotate an element
     * @param pluginId {string} plugin id of element to be rotated
     * @param rotate {integer} angle through which plugin will be rotated(0 to 360)
     * @memberof EkstepRendererAPI
     */
    rotation: function(pluginId, rotate) {
        var plugin = this.getPluginInstance(pluginId);
        plugin.rotate = rotate;
        plugin.rotation(plugin);
    },

    /**
     * Blur the element
     * @param pluginId {string} plugin id of element to be blurred
     * @memberof EkstepRendererAPI
     */
    blur: function(pluginId) {
        var plugin = this.getPluginInstance(pluginId);
        plugin.blur();
    },

    /**
     * Unblur the current element
     * @param pluginId {string} plugin id of element to be unblurred
     * @memberof EkstepRendererAPI
     */
    unblur: function(pluginId) {
        var plugin = this.getPluginInstance(pluginId);
        plugin.unblur();
    },

    /**
     * Invoke childrens again to reflect changes
     * @param scope {object} this variable (use this variable)
     * @memberof EkstepRendererAPI
     */
    invokeChildren: function(pluginId, scope) {
        var plugin = this.getPluginInstance(pluginId);
        plugin.invokeChildren(scope, scope._parent, scope._stage, scope._theme);
    },

    /**
     * Returns the asset/media object of Image, Audio, video etc from ecml.. which is defined in the manifest of the given assetId
     * @param assetId {string} assetId of the desired asset/media defined in manifest
     * @memberof EkstepRendererAPI
     **/
    getMedia: function(assetId) {
        return Renderer.theme.getMedia(assetId);
    },
    /**
     *This api is going to return you the current stage question item
     *@memberof EkstepRendererAPI
     */
    currentItem: function() {
        var ctrl = this.getCurrentController();
        return ctrl._model[ctrl._index];
    },
    /**
     *This api is going to return you the previous stage question item
     *@memberof EkstepRendererAPI
     */
    previousItem: function() {
        var ctrl = this.getCurrentController();
        if (ctrl._index > 0 && ctrl._index < ctrl._model.length) return ctrl._model[ctrl._index - 1];
        return 'Item not available';
    },
    /**
     * Merge two stages into single stage and return the final stage.
     * @param stage1 {object} Stage1 data to be merged with another stage.
     * @param stage2 {object} Stage2 data to be merged with another stage.
     * @memberof EkstepRendererAPI
     **/
    mergeStages: function(stage1, stage2) {
        return Renderer.theme.mergeStages(stage1, stage2);
    },
    /**
     *This api is going to return you the complete item list in the stage
     *@memberof EkstepRendererAPI
     */
    getStageItems: function() {
        var currentController = EkstepRendererAPI.getCurrentController();
        if (currentController && currentController._model) return currentController._model;
        return "Item not available."
    }
}
