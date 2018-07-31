// need to combine all the sync commands.
var Command = Class.extend({
	_name: undefined,
	_methodName: undefined,
	_action: undefined,
	_isPluginAction: true,
	_isAsync: false,
	init: function(action) {
		this._action = action;
		CommandManager._setDataAttributes(action);
		this._action.cb = this._callBack.bind(this);
		this.invoke(this._action);
		this._invokeRelatedActions('siblings');
		if (!this._isAsync) {
			this._action.cb({status: "success"});
		}
	},
	getPluginObject: function() {
		var plugin = PluginManager.getPluginObject(this._action.asset);
        if (this._action.parent === true && plugin && plugin._parent) {
            plugin = plugin._parent;
        }
        if (!plugin) {
            plugin = this._action.pluginObj;
        }
        return plugin;
	},
	invoke: function(action) {
		var plugin = this.getPluginObject();
		plugin[this._methodName](action);
	},
	_invokeRelatedActions: function(relation) {
        if ((!_.isUndefined(this._action.stageInstanceId)) && (this._action.stageInstanceId != Renderer.theme._currentScene._stageInstanceId)) {
            return
        }
		if (this._action[relation] && this._action[relation].length > 0) {
			_.each(this._action[relation], function(action) {
				CommandManager.handle(action);
			});
		}
	},
	_callBack: function(response) {
        if (!_(Renderer.theme).isUndefined()) {
		if ("undefined" != typeof response && "success" == response.status) {
			this._invokeRelatedActions('children');
            }
		}
	}
});

