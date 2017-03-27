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
     * Notifies the framework to render the canvas once again. This can be done by the plugin when
     * plugin wants to rendre the content again
     * @memberof EkstepRendererAPI
    */
    render: function() {
        Renderer.theme.render();
    },

    /**
     * Returns the content manifest(media). This can be done by the plugin when
     * plugin wants to get the content manifest(media)
     * @memberof EkstepRendererAPI
    */
    getContext:function(){
    	return Renderer.theme._data.manifest;
    },

    /**
     * Removes current stage HTML elements. This could be useful when plugins work across stages
     * Using this, a plugin can get access to remove the current stage HTML element such vidoe html element etc.,
     * @memberof EkstepRendererAPI
     */
    removeHtmlElements:function(){
    	Renderer.theme.removeHtmlElements();
    },

    /**
     * Reload the rendering of current stage - plugins can request the stages to be reload if any change
     * has been made.
     * @memberof EkstepRendererAPI
     */
    reloadStage:function(){
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
     * such as timers that work across stages or page number plugins. Using this, a plugin can get access to
     * current stage
     * @memberof EkstepRendererAPI
     */
    getCurrentStage: function() {
        return Renderer.theme._currentScene;
    },

    /**
     * Returns current stage ID in the content. This could be useful when plugins can get access to
     * current stage ID
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
     * current content data object object
     * @memberof EkstepRendererAPI
     */
    getContentData: function() {
        return Renderer.theme._data; 
    },

    /**
     * Returns a plugin instance for the given plugin ID. Plugins can use this work with dependencies
     * or build plugins that enhance the behavior of other plugins.
     * @memberof EkstepRendererAPI
     */
    /*getPluginInstance: function(pluginId) {
        return PluginManager.getPluginObject(pluginId);
    },*/
    /*getParam: function(scope, paramName) {
        var paramData = '';
        if (scope === 'theme') {
            paramData = Renderer.theme.getParam(paramName);
        }
        if (scope === 'stage') {
            paramData = Renderer.theme.getParam(paramName);
        }
        if (scope === 'app') {
            paramData = GlobalContext.getParam(paramName);
        }
        return paramData;
    },
    setParam: function(scope, paramName) {
        var paramData = '';
        if (scope === 'theme') {
            paramData = Renderer.theme.setParam(paramName);
        }
        if (scope === 'stage') {
            paramData = Renderer.theme.setParam(paramName);
        }
        if (scope === 'app') {
            paramData = GlobalContext.setParam(paramName);
        }
        return paramData;
    },
    getState: function(paramName) {
        return Renderer.theme._currentScene.getState(paramName);
    },
    setState: function(paramName, value) {
        return Renderer.theme._currentScene.setState(paramName, value);
    },
    cleanRenderer:function(){
    	Renderer.cleanUp();
    },
	getCurrentController: function() {
        return Renderer.theme._currentScene._stageController;
    },
    getController: function(id) {
        return ControllerManager.getControllerInstance
    },
    registerPlugin: function(id, pluginName) {
        PluginManager.registerPlugin(id, pluginName)
    },

    removeEventListener: function(type, callback, scope) {
        EventBus.removeEventListener(type, callback, scope)
    },
    hasEventListener: function(type, callback, scope) {
        EventBus.hasEventListener(type, callback, scope)
    },
    getEvents:function(){
    	return EventBus.getEvents();
    },
    getTransitionEffect:function(animation){
    	return Renderer.theme.getTransitionEffect(animation);
    },



    */


    /*--------------------------*/

}