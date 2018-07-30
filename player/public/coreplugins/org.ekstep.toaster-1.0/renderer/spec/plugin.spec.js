describe('Toaster Plugin', function() {
    var manifest, toasterInstance;
    beforeAll(function(callback) {
        org.ekstep.contentrenderer.loadPlugins([{"id":"org.ekstep.toaster","ver":1,"type":"plugin"}], [], function() {
            console.log("Toaster plugin is loaded");
            toastr = {error: function(){}};
            toasterInstance = org.ekstep.pluginframework.pluginManager.pluginObjs['org.ekstep.toaster'];
            manifest = org.ekstep.pluginframework.pluginManager.pluginManifests['org.ekstep.toaster'];
            callback();
        });
    });
    describe("When Toaster plugin is initialized", function() {
        it("It should invoke initialize", function() {
            spyOn(toasterInstance, "initialize").and.callThrough();
            toasterInstance.initialize();
            expect(toasterInstance.initialize).not.toBeUndefined();
            expect(toasterInstance.initialize).to.toHaveBeenCalled();
        });

        it("It should invoke customize", function() {
            var event = {'event':'event'}; var obj = {'custom':'', 'type':'WARNING'};
            spyOn(toasterInstance, "customize").and.callThrough();
            toasterInstance.customize(event, obj);
            expect(toasterInstance.customize).not.toBeUndefined();
            expect(toasterInstance.customize).toHaveBeenCalledWith(event, obj);
        });

        it("It should invoke customize and type ERROR", function() {
            var event = {}; var obj = {'custom':'CUSTOM', 'type':'ERROR', 'errorInfo':'errorInfo'};
            spyOn(toasterInstance, "customize").and.callThrough();
            toasterInstance.customize(event, obj);
            expect(toasterInstance.customize).not.toBeUndefined();
            expect(toasterInstance.customize).toHaveBeenCalledWith(event, obj);
        });

        it("It should invoke customize and type ERROR errorInfo is undefined ", function() {
            var event = {}; var obj = {'custom':'CUSTOM', 'type':'ERROR'};
            spyOn(toasterInstance, "customize").and.callThrough();
            toasterInstance.customize(event, obj);
            expect(toasterInstance.customize).not.toBeUndefined();
            expect(toasterInstance.customize).toHaveBeenCalledWith(event, obj);
        });

        it("It should invoke customize and type INFO", function() {
            var event = {}; var obj = {'custom':'CUSTOM', 'type':'INFO'};
            spyOn(toasterInstance, "customize").and.callThrough();
            toasterInstance.customize(event, obj);
            expect(toasterInstance.customize).not.toBeUndefined();
            expect(toasterInstance.customize).toHaveBeenCalledWith(event, obj);
        });

        it("It should invoke customize and type is not needed", function() {
            var event = {}; var obj = {'custom':'', 'type':''};
            spyOn(toasterInstance, "customize").and.callThrough();
            toasterInstance.customize(event, obj);
            expect(toasterInstance.customize).not.toBeUndefined();
            expect(toasterInstance.customize).toHaveBeenCalledWith(event, obj);
        });
    });
});