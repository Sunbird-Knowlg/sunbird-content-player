var ImagePlugin = Plugin.extend({
    _type: 'image',
    _isContainer: false,
    _render: true,
    initPlugin: function(data) {
        var instance = this;
       // console.log("asset : ", asset);
        var s = new createjs.Bitmap(this._theme.getAsset(data.param ? this._stage.getModelValue(data.param) : data.asset));
        var dims = this.relativeDims();
        var sb = s.getBounds();
        s.x = dims.x;
        s.y = dims.y;
        this._self = s;
        if(sb) this.setScale(); 
    }
});
PluginManager.registerPlugin('image', ImagePlugin);