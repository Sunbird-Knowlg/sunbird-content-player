var SpritePlugin = Plugin.extend({
    _isContainer: false,
    _render: true,
    initPlugin: function(data) {
        var dims = this.relativeDims();
        var spriteImage = this._theme.getAsset(data.asset);
        var animations = {};
        if(data.animations) {
            for(k in data.animations) {
                animations[k] = JSON.parse(data.animations[k]);
            }
        }
        var spriteJSON = {
            "framerate": data.framerate,
            "images": [spriteImage],
            "frames": data.frames,
            "animations": animations
        };
        var spritesheet = new createjs.SpriteSheet(spriteJSON);
        var grant = new createjs.Sprite(spritesheet);
        if(data.start) {
            grant.gotoAndPlay(data.start);
        }
        grant.x = dims.x;
        grant.y = dims.y;
        this._self = grant;
        grant.addEventListener('change', function() {
            Renderer.update = true;
        });
    },
    playAnimation: function(animation) {
        this._self.gotoAndPlay(animation);
    }
});
PluginManager.registerPlugin('sprite', SpritePlugin);