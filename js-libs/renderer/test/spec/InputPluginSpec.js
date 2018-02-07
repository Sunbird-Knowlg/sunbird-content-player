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
        delete data.model;
        data.param = 'param';
        PluginManager.invoke('input', data, Renderer.theme._currentScene, Renderer.theme._currentScene, Renderer.theme);
        expect(document.getElementsByClassName(data.class).length).toEqual(1);
    });
});