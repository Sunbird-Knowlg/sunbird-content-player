describe('Set Plugin test cases', function() {

    beforeEach(function(done) {
        var themeData = {
            canvasId: "canvas",
            startStage: "splash",
            manifest: {
                media: [{
                    id: 'sringeri',
                    src: 'sringeri.png',
                    type: 'image'
                }, {
                    id: 'splash_audio',
                    src: 'splash.ogg',
                    type: 'audio'
                }]
            },
            stage: [{
                id: "splash",
                extends: "splash1",
                audio: {
                    asset: 'splash_audio'
                },
                img: {
                    asset: 'sringeri'
                }
            }, {
                id: "splash1",
                audio: {
                    asset: 'splash_audio'
                },
                img: {
                    asset: 'sringeri'
                }
            }, {
                id: "splash2",
                audio: {
                    asset: 'splash_audio'
                },
                img: {
                    asset: 'sringeri'
                }
            }]
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
            "asset": "sringeri",
            "dimensions": "10"


        }
        this.theme = new ThemePlugin(themeData);
        this.theme.start('js/test/assets/');
        this.plugin = PluginManager.invoke('placeholder', data, parent, "splash", this.theme);
        spyOn(this.plugin, 'renderText').and.callThrough();
        spyOn(this.plugin, 'renderImage').and.callThrough();
        spyOn(this.plugin, 'renderGridLayout').and.callThrough();


        done();


    });

    it('Placeholder plugin tyeps  validation', function() {
      /*  console.log("type", this.plugin.type);*/
        expect(this.plugin.type).not.toBeNull();
    });
    it('Placeholder plugin _render validation', function() {

        expect(true).toEqual(this.plugin._render == true);

    });
    it('Placeholder plugin _isContainer validation', function() {

        expect(false).toEqual(this.plugin._isContainer == false);

    });
    it('Plugin renderText function ', function() {
        
        expect(this.plugin.renderText).not.toEqual(null);
    });

    it('Plugin renderImage function',function(){


        expect(this.plugin.renderImage).not.toEqual(null)
    })

    it('Placeholder plugin renderGridLayout fun',function(){
        expect(this.plugin.renderGridLayout).not.toEqual(null)


    })

    

});