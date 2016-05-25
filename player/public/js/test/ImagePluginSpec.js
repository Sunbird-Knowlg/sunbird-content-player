describe('Image Plugin test cases', function() {

    beforeEach(function(done) {
       /* var themeData = {
            canvasId: "canvas",
            startStage: "splash",
            manifest: {
                media: [
                    { id: 'sringeri', src: 'sringeri.png', type: 'image' },
                    { id: 'splash_audio', src: 'splash.ogg', type: 'audio' }
                ]
            },
            stage: [
                { id: "splash", extends: "splash1", audio: { asset: 'splash_audio' }, img: { asset: 'sringeri' } },
                { id: "splash1", audio: { asset: 'splash_audio' }, img: { asset: 'sringeri' } },
                { id: "splash2", audio: { asset: 'splash_audio' }, img: { asset: 'sringeri' } }
            ]
        }*/
        var parent = {
            dimensions: function() {
                return {
                    x: 0,
                    y: 0,
                    w: 500,
                    h: 500
                }
            }, 
            addChild: function() {}
        }
        var data = data || {
             
                    "x": 0,
                    "y": 0,
                    "w": 50,
                    "h": 50,
                    "asset": "sringeri"
            
        }
       /* this.theme = new ThemePlugin(themeData);
        this.theme.start('js/test/assets/');*/
        this.plugin = PluginManager.invoke('image', data, parent/*, "splash", this.theme*/);

        done();
        
    });

    it('Image plugin initPlugin', function() {
        expect(true).toEqual(this.plugin._self instanceof createjs.Bitmap);
        console.log("image",this.plugin._self.x);
    });

    it('Image X and Y co-ordinate properties',function(){
        expect(this.plugin._self.x).toBe(0);
        expect(this.plugin._self.x).not.toBe(null);
        expect(this.plugin._self.y).toBe(0);
        expect(this.plugin._self.y).not.toBe(null);
        console.log("p",this.plugin._self);
       
    });
     it('Image asset properties',function(){
       expect(this.plugin._self.asset).not.toBeNull();
        
       
    });
});