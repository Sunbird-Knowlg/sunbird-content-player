describe('Placeholder Plugin test cases', function() {
    var placeholderSampleData = {"fontsize": "10","h": "50","id": "testDiv","style": "color:red; text-align:center;","w": "40","x": "30","y": "73","__text": "Div plugin test case", "snapTo": true};
    beforeEach(function(done) {
        this.plugin = PluginManager.invoke('placeholder', placeholderSampleData, Renderer.theme._currentScene, Renderer.theme._currentScene, Renderer.theme);
        spyOn(this.plugin, 'initPlugin').and.callThrough();
        spyOn(this.plugin, 'renderPlaceHolder').and.callThrough();
        spyOn(this.plugin, 'renderText').and.callThrough();
        spyOn(this.plugin, 'renderImage').and.callThrough();
        spyOn(this.plugin, 'getAssetBound').and.callThrough();
        spyOn(this.plugin, 'computePixel').and.callThrough();
        spyOn(this.plugin, 'renderGridLayout').and.callThrough();
        spyOn(this.plugin, 'refresh').and.callThrough();
        done();
    });

    it('Placeholder plugin initPlugin is invoked', function () {
        this.plugin._data.type = 'image';
        this.plugin._data.asset = true;
        this.plugin.initPlugin({ primary: true });
        expect(this.plugin.initPlugin).toHaveBeenCalled();
        expect(this.plugin.initPlugin.calls.count()).toEqual(1);
    });

    describe('Placeholder plugin renderPlaceHolder function call', function() {
        it('Placeholder plugin renderPlaceHolder function call', function () {
            this.plugin._data.type = 'text';
            this.plugin._data.asset = true;
            this.plugin.renderPlaceHolder(this.plugin);
            expect(this.plugin.renderPlaceHolder).toHaveBeenCalled();
            expect(this.plugin.renderPlaceHolder.calls.count()).toEqual(1);
        });

        it('when param-* is available', function () {
            delete this.plugin._data.type;
            delete this.plugin._data.asset;
            delete this.plugin._data['model-type'];
            delete this.plugin._data['model-count'];
            delete this.plugin._data['model-asset'];
            this.plugin._data['param-type'] = "item.title";
            this.plugin._data['param-count'] = "2";
            this.plugin._data['param-asset'] = "item.title";
            this.plugin.renderPlaceHolder(this.plugin);
            expect(this.plugin.renderPlaceHolder).toHaveBeenCalled();
            expect(this.plugin.renderPlaceHolder.calls.count()).toEqual(1);
        });

        it('when model-* is available', function () {
            delete this.plugin._data['param-type'];
            delete this.plugin._data['param-count'];
            delete this.plugin._data['param-asset'];
            this.plugin._data['model-type'] = "item.title";
            this.plugin._data['model-count'] = "2";
            this.plugin._data['model-asset'] = "item.title";
            this.plugin.renderPlaceHolder(this.plugin);
            expect(this.plugin.renderPlaceHolder).toHaveBeenCalled();
            expect(this.plugin.renderPlaceHolder.calls.count()).toEqual(1);
        });

        it('when param is available', function () {
            delete this.plugin._data.model;
            this.plugin._data.param = "item.title";
            this.plugin.renderPlaceHolder(this.plugin);
            expect(this.plugin.renderPlaceHolder).toHaveBeenCalled();
            expect(this.plugin.renderPlaceHolder.calls.count()).toEqual(1);
        });

        it('when model is available', function () {
            delete this.plugin._data.param;
            this.plugin._data.model = "item.title";
            this.plugin.renderPlaceHolder(this.plugin);
            expect(this.plugin.renderPlaceHolder).toHaveBeenCalled();
            expect(this.plugin.renderPlaceHolder.calls.count()).toEqual(1);
        });
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

    it('Placeholder plugin computePixel function call', function () {
        var pixel = this.plugin.computePixel(200, 2);
        expect(this.plugin.computePixel).toHaveBeenCalled();
        expect(pixel).toBeDefined();
        expect(this.plugin.computePixel.calls.count()).toEqual(1);
    });

    describe('Placeholder plugin renderGridLayout function call', function() {
        it('When image is available', function() {
            this.plugin.param = { type: 'image', asset: 'do_2122479583895552001118',count: 2}
            this.plugin._dimensions.h = 100;
            this.plugin._dimensions.w = 10;
            this.plugin._data.enabledrag = true;
            this.plugin.renderGridLayout(Renderer.theme._currentScene, this.plugin, placeholderSampleData);
            expect(this.plugin.renderGridLayout).toHaveBeenCalled();
            expect(this.plugin.renderGridLayout.calls.count()).toEqual(1);
        });

        it('When image is not loaded', function () {
            this.plugin.param = { type: 'image', asset: 'no_image', count: 2 }
            this.plugin._dimensions.h = 100;
            this.plugin._dimensions.w = 10;
            this.plugin._data.enabledrag = true;
            this.plugin.renderGridLayout(Renderer.theme._currentScene, this.plugin, placeholderSampleData);
            expect(this.plugin.renderGridLayout).toHaveBeenCalled();
            expect(this.plugin.renderGridLayout.calls.count()).toEqual(1);
        });

        it('When image is not available', function () {
            this.plugin.param = { type: 'image', asset: 'do_21224795838955520011181', count: 2 }
            this.plugin._dimensions.h = 100;
            this.plugin._dimensions.w = 10;
            this.plugin._data.enabledrag = true;
            this.plugin.renderGridLayout(Renderer.theme._currentScene, this.plugin, placeholderSampleData);
            expect(this.plugin.renderGridLayout).toHaveBeenCalled();
            expect(this.plugin.renderGridLayout.calls.count()).toEqual(1);
        });

        // it('When image mousedown event is triggured', function () {
        //     this.plugin.renderGridLayout(Renderer.theme._currentScene, this.plugin, placeholderSampleData);
        //     expect(this.plugin.renderGridLayout).toHaveBeenCalled();
        //     expect(this.plugin.renderGridLayout.calls.count()).toEqual(1);
        // });
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
