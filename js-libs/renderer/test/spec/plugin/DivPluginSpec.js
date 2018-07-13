describe('Div Plugin test cases', function() {
    var divPluginSampleData
    beforeEach(function(done) {
        divPluginSampleData = {
            "fontsize": "10",
            "h": "50",
            "id": "testDiv",
            "style": "color:red; text-align:center;",
            "w": "40",
            "x": "30",
            "y": "73",
            "__text": "Div plugin test case"
        }
        this.plugin = PluginManager.invoke('div', divPluginSampleData, Renderer.theme._currentScene, Renderer.theme._currentScene, Renderer.theme);
        spyOn(this.plugin, 'initPlugin').and.callThrough();
        spyOn(this.plugin, 'registerEvents').and.callThrough();
        spyOn(this.plugin, '_triggerEvent').and.callThrough();
        done();
    });

    it('Div plugin initPlugin function call when model is available', function() {
        delete divPluginSampleData.__text;
        divPluginSampleData.model = "item.title";
        this.plugin.initPlugin(divPluginSampleData);
        expect(this.plugin.initPlugin).toHaveBeenCalled();
        expect(this.plugin.initPlugin.calls.count()).toEqual(1);
    });

    it('Div plugin initPlugin function call when param is available', function () {
        delete divPluginSampleData.__text;
        divPluginSampleData.param = "item.title";
        this.plugin.initPlugin(divPluginSampleData);
        expect(this.plugin.initPlugin).toHaveBeenCalled();
        expect(this.plugin.initPlugin.calls.count()).toEqual(1);
    });

    it('Div plugin registerEvents function call validation', function() {
        var para = document.createElement("P");
        var t = document.createTextNode("This is a paragraph.");
        para.appendChild(t);
        document.getElementById("testDiv").appendChild(para);
        this.plugin.registerEvents('testDiv');
        expect(this.plugin.registerEvents).toHaveBeenCalled();
        expect(this.plugin.registerEvents.calls.count()).toEqual(1);

    });

    it('Div plugin plugin _triggerEvent function call', function() {
        this.plugin._triggerEvent();
        expect(this.plugin._triggerEvent).toHaveBeenCalled();
        expect(this.plugin._triggerEvent.calls.count()).toEqual(1);
    });

    it('Div plugin init attribute validation', function() {
        expect(this.plugin._self.x).not.toBeNull();
        expect(this.plugin._self.y).not.toBeNull();

        expect(this.plugin._self.w).not.toBeNull();

        expect(this.plugin._self.h).not.toBeNull();
    });
    
    it('Div plugin postion validation', function() {
        expect(this.plugin._self.position).not.toBeNull();
        expect(false).toEqual(this.plugin._self.position == "absolute");
    });
   /* it('Div container validation', function() {
        expect(false).toEqual(this.plugin._isContainer == true);

    });
    it('Div render validation', function() {
        expect(true).toEqual(this.plugin._render == true);

    });*/
    



});