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
            "w": 50,
            "h": 50,
            "z-index": "10",
            "stroke": 6,
            "bgcolor": "skyblue",
            "color": "yellow"
               
        }
        // this.theme = new ThemePlugin(themeData);
        // this.theme.start('https://ekstep-public.s3.amazonaws.com/preview/dev/img/icons/');
        this.plugin = PluginManager.invoke('option', data, parent, "splash", this.theme);
        spyOn(this.plugin, 'initPlugin').and.callThrough();
        spyOn(this.plugin, 'renderMCQOption').and.callThrough();
        spyOn(this.plugin, 'renderMTFOption').and.callThrough();
        spyOn(this.plugin, 'renderImage').and.callThrough();
        spyOn(this.plugin, 'renderText').and.callThrough();
        spyOn(this.plugin, 'initShadow').and.callThrough();
        spyOn(this.plugin, 'setOptionIndex').and.callThrough();
        spyOn(this.plugin, 'renderInnerECML').and.callThrough();
        spyOn(this.plugin, 'resolveModelValue').and.callThrough();
        done();
    });
    
    it("Option plugin initPlugin function validation", function() {
        this.plugin.initPlugin({primary : true}) 
        expect(this.plugin.initPlugin).toHaveBeenCalled();
        expect(this.plugin.initPlugin.calls.count()).toEqual(1);
    });

    xit("Option plugin renderMCQOption function validation", function() {
        this.plugin.renderMCQOption({primary : true}) 
        expect(this.plugin.renderMCQOption).toHaveBeenCalled();
        expect(this.plugin.renderMCQOption.calls.count()).toEqual(1);
    });

    xit("Option plugin renderMTFOption function validation", function() {
        this.plugin.renderMTFOption({primary : true}) 
        expect(this.plugin.renderMTFOption).toHaveBeenCalled();
        expect(this.plugin.renderMTFOption.calls.count()).toEqual(1);
    });

    xit("Option plugin renderImage function validation", function() {
        this.plugin.renderImage({primary : true}) 
        expect(this.plugin.renderImage).toHaveBeenCalled();
        expect(this.plugin.renderImage.calls.count()).toEqual(1);
    });

    xit("Option plugin renderText function validation", function() {
        this.plugin.renderText({primary : true}) 
        expect(this.plugin.renderText).toHaveBeenCalled();
        expect(this.plugin.renderText.calls.count()).toEqual(1);
    });

    xit("Option plugin refresh function validation", function() {
        this.plugin.renderText("left") 
      
        expect(this.plugin.align).toEqual('left')
        expect(this.plugin.renderText).toHaveBeenCalled();
        expect(this.plugin.renderText.calls.count()).toEqual(1);
    });

    xit("Option plugin initShadow function validation", function() {
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

    it('Option plulgin container validation', function() {
        expect(false).toEqual(this.plugin._isContainer == true);

    });
    it('Option Plugin render validation', function() {
        expect(true).toEqual(this.plugin._render == false);

    });

});