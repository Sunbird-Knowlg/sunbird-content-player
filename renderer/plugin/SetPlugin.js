var SetPlugin = Plugin.extend({
    _type: 'set',
    _isContainer: false,
    initPlugin: function(data) {
        var value = data.value;
        if (data['ev-value']) {
            value = this.evaluateExpr(data['ev-value']);
        }
        this.setParam(data.param, value, data.scope);
    },
    setParam: function(param, value, incr, scope) {
        if (scope && scope.toLowerCase() == 'app') {
            GlobalContext.setParam(param, value, incr);
        } else if (scope && scope.toLowerCase() == 'stage') {
            this._stage.setParam(param, value, incr);
        } else {
            this._theme.setParam(param, value, incr);
        }
    },
    getParam: function(param) {
        var value = GlobalContext.getParam(param);
        if (!value) value = this._theme.getParam(param);
        if (!value) value = this._stage.getParam(param);
        return value;
    }
});
PluginManager.registerPlugin('set', SetPlugin);
