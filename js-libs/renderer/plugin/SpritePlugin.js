var SpritePlugin = Plugin.extend({
    _type: 'sprite',
    _isContainer: false,
    _render: true,
    initPlugin: function(data) {
        var dims = this.relativeDims();

        var spriteJSON = this._theme.getAsset(data.asset);
        var spriteImage = this._theme.getAsset(data.asset +"_image");
        if(spriteJSON && spriteImage) {
            spriteJSON.images.push(spriteImage);
            var spritesheet = new createjs.SpriteSheet(spriteJSON);
            var grant = new createjs.Sprite(spritesheet);
            if (data.start) {
                grant.gotoAndPlay(data.start);
            }
            grant.x = dims.x;
            grant.y = dims.y;
            this._self = grant;

            // this._self.scaleY = 0.5;
            // this._self.scaleX = 0.5;

            this._self.scaleX = dims.w / spriteJSON.frames.width;
            this._self.scaleY = dims.h / spriteJSON.frames.height;

            grant.addEventListener('change', function() {
                Renderer.update = true;
            });
        } else {
            console.error("Sprite sheet definition or image not found.");
        }
    },
    play: function(action) {
        if (!this._self.visible)
            this._self.visible = true;
        this._self.gotoAndPlay(action.animation);
    },
    togglePlay: function(action) {
        if (this._self.paused) {
            this._self.gotoAndPlay(action.animation);
        } else {
            this._self.paused = true;
        }
    },
    pause: function() {
        this._self.paused = true;
    },
    stop: function() {
        this._self.stop();
    }
});
PluginManager.registerPlugin('sprite', SpritePlugin);
