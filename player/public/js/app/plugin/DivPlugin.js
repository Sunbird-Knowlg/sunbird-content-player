var DivPlugin = Plugin.extend({
	_type: 'div',
    _isContainer: false,
    _render: true,
    _div: undefined,
    initPlugin: function(data) {
    	this._input = undefined;
		var dims = this.relativeDims();
		var div = document.getElementById(data.id);
		if(div) {
			$("#" + data.id).remove();
		}
		div = document.createElement('div');
        div.id = data.id;
        div.style.width = dims.w + 'px';
        div.style.height = dims.h + 'px';
        div.style.position = 'absolute';
        
        var instance = this;
        var parentDiv = document.getElementById(Renderer.divIds.gameArea);
        parentDiv.insertBefore(div, parentDiv.childNodes[0]);

        // TODO: need to check child events working with the current div and it's children (if id is provided.)
        // TODO: get the data from model - like how we are getting the JSON data for scene title.
        $("#" + data.id).append(data.__cdata);
        this._div = div;
        this._self = new createjs.DOMElement(div);
        this._self.x = dims.x;
        this._self.y = dims.y;
    }
});
PluginManager.registerPlugin('div', DivPlugin);