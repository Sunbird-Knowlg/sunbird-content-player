/*Todo*/


describe('set Plugin test cases', function() {

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
                    "asset": "sringeri"
            
        }
        this.theme = new ThemePlugin(themeData);
        this.theme.start('js/test/assets/');
        this.plugin = PluginManager.invoke('set', data, parent, "splash", this.theme);
        spyOn(this.plugin, 'setParam').and.callThrough();
        spyOn(this.plugin, 'setParamValue').and.callThrough();
        spyOn(this.plugin, 'replaceExpressions').and.callThrough();

        done();
        console.log("asset",asset);
    });


    it('Embed plugin container field validation', function() {
        expect(true).toEqual(this.plugin._isContainer == false);

    });

    it('Embed plugin render field validation', function() {
        expect(false).toEqual(this.plugin._render == true);

    });

    it('Set plugin setParam', function() {

        this.plugin.setParam({param:"Param_name", value:"12", incr:12, scope:"stage", max:10});
        expect(this.plugin.setParam).toHaveBeenCalled();
        expect(this.plugin.setParam.calls.count()).toEqual(1);
    });

    /*it('Set plugin getParam', function() {

        this.plugin.getParam("param");
        expect(this.plugin.getParam).toHaveBeenCalled();
        expect(this.plugin.getParam.calls.count()).toEqual(1);
    });
*/
    it('Set plugin setParamValue', function() {

        this.plugin.setParamValue("previous");
        expect(this.plugin.setParamValue).toHaveBeenCalled();
        expect(this.plugin.setParamValue.calls.count()).toEqual(1);

    });

     

});