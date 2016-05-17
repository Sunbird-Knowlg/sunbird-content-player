describe('MTF Plugin test cases', function() {

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
             controller: {
                    name: "funtime",
                    type: "data",
                    id: "mtf"
                },
            
            stage: [
                { id: "splash", extends: "splash1", audio: { asset: 'splash_audio' }, img: { asset: 'sringeri' } },
                { id: "splash1", audio: { asset: 'splash_audio' }, img: { asset: 'sringeri' } },
                { id: "splash2", audio: { asset: 'splash_audio' }, img: { asset: 'sringeri' } }
            ]
        };

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
        };

        var data = data || {
            "mtf": {
                "options": {
                    "x": 0,
                    "y": 0,
                    "w": 50,
                    "h": 50
                },
            }
        };
        Renderer.theme = { _currentStage: '' };
        this.theme = new ThemePlugin(themeData);
        this.theme.start('js/test/assets/');
        this.theme.start('js/test/items/');
        this.plugin = PluginManager.invoke('mtf', data, parent, "splash", this.theme);
        spyOn(this.plugin, 'getLhsOption').and.callThrough();
        spyOn(this.plugin, 'setAnswer').and.callThrough();

        done();
    });

    it('MTF plugin container field validation', function() {
        expect(true).toEqual(this.plugin._isContainer == true);

    });

    it('MTF plugin render field validation', function() {
        expect(true).toEqual(this.plugin._render == true);

    });

    it('MTF plugin setAnswer validatoin', function() {
        this.plugin.setAnswer({rhsOption:"a", lhsIndex:1});
        expect(this.plugin.setAnswer).toHaveBeenCalled();
        expect(this.plugin.setAnswer.calls.count()).toEqual(1);
    });


    it('MTF plugin getLhsOption', function() {
        this.plugin.getLhsOption({ index: 1 });
        expect(this.plugin.getLhsOption).toHaveBeenCalled();
        expect(this.plugin.getLhsOption.calls.count()).toEqual(1);
    });

    it("MTF force attribute checking ", function() {

        expect(true).toEqual(this.plugin._force == false)
    })

});