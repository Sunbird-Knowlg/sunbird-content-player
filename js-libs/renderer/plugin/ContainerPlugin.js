var ContainerPlugin = Plugin.extend({
    _type: 'g',
    _isContainer: true,
    _render: true,
	initPlugin: function(data) {
		this._self = new createjs.Container();
		var dims = this.relativeDims();
        this._self.x = dims.x;
        this._self.y = dims.y;
        if(data.hitArea) {
            var hit = new createjs.Shape();
            hit.graphics.beginFill("#000").r(0, 0, dims.w, dims.h);
            this._self.hitArea = hit;
        }
        if(data.rotate){
            this.rotation(data);
        }
        this.invokeChildren(data, this, this._stage, this._theme);
	},
    refresh: function() {
        if (_.isArray(this._childIds)) {
            for (var i=0; i<this._childIds.length; i++) {
                var childPlugin = PluginManager.getPluginObject(this._childIds[i]);
                if (childPlugin) {
                    childPlugin.refresh();
                }
            }   
        }
    }
});
PluginManager.registerPlugin('g', ContainerPlugin);