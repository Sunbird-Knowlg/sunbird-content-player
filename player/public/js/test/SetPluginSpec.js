describe('Set Plugin test cases', function() {

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
            "asset": "sringeri",
            "parmaExpr":"ev-value"

        }
        this.theme = new ThemePlugin(themeData);
        this.theme.start('js/test/assets/');
        this.plugin = PluginManager.invoke('set', data, parent, "splash", this.theme);
        spyOn(this.plugin, 'replaceExpressions').and.callThrough();
        spyOn(this.plugin, 'setParamValue').and.callThrough();
        spyOn(this.plugin, 'setParam').and.callThrough();
        spyOn(this.plugin, 'getParam').and.callThrough();

        done();
       /* console.log("param", this.plugin._self.param);*/

    });

    it('Set plugin setParamValue function validation', function() {
        this.plugin.setParamValue({ primary: true });
        expect(this.plugin.setParamValue).toHaveBeenCalled();
        expect(this.plugin.setParamValue.calls.count()).toEqual(1);
    });
    it('Set plugin setParam function validation', function() {
        this.plugin.setParam({ primary: true });
        expect(this.plugin.setParam).toHaveBeenCalled();
        expect(this.plugin.setParam.calls.count()).toEqual(1);
    });
    it(' param attribute validation', function() {
        expect(this.plugin.param).not.toBeNull();
    });
    it("Scope attribute validation",function(){
        expect(this.plugin.scope).not.toBeNull();
    });
    it("model attribute validation",function(){
        expect(this.plugin.model).not.toBeNull();

    });
   
    it("id attribute validation",function(){
        expect(this.plugin.id).not.toBeNull();

    })
    it('Param key and paramExpr attribute validation',function(){
        expect(this.plugin.paramKey).not.toBeNull();
        expect(this.plugin.paramExpr).not.toBeNull();
       
    });
    it('Set plugin _render validation',function(){

       expect(false).toEqual(this.plugin._render == true);

    });
    it('Set plugin _isContainer validation',function(){

       expect(true).toEqual(this.plugin._isContainer == false);

    });
    

});