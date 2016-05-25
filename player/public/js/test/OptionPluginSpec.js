describe('Option Plugin test cases', function() {

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
            addChild: function(child, childPlugin) {}
        }
        var data = data || {

            "x": 0,
            "y": 0,
            "w": 100,
            "h": 100,
            "id": "one",
        }
        this.theme = new ThemePlugin(themeData);
        this.theme.start('js/test/assets/');
        this.plugin = PluginManager.invoke('option', data, parent, "splash", this.theme);
        spyOn(this.plugin, 'renderText').and.callThrough();
         spyOn(this.plugin, 'initShadow').and.callThrough();
        done();
    });
    it('Option plulgin container validation', function() {
        expect(false).toEqual(this.plugin._isContainer == true);

    });
    it('Option Plugin render validation', function() {
        expect(true).toEqual(this.plugin._render == false);

    });

    it("Option plugin refresh function validation", function() {
        this.plugin.renderText("left") 
      
        expect(this.plugin.align).toEqual('left')
        expect(this.plugin.renderText).toHaveBeenCalled();
        expect(this.plugin.renderText.calls.count()).toEqual(1);
    });

     it("Option plugin initShadow function validation", function() {
        this.plugin.initShadow(shadowData = {
            x: 0,
            y: 0,
            w: 100,
            h: 100,
            type: 'roundrect',
            fill: '#E89241',
            visible: false,
            opacity:  1
        });
      
        expect(this.plugin.initShadow).toHaveBeenCalled();
        expect(this.plugin.initShadow.calls.count()).toEqual(1);
    });

});