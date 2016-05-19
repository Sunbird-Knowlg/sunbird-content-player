describe('Audio Plugin test cases', function() {

    beforeEach(function(done) {
       /* var themeData = {
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
                },
                iterate: "assessment",
                var: "item"
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
            }],

            div: [{
                id: "one",
                x: "10",
                y: "20",
                w: "10",
                h: "10"
            }]
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
            "w": 100,
            "h": 100,
            "id": "one"



        }
       /* this.theme = new ThemePlugin(themeData);
        this.theme.start('js/test/assets/');*/
        this.plugin = PluginManager.invoke('audio', data, parent/*, "splash", this.theme*/);
        spyOn(this.plugin, 'play').and.callThrough()
        spyOn(this.plugin,'stop').and.callThrough();
        spyOn(this.plugin,'togglePlay').and.callThrough();
        spyOn(this.plugin,'pause').and.callThrough();
        done();
    });

    it('Audio plugin Container validation',function(){
         expect(true).toEqual(this.plugin._isContainer == false);
    });

    it('Audio plugin render validation',function(){
         expect(true).toEqual(this.plugin._render == false);
    });
    it('Audio plugin stop controller', function() {
        this.plugin.stop({asset: 'splash_audio'});
        expect(this.plugin.stop).toHaveBeenCalled();
        expect(this.plugin.stop.calls.count()).toEqual(1);
    });
    it('Audio plugin pause controller', function() {
        this.plugin.pause({asset: 'splash_audio'});
        expect(this.plugin.pause).toHaveBeenCalled();
        expect(this.plugin.pause.calls.count()).toEqual(1);
    });
    xit('Audio plugin togglePlay controller', function() {
        this.plugin.togglePlay({asset: 'splash_audio'});
        expect(this.plugin.togglePlay).toHaveBeenCalled();
        expect(this.plugin.togglePlay.calls.count()).toEqual(1);
    });




});