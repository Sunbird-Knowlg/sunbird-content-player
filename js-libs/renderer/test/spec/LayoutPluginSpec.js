describe('Layout Plugin test cases', function() {

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
        var data = {
            "grid": {
                "cols": "2",
                "h": "20",
                "id": "grid1",
                "count": "3",
                "var": "user",
                "w": "30",
                "x": "32",
                "y": "47",
                "shape": {
                    "fill": "#0099FF ",
                    "h": "100",
                    "stroke": "black",
                    "type": "rect",
                    "w": "100",
                    "x": "0",
                    "y": "0"
                },
                "text": {
                    "color": "black",
                    "fontsize": "600",
                    "h": "90",
                    "model": "user.name",
                    "valign": "middle",
                    "w": "90",
                    "x": "40",
                    "y": "10"
                }
            }

        };

        Renderer.theme = { _currentStage: '' };
        this.plugin = new LayoutPlugin( data, parent);

        spyOn(this.plugin,'initPlugin').and.callThrough()
        spyOn(this.plugin,'generateLayout').and.callThrough()
        spyOn(this.plugin,'renderLayout').and.callThrough()
        spyOn(this.plugin,'_addCellAttributes').and.callThrough()
        spyOn(this.plugin,'getCellEvents').and.callThrough()
        spyOn(this.plugin,'resolveActionModelValues').and.callThrough()
        done();
    });

    it('Layout plugin initPlugin function call', function() {
        this.plugin.initPlugin({ primary : true});
        expect(this.plugin.initPlugin).toHaveBeenCalled();
        expect(this.plugin.initPlugin.calls.count()).toEqual(1);
    });

    it('Layout plugin generateLayout function call', function() {
        this.plugin.generateLayout();
        expect(this.plugin.generateLayout).toHaveBeenCalled();
        expect(this.plugin.generateLayout.calls.count()).toEqual(1);
    });

    it('Layout plugin renderLayout function call', function() {
        this.plugin.renderLayout();
        expect(this.plugin.renderLayout).toHaveBeenCalled();
        expect(this.plugin.renderLayout.calls.count()).toEqual(1);
    });

    it('Layout plugin _addCellAttributes function call', function() {
        this._data = {};
        this.plugin._addCellAttributes({});
        expect(this.plugin._addCellAttributes).toHaveBeenCalled();
        expect(this.plugin._addCellAttributes.calls.count()).toEqual(1);
    });

    it('Layout plugin getCellEvents function call', function() {
        this._data = {};
        this.plugin.getCellEvents({});
        expect(this.plugin.getCellEvents).toHaveBeenCalled();
        expect(this.plugin.getCellEvents.calls.count()).toEqual(1);
    });

    it('Layout plugin resolveActionModelValues function call', function() {
        this._data = {};
        this.plugin.resolveActionModelValues({});
        expect(this.plugin.resolveActionModelValues).toHaveBeenCalled();
        expect(this.plugin.resolveActionModelValues.calls.count()).toEqual(1);
    });

    it('Layout plugin resolveActionModelValues function call', function() {
        this._data = {};
        this.plugin.resolveActionModelValues([{type: 'click', action:[{command : 'play'}]}]);
        expect(this.plugin.resolveActionModelValues).toHaveBeenCalled();
        expect(this.plugin.resolveActionModelValues.calls.count()).toEqual(1);
    });



});