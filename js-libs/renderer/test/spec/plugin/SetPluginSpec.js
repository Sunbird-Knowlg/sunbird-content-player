describe('set Plugin test cases', function() {
    var setPluginData = { 
        param: "explore", scope: "content", value:"true", model: "item.title", item: {tens: '1'}
    }
     beforeEach(function(done) {
        this.plugin = PluginManager.invoke('set', setPluginData, Renderer.theme._currentScene, Renderer.theme._currentScene, Renderer.theme);
        spyOn(this.plugin, 'initPlugin').and.callThrough();
        spyOn(this.plugin, 'replaceExpressions').and.callThrough();
        spyOn(this.plugin, 'setParam').and.callThrough();
        spyOn(this.plugin, 'setParamValue').and.callThrough();
        spyOn(this.plugin, 'getParam').and.callThrough();
        done();
    });

    it('Embed plugin container field validation', function() {
        expect(true).toEqual(this.plugin._isContainer == false);
    });

    it('Embed plugin render field validation', function() {
        expect(false).toEqual(this.plugin._render == true);
    });
    describe('Set plugin initPlugin', function() {
        it('when ev-value is an array', function() {
            delete setPluginData.model;
            delete setPluginData['ev-model'];
            setPluginData['ev-value'] = "['1']";
            this.plugin.initPlugin(setPluginData);
            expect(this.plugin.initPlugin).toHaveBeenCalled();
            expect(this.plugin.initPlugin.calls.count()).toEqual(1);
        });
        it('when ev-value is not an array', function () {
            delete setPluginData.model;
            delete setPluginData['ev-model'];
            setPluginData['ev-value'] = "1";
            this.plugin.initPlugin(setPluginData);
            expect(this.plugin.initPlugin).toHaveBeenCalled();
            expect(this.plugin.initPlugin.calls.count()).toEqual(1);
        });
        it('when ev-model is an array', function () {
            delete setPluginData.model;
            delete setPluginData['ev-value'];
            setPluginData['ev-model'] = "item.model";
            this.plugin.initPlugin(setPluginData);
            expect(this.plugin.initPlugin).toHaveBeenCalled();
            expect(this.plugin.initPlugin.calls.count()).toEqual(1);
        });
        it('when ev-model is not an array', function () {
            delete setPluginData.model;
            delete setPluginData['ev-value'];
            setPluginData['ev-model'] = "item.title";
            this.plugin.initPlugin(setPluginData);
            expect(this.plugin.initPlugin).toHaveBeenCalled();
            expect(this.plugin.initPlugin.calls.count()).toEqual(1);
        });
    });

    it('Set plugin replaceExpressions', function() {
        delete setPluginData.model;
        delete setPluginData['ev-value'];
        setPluginData['ev-model'] = "item.title";
        this.plugin.replaceExpressions("${item.tens}");
        expect(this.plugin.replaceExpressions).toHaveBeenCalled();
        expect(this.plugin.replaceExpressions.calls.count()).toEqual(1);
    });

    describe('Set plugin setParam function', function() {
        it('When scope is app', function () {
            this.plugin.setParam("Param_name", "12", 12, "app", 10 );
            expect(this.plugin.setParam).toHaveBeenCalled();
            expect(this.plugin.setParam.calls.count()).toEqual(1);
        });

        it('When scope is stage', function() {
            this.plugin.setParam("Param_name", "12", 12, "stage", 10);
            expect(this.plugin.setParam).toHaveBeenCalled();
            expect(this.plugin.setParam.calls.count()).toEqual(1);
        });

        it('When scope is parent', function () {
            this.plugin.setParam("Param_name", "12", 12, "parent", 10 );
            expect(this.plugin.setParam).toHaveBeenCalled();
            expect(this.plugin.setParam.calls.count()).toEqual(1);
        });
    });

    it('Get plugin getParam', function() {
        this.plugin.getParam("param");
        expect(this.plugin.getParam).toHaveBeenCalled();
        expect(this.plugin.getParam.calls.count()).toEqual(1);
    });

    describe('SetPlugin setParamValue', function() {
        describe('when param-index is previous', function() {
            it('When model is not an array', function() {
                var action = { param: "Param_name", value: "12", incr: 12, scope: "stage", max: 10 }
                action['param-index'] = 'previous';
                action['param-max'] = 'previous';
                this.plugin.setParamValue(action);
                expect(this.plugin.setParamValue).toHaveBeenCalled();
                expect(this.plugin.setParamValue.calls.count()).toEqual(1);
            });

            it('When model is an array', function () {
                var action = { param: "Param_name", value: "12", incr: 12, scope: "stage", max: 10 }
                action['param-index'] = 'previous';
                action['param-max'] = 'previous';
                this.plugin._model = ['1', '2'];
                this.plugin.setParamValue(action);
                expect(this.plugin.setParamValue).toHaveBeenCalled();
                expect(this.plugin.setParamValue.calls.count()).toEqual(1);
            });

            it('When model is an array & index is > 0', function () {
                var action = { param: "Param_name", value: "12", incr: 12, scope: "stage", max: 10 }
                action['param-index'] = 'previous';
                action['param-max'] = '0';
                this.plugin._model = ['1', '2'];
                this.plugin._index = 1;
                this.plugin.setParamValue(action);
                expect(this.plugin.setParamValue).toHaveBeenCalled();
                expect(this.plugin.setParamValue.calls.count()).toEqual(1);
            });
        })

        describe('When param-index is not previous', function() {
            it('When index is < model length', function () {
                var action = { param: "Param_name", value: "12", incr: 12, scope: "stage", max: 10 }
                action['param-index'] = '1';
                this.plugin._model = ['1', '2'];
                this.plugin.setParamValue(action);
                expect(this.plugin.setParamValue).toHaveBeenCalled();
                expect(this.plugin.setParamValue.calls.count()).toEqual(1);
            });

            it('When index is > model length', function () {
                var action = { param: "Param_name", value: "12", incr: 12, scope: "stage", max: 10 }
                action['param-index'] = '1';
                this.plugin._model = ['1', '2'];
                this.plugin._index = 3;
                this.plugin.setParamValue(action);
                expect(this.plugin.setParamValue).toHaveBeenCalled();
                expect(this.plugin.setParamValue.calls.count()).toEqual(1);
            });
        })

        it('When param-key is available', function () {
            var action = { param: "Param_name", value: "12", incr: 12, scope: "stage", max: 10 }
            action['param-key'] = 'test';
            this.plugin.setParamValue(action);
            expect(this.plugin.setParamValue).toHaveBeenCalled();
            expect(this.plugin.setParamValue.calls.count()).toEqual(1);
        });

        it('When param-key is available & model is not object', function () {
            var action = { param: "Param_name", value: "12", incr: 12, scope: "stage", max: 10 }
            action['param-index'] = '1';
            this.plugin.setParamValue(action);
            expect(this.plugin.setParamValue).toHaveBeenCalled();
            expect(this.plugin.setParamValue.calls.count()).toEqual(1);
        });

        describe('When ev-value is available', function() {
            xit('When model is array', function () {
                var action = { param: "Param_name", value: "12", incr: 12, scope: "stage", max: 10 }
                action['ev-value'] = '${item.tens}';
                this.plugin.setParamValue(action);
                expect(this.plugin.setParamValue).toHaveBeenCalled();
                expect(this.plugin.setParamValue.calls.count()).toEqual(1);
            });

            it('When ev-value is available & model is not array', function () {
                var action = { param: "Param_name", value: "12", incr: 12, scope: "stage", max: 10 }
                action['ev-value'] = '1';
                this.plugin.setParamValue(action);
                expect(this.plugin.setParamValue).toHaveBeenCalled();
                expect(this.plugin.setParamValue.calls.count()).toEqual(1);
            });
        });

        it('When ev-model is available & model is array', function () {
            var action = { param: "Param_name", value: "12", incr: 12, scope: "stage", max: 10 }
            action['ev-model'] = '1';
            this.plugin.setParamValue(action);
            expect(this.plugin.setParamValue).toHaveBeenCalled();
            expect(this.plugin.setParamValue.calls.count()).toEqual(1);
        });

        it('When ev-model is available & model is not array', function () {
            var action = { param: "Param_name", value: "12", incr: 12, scope: "stage", max: 10 }
            action['ev-model'] = '1';
            this.plugin.setParamValue(action);
            expect(this.plugin.setParamValue).toHaveBeenCalled();
            expect(this.plugin.setParamValue.calls.count()).toEqual(1);
        });

        it('When param-value is available', function () {
            var action = { param: "Param_name", value: "12", incr: 12, scope: "stage", max: 10 }
            action['param-value'] = '1';
            this.plugin.setParamValue(action);
            expect(this.plugin.setParamValue).toHaveBeenCalled();
            expect(this.plugin.setParamValue.calls.count()).toEqual(1);
        });
    })
});
