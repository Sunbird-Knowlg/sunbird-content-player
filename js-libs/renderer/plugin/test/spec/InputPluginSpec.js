describe('Input Plugin test cases', function() {
    beforeEach(function(done) {
        var themeData = {
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
        }
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
            "type": "text/radio/checkbox/number"
        };
        Renderer.theme = { _currentStage: '' };

        done();

        this.theme = new ThemePlugin(themeData);
        this.theme.start('js/test/assets/');
        this.plugin = PluginManager.invoke('input', data, parent, "", this.theme);


        it('Input plugin init properties', function() {

            expect(this.plugin._self.x).toBeDefined();
            expect(this.plugin._self.y).toBeDefined();
            expect(this.plugin._self.x).not.toBeNull();
            expect(this.plugin._self.y).not.toBeNull();
            expect(this.plugin._self.id).toBeDefined();
            expect(this.plugin._self.id).not.toBeNull();
        });

    });


});