var ImagePlugin = Plugin.extend({
    _type: 'image',
    _isContainer: false,
    _render: true,
    initPlugin: function(data) {
        var instance = this;
        var asset = '';
        if(data.asset) {
            asset = data.asset;
        } else if (data.model) {
            asset = this._stage.getModelValue(data.model);
        } else if (data.param) {
            asset = this.getParam(data.param);
        }
        if(_.isEmpty(asset)) {
            this._render = false;
            console.warn("asset not found", data);
        } else {
            var s = new createjs.Bitmap(this._theme.getAsset(asset));
            var dims = this.relativeDims();
            var sb = s.getBounds();
            s.x = dims.x;
            s.y = dims.y;
            this._self = s;
            if(sb) this.setScale();    
        }        
    },
    refresh: function() {
        var asset = '';
        if (this._data.model) {
            asset = this._stage.getModelValue(this._data.model);   
        } else if (this._data.param) {
            asset = this.getParam(this._data.param);
        } else {
            asset = this._data.asset;
        }
        if (asset) {
            var image = this._theme.getAsset(asset);
            this._self.image = image;
            Renderer.update = true;
        }
    },
});
PluginManager.registerPlugin('image', ImagePlugin);