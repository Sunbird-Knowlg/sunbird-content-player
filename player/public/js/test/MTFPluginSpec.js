describe('MTF Plugin test cases', function() {

    beforeEach(function(done) {
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
        this.plugin = PluginManager.invoke('mtf', data, parent);
        spyOn(this.plugin, 'getLhsOption').and.callThrough();
        spyOn(this.plugin,'setAnswer').and.callThrough();

        done();
    });

    it('MTF plugin container field validation', function() {
        expect(true).toEqual(this.plugin._isContainer == true);

    });

    it('MTF plugin render field validation', function() {
        expect(true).toEqual(this.plugin._render == true);

    });

     it('Mtf plugin getLhsOption', function() {
        this.plugin.getLhsOption({ primary: true });
        expect(this.plugin.getLhsOption).toHaveBeenCalled();
        expect(this.plugin.getLhsOption.calls.count()).toEqual(1);
    });

    it("mtf force attribute checking ",function(){

        expect(true).toEqual(this.plugin._force==false)
     })


   




});