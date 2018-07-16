describe('Layout Plugin test cases', function() {
    beforeEach(function(done) {
        var data = {
            "cols": "2",
            "h": "20",
            "id": "grid1",
            "count": "3",
            "var": "user",
            "w": "30",
            "x": "32",
            "y": "47",
            "shadow": "black",
            "highlight": true,
            "blur": 10,
            "offsetX": 1,
            "offsetY": 1,
            "opacity": 1,
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
            },
            "events":[{"action":{"type":"command","command":"play","asset":"ht1","asset_model":"model"}},{"action":{"type":"command","command":"play","asset":"ht2", "ev-model":"model"}}],
            "iterate": 'item.title'
        };
        this.plugin = new LayoutPlugin( data, Renderer.theme._currentScene, Renderer.theme._currentScene, Renderer.theme);
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

    describe('Layout plugin getCellEvents function call', function() {
        it('When data events is an array', function() {
            this._data = {};
            var events = this.plugin.getCellEvents();
            expect(events.length).toBeDefined();
            expect(this.plugin.getCellEvents).toHaveBeenCalled();
            expect(this.plugin.getCellEvents.calls.count()).toEqual(1);
        });

        it('When data events is an object', function () {
            this.plugin._data.events = {'event': this.plugin._data.events[0]};
            var event = this.plugin.getCellEvents();
            expect(event.length).not.toBeDefined();
            expect(this.plugin.getCellEvents).toHaveBeenCalled();
            expect(this.plugin.getCellEvents.calls.count()).toEqual(1);
        });
    });

    describe('Layout plugin resolveActionModelValues function call', function() {
        it('when event is not available', function() {
            this._data = {};
            this.plugin.resolveActionModelValues({});
            expect(this.plugin.resolveActionModelValues).toHaveBeenCalled();
            expect(this.plugin.resolveActionModelValues.calls.count()).toEqual(1);
        });

        it('When event.action is an array', function() {
            this._data = {};
            this.plugin.resolveActionModelValues([{type: 'click', action:[{command : 'play', 'ev-model': 'item.title'}]}]);
            expect(this.plugin.resolveActionModelValues).toHaveBeenCalled();
            expect(this.plugin.resolveActionModelValues.calls.count()).toEqual(1);
        });

        it('When event.action is an object', function () {
            this._data = {};
            this.plugin.resolveActionModelValues({ type: 'click', action: { command: 'play', asset_model: 'item.title'}});
            expect(this.plugin.resolveActionModelValues).toHaveBeenCalled();
            expect(this.plugin.resolveActionModelValues.calls.count()).toEqual(1);
        });
    });
});