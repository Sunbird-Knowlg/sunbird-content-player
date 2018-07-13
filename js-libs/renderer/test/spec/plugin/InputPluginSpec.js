describe('Input Plugin test cases', function() {
    var  data;
    beforeAll(function(done) {
        data = {
            "x": 0,
            "y": 0,
            "w": 50,
            "h": 50,
            "type": "text/radio/checkbox/number",
            "id": "input",
            "class": "inputText",
            "model":"input"
        };        
        this.plugin = PluginManager.invoke('input', data, Renderer.theme._currentScene, Renderer.theme._currentScene, Renderer.theme);
        done();
    })
    it('Input plugin init properties', function() {
        expect(this.plugin._self.x).toBeDefined();
        expect(this.plugin._self.y).toBeDefined();
        expect(this.plugin._self.x).not.toBeNull();
        expect(this.plugin._self.y).not.toBeNull();
        expect(this.plugin._self.id).toBeDefined();
        expect(this.plugin._self.id).not.toBeNull();
        expect(document.getElementById(data.id)).toBeDefined();

    });
    it('if input is already initialized', function() {
        spyOn(EventManager, 'processAppTelemetry').and.callThrough()
        delete data.model;
        data.param = 'param';
        PluginManager.invoke('input', data, Renderer.theme._currentScene, Renderer.theme._currentScene, Renderer.theme);
        $('#' + this.plugin._data.id).change();
        $('#' + this.plugin._data.id).click();
        expect(EventManager.processAppTelemetry).toHaveBeenCalled();
        expect(document.getElementsByClassName(data.class).length).toEqual(1);
    });

    describe('Input plugin updateState function call', function() {
        it('stage controller is present', function () {
            spyOn(this.plugin, 'updateState').and.callThrough()
            spyOn(this.plugin, 'setState').and.callThrough()
            spyOn(this.plugin, 'setModelValue').and.callThrough()
            this.plugin.updateState(true);
            expect(this.plugin.updateState).toHaveBeenCalled();
            expect(this.plugin.setModelValue).toHaveBeenCalled();
            expect(this.plugin.setState).toHaveBeenCalled();
            expect(this.plugin.setModelValue.calls.count()).toEqual(1);
            expect(this.plugin.setState.calls.count()).toEqual(1);
            expect(this.plugin.updateState.calls.count()).toEqual(1);
        });

        it('stage controller is not present', function () {
            var controller = _.clone(this.plugin._stage._stageController);
            this.plugin._stage._stageController = undefined;
            spyOn(this.plugin, 'updateState').and.callThrough()
            spyOn(this.plugin, 'setState').and.callThrough()
            spyOn(this.plugin, 'setModelValue').and.callThrough()
            this.plugin.updateState(true);
            expect(this.plugin.updateState).toHaveBeenCalled();
            expect(this.plugin.setModelValue).toHaveBeenCalled();
            expect(this.plugin.setState).toHaveBeenCalled();
            expect(this.plugin.setModelValue.calls.count()).toEqual(1);
            expect(this.plugin.setState.calls.count()).toEqual(1);
            expect(this.plugin.updateState.calls.count()).toEqual(1);
            this.plugin._stage._stageController = controller;
        });
    })
});