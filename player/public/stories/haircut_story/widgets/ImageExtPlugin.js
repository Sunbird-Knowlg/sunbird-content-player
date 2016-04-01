Plugin.extend({
    _type: 'image',
    _isContainer: false,
    _render: true,
    initPlugin: function(data) {
        var instance = this;
       // console.log("asset : ", asset);
        var asset = '';
        if (data.model) {
            asset = this._stage.getModelValue(data.model);   
        } else if (data.param) {
            asset = this.getParam(data.param);
        } else {
            asset = data.asset;
        }
        var s = new createjs.Bitmap(this._theme.getAsset(asset));
        var dims = this.relativeDims();
        var sb = s.getBounds();
        s.x = dims.x;
        s.y = dims.y;
        this._self = s;
        if(data.rotate) {
            this._self.regX = dims.w/2;
            this._self.regY = dims.h/2;
            this._self.rotation = data.rotate;
        }
        if(sb) this.setScale(); 
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
    doSomething: function(action) {
        alert(action.message);
    }
});
