describe("mcqplugin.EditorPlugin", function() {
    var plugin, popupService;

    beforeEach(function() {
        plugin = new mcqplugin.EditorPlugin({}, {}, {});
        spyOn(ecEditor, "instantiatePlugin").and.returnValue({
            id: "abcgsds",
            setCanvas: function() {},
            destroyOnLoad: function() {}
        });
        popupService = jasmine.createSpyObj("popupService", ["loadNgModules", "open"]);
        spyOn(ecEditor, "getService").and.callFake(function(serviceName) {
            if (serviceName === ServiceConstants.POPUP_SERVICE) {
                return popupService;
            }
        });
    });

    describe("initialize", function() {
        it('should load ngModules when plugin is initialized', function() {
            plugin.initialize();
            expect(popupService.loadNgModules).toHaveBeenCalled();
        });

        it('should ensure configuration popup is opened when MCQ plugin icon is clicked from top menu', function() {
            ecEditor.dispatchEvent("org.ekstep.plugins.mcqplugin:showpopup");

            var arg = popupService.open.calls.mostRecent().args[0];
            expect(popupService.open).toHaveBeenCalled();
            expect(arg.controller).toEqual("QuestionFormController");
            expect(arg.controllerAs).toEqual("$ctrl");
        });
    });

    describe('newInstance', function() {
        beforeEach(function() {
            spyOn(plugin, 'postInit');
        })

        it('should add an image representing MCQ plugin as editorObj', function() {
            plugin.newInstance();

            expect(plugin.editorObj).toEqual(jasmine.any(fabric.Image));
        });

    });

    // describe('selected onclick ', function() {
    //     spyOn(ecEditor, "getCurrentObject").and.returnValue({
    //         id:"a9369852-4aad-487b-8ba9-46a802d3213c",
    //         children:[],
    //         data:undefined,
    //         media: undefined,
    //         params:undefined
    //     });  
    //     expect(ecEditor.getCurrentObject).toHaveBeenCalled();
        

    // });
    describe('get config', function() {

        it('should return config object', function() {
            var result = plugin.getConfig();
            expect(result).toEqual(jasmine.any(Object));
        });

    });

});