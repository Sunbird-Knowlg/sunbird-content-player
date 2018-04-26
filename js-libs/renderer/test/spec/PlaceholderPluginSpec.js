describe('Placeholder Plugin test cases', function() {
    var placeholderSampleData
    beforeAll(function(done) {
        placeholderSampleData = {
            "fontsize": "10",
            "h": "50",
            "id": "testDiv",
            "style": "color:red; text-align:center;",
            "w": "40",
            "x": "30",
            "y": "73",
            "__text": "Div plugin test case"
        }
        this.plugin = PluginManager.invoke('placeholder', placeholderSampleData, Renderer.theme._currentScene, Renderer.theme._currentScene, Renderer.theme);
        spyOn(this.plugin, 'initPlugin').and.callThrough();
        spyOn(this.plugin, 'renderPlaceHolder').and.callThrough();
        spyOn(this.plugin, 'renderText').and.callThrough();
        spyOn(this.plugin, 'renderImage').and.callThrough();
        spyOn(this.plugin, 'renderGridLayout').and.callThrough();
        spyOn(this.plugin, 'refresh').and.callThrough();
        done();
    });

    it('Placeholder plugin initPlugin function call', function() {
        this.plugin.initPlugin({ primary: true });
        expect(this.plugin.initPlugin).toHaveBeenCalled();
        expect(this.plugin.initPlugin.calls.count()).toEqual(1);
    });

    it('Placeholder plugin renderPlaceHolder function call', function() {
        this.plugin.renderPlaceHolder(this.plugin);
        expect(this.plugin.renderPlaceHolder).toHaveBeenCalled();
        // expect(this.plugin.renderPlaceHolder.calls.count()).toEqual(1);
    });

    it('Placeholder plugin renderText function call', function() {
        this.plugin.renderText(this.plugin);
        expect(this.plugin.renderText).toHaveBeenCalled();
        expect(this.plugin.renderText.calls.count()).toEqual(1);
    });

    it('Placeholder plugin renderImage function call', function() {
        this.plugin.renderImage(this.plugin);
        expect(this.plugin.renderImage).toHaveBeenCalled();
        expect(this.plugin.renderImage.calls.count()).toEqual(1);
    });

    it('Placeholder plugin renderGridLayout function call', function() {
        this.plugin.renderGridLayout(parent, this.plugin, placeholderSampleData);
        expect(this.plugin.renderGridLayout).toHaveBeenCalled();
        expect(this.plugin.renderGridLayout.calls.count()).toEqual(1);
    });

    it('Placeholder plugin refresh function call', function() {
        this.plugin.refresh({ primary: true });
        expect(this.plugin.refresh).toHaveBeenCalled();
        expect(this.plugin.refresh.calls.count()).toEqual(1);
    });

    it('Placeholder plugin tyeps  validation', function() {
        expect(this.plugin.type).not.toBeNull();
    });

    it('Placeholder plugin _render validation', function() {
        expect(true).toEqual(this.plugin._render == true);
    });

    it('Placeholder plugin _isContainer validation', function() {
        expect(false).toEqual(this.plugin._isContainer == false);
    });

    it('Plugin renderText function ', function() {
        expect(this.plugin.renderText).not.toEqual(null);
    });

    it('Plugin renderImage function',function(){
        expect(this.plugin.renderImage).not.toEqual(null)
    })

    it('Placeholder plugin renderGridLayout fun',function(){
        expect(this.plugin.renderGridLayout).not.toEqual(null)
    })

});
