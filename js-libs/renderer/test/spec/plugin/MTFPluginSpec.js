var MTFData ={ 
     model:"item",
    "options": {
        "x": 0,
        "y": 0,
        "w": 50,
        "h": 50
    },
};
describe('MTF Plugin test cases', function() {

    beforeEach(function(done) {
        var parent = {
            _data : {x:0, y:0, w:50, h:50},
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
      
        this.plugin = PluginManager.invoke('mtf', MTFData, parent, Renderer.theme._currentScene, Renderer.theme);
        spyOn(this.plugin, 'initPlugin').and.callThrough();
        spyOn(this.plugin, 'getLhsOption').and.callThrough();
        spyOn(this.plugin, 'setAnswerMapping').and.callThrough();
        spyOn(this.plugin, 'setAnswer').and.callThrough();
        spyOn(this.plugin, 'removeAnswer').and.callThrough();

        done();
    });
    
    it('MTF plugin initPlugin', function() {
        this.plugin.initPlugin({ primary: true });
        expect(this.plugin.initPlugin).toHaveBeenCalled();
        expect(this.plugin.initPlugin.calls.count()).toEqual(1);
    });

    it('MTF plugin getLhsOption', function() {
        this.plugin.getLhsOption({ index: 1 });
        expect(this.plugin.getLhsOption).toHaveBeenCalled();
        expect(this.plugin.getLhsOption.calls.count()).toEqual(1);
    });

    it('MTF plugin setAnswer', function() {
        this.plugin.setAnswer({rhsOption:"a", lhsIndex:1});
        expect(this.plugin.setAnswer).toHaveBeenCalled();
        expect(this.plugin.setAnswer.calls.count()).toEqual(1);
    });

    it('MTF plugin setAnswerMapping', function() {
        this.plugin.setAnswerMapping({_value: {}}, {_value : {}});
        expect(this.plugin.setAnswerMapping).toHaveBeenCalled();
        expect(this.plugin.setAnswerMapping.calls.count()).toEqual(1);
    });

    it('MTF plugin setAnswerMapping, when lhsOption is undefined', function() {
        this.plugin.setAnswerMapping({_value: {}}, undefined);
        expect(this.plugin.setAnswerMapping).toHaveBeenCalled();
        expect(this.plugin.setAnswerMapping.calls.count()).toEqual(1);
    });

    it('MTF plugin removeAnswer', function() {
        this.plugin.removeAnswer({ primary: true });
        expect(this.plugin.removeAnswer).toHaveBeenCalled();
        expect(this.plugin.removeAnswer.calls.count()).toEqual(1);
    });

    it('MTF plugin container field validation', function() {
        expect(true).toEqual(this.plugin._isContainer == true);
    });

    it('MTF plugin render field validation', function() {
        expect(true).toEqual(this.plugin._render == true);

    });

    it("MTF force attribute checking ", function() {

        expect(true).toEqual(this.plugin._force == false)
    })

});