describe('Testcase Plugin test cases', function() {

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
                { id: "splash", extends: "splash1", audio: { asset: 'splash_audio' }, img: { asset: 'sringeri' }, iterate: "assessment", var: "item" },
                { id: "splash1", audio: { asset: 'splash_audio' }, img: { asset: 'sringeri' } },
                { id: "splash2", audio: { asset: 'splash_audio' }, img: { asset: 'sringeri' } }
            ],

            div: [
                { id: "one", x: "10", y: "20", w: "10", h: "10" }
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
            "w": 100,
            "h": 100,
            "id": "one",
            "postion": "absolute"




        }
        this.theme = new ThemePlugin(themeData);
        this.theme.start('js/test/assets/');
        this.plugin = PluginManager.invoke('testcase', data, parent, "splash", this.theme);
        


        done();
    });

    it('Div plugin init attribute validation', function() {
        expect(this.plugin._self.x).toBeDefined();
        expect(this.plugin._self.y).toBeDefined();
        expect(this.plugin._self.x).not.toBeNull();
        expect(this.plugin._self.y).not.toBeNull();

        expect(this.plugin._self.w).not.toBeNull();

        expect(this.plugin._self.h).not.toBeNull();
    });
    
    it('Div container validation', function() {
        expect(false).toEqual(this.plugin._isContainer == true);

    });
    it('Div render validation', function() {
        expect(true).toEqual(this.plugin._render == true);

    });
  



});