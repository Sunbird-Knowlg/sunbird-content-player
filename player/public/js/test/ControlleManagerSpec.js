describe('ControllerManager test cases', function() {
    beforeAll(function(done) {

        spyOn(ControllerManager, 'registerController').and.callThrough();
        spyOn(ControllerManager, 'isController').and.callThrough();
        spyOn(ControllerManager, 'get').and.callThrough();
        spyOn(ControllerManager, 'registerControllerInstance').and.callThrough();
        spyOn(ControllerManager, 'getControllerInstance').and.callThrough();
        spyOn(ControllerManager, 'addError').and.callThrough();
        spyOn(ControllerManager, 'getErrors').and.callThrough();
        spyOn(ControllerManager, 'reset').and.callThrough();


        window.jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
        setTimeout(function() {
           /* console.log('inside timeout');*/
            done();
        }, 500);
        done();
    });


    it('Test Controllemanager reset', function() {
        ControllerManager.reset()
        expect(ControllerManager.reset).toHaveBeenCalled();
        expect(ControllerManager.reset.calls.count()).toEqual(1);
    });
    it('Test Controllemanager registerController', function() {
        ControllerManager.registerController({
            "controller": {
                name: "assesment",
                type: "data",
                id: "assesment-details"
            }
        });
        expect(ControllerManager.registerController).toHaveBeenCalled();
        expect(ControllerManager.registerController.calls.count()).toEqual(1);
    });

    it('Test ControllerManager isController', function() {
        ControllerManager.isController({ type: "data", name: "assesment" })
        expect(ControllerManager.isController).toHaveBeenCalled();
        expect(ControllerManager.isController.calls.count()).toEqual(1);
    });

    it('Test ControllerManager get', function() {
        ControllerManager.get({ c: "data", baseDir: "js/test/assets/" });
        expect(ControllerManager.get).toHaveBeenCalled();
        expect(ControllerManager.get.calls.count()).toEqual(1);

    });
    it('Test ControllerManager registerControllerInstance', function() {
        ControllerManager.registerControllerInstance({
            name: "assesment",
            type: "data",
            id: "assesment-details"
        });
        expect(ControllerManager.registerControllerInstance).toHaveBeenCalled();
        expect(ControllerManager.registerControllerInstance.calls.count()).toEqual(1);
    });

    it('Test Controllemanager getControllerInstance', function() {
        ControllerManager.getControllerInstance({ id: "assesment-details" });
        expect(ControllerManager.getControllerInstance).toHaveBeenCalled();
        expect(ControllerManager.getControllerInstance.calls.count()).toEqual(1);
    });
    it('Test ControllerManager addError', function() {
        ControllerManager.addError({ error: "error" });
        expect(ControllerManager.addError).toHaveBeenCalled();
        expect(ControllerManager.addError.calls.count()).toEqual(1);
    });
    it('Test ControllerManager getError', function() {
        ControllerManager.getErrors();
        expect(ControllerManager.getErrors).toHaveBeenCalled();
        expect(ControllerManager.getErrors.calls.count()).toEqual(1);
    });


});