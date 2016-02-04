var InputPlugin = Plugin.extend({
	_type: 'input',
	_isContainer: false,
    _render: true,
    _input: undefined,
	initPlugin: function(data) {
        this._input = undefined;
		var dims = this.relativeDims();
		var input = document.getElementById(data.id);
		if(input) {
			$("#" + data.id).remove();
		}
        input = document.createElement('input');
        input.id = data.id;
        input.type = data.type;
        input.style.width = dims.w + 'px';
        input.style.height = dims.h + 'px';
        input.className = data.class;
        input.style.display = 'none';
        var instance = this;
        var val;
        if (data.model) {
            var model = data.model;
            val = this._stage.getModelValue(model);
        } else if (data.param) {
            val = this._stage.params[data.param.trim()];
        }
        input.value = val;
        var div = document.getElementById('gameArea');
        div.insertBefore(input, div.childNodes[0]);
        this._input = input;
        this._self = new createjs.DOMElement(input);
        this._self.x = dims.x;
        this._self.y = dims.y;
        this._theme.inputs.push(data.id);
        this._stage._inputs.push(this);
	},
    setModelValue: function() {
        if (this._data.model) {
            var model = this._data.model;
            this._stage.setModelValue(model, this._input.value);
        }
    }

});
PluginManager.registerPlugin('input', InputPlugin);