describe('Scribble Plugin test cases', function() {

    beforeEach(function(done) {
        this.plugin = org.ekstep.pluginframework.pluginManager.pluginInstances.scribble;
        this.plugin._self.parent = Renderer.theme._currentScene._self;
        spyOn(this.plugin, 'initPlugin').and.callThrough();
        spyOn(this.plugin, 'setBounderies').and.callThrough();
        spyOn(this.plugin, 'handleMouseDown').and.callThrough();
        spyOn(this.plugin, 'handleMouseMove').and.callThrough();
        spyOn(this.plugin, 'handleMouseUp').and.callThrough();
        spyOn(this.plugin, 'isInt').and.callThrough();
        spyOn(this.plugin, 'clear').and.callThrough();
        spyOn(this.plugin, 'show').and.callThrough();
        spyOn(this.plugin, 'hide').and.callThrough();
        spyOn(this.plugin, 'toggleShow').and.callThrough();
        done();
    });

    it('Scribble plugin initPlugin', function() {
        expect(true).toEqual(this.plugin.paintBrush instanceof createjs.Shape);
        expect(true).toEqual(this.plugin._self instanceof createjs.Container);
        this.plugin.initPlugin({ primary: true, opacity: 0, w: 6, h: 6 });
        expect(this.plugin.initPlugin).toHaveBeenCalled();
        expect(this.plugin.initPlugin.calls.count()).toEqual(1);
    });

    it('Scribble plugin handleMouseDown', function() {
        this.plugin.handleMouseDown({ primary: true });
        expect(this.plugin.handleMouseDown).toHaveBeenCalled();
        expect(this.plugin.handleMouseDown.calls.count()).toEqual(1);
    });

    it('Scribble plugin setBounderies', function() {
        this.plugin.setBounderies({ primary: true });
        expect(this.plugin.setBounderies).toHaveBeenCalled();
        expect(this.plugin.setBounderies.calls.count()).toEqual(1);
    });

    it('Scribble plugin handleMouseMove', function() {
        this.plugin.handleMouseDown({ primary: true });
        this.plugin.handleMouseMove({ primary: true, _shapePoint: { x: 5, y: 5 }, stageX: 10, stageY: 7 });
        this.plugin._data.thickness = 2;
        this.plugin.handleMouseMove({ primary: true, _shapePoint: { x: 5, y: 5 }, stageX: 10, stageY: 7 });
        expect(this.plugin.handleMouseMove).toHaveBeenCalled();
        expect(this.plugin.handleMouseMove.calls.count()).toEqual(2);
    });

    it('Scribble plugin handleMouseUp', function() {
        this.plugin.handleMouseUp({ primary: true });
        expect(this.plugin.handleMouseUp).toHaveBeenCalled();
        expect(this.plugin.handleMouseUp.calls.count()).toEqual(1);
    });

    it('Scribble plugin isInt', function() {
        this.plugin.isInt('44.9');
        expect(this.plugin.isInt).toHaveBeenCalled();
        expect(this.plugin.isInt.calls.count()).toEqual(1);
    });

    it('Scribble plugin clear', function() {
        this.plugin.clear({ primary: true });
        expect(this.plugin.clear).toHaveBeenCalled();
        expect(this.plugin.clear.calls.count()).toEqual(1);
    });

    it('Scribble plugin show', function () {
        expect(this.plugin._self).toBeDefined();
        expect(this.plugin._self.parent).toBeDefined();
        this.plugin.show();
        expect(this.plugin.show).toHaveBeenCalled();
        expect(this.plugin.show.calls.count()).toEqual(1);
        expect(this.plugin._self.visible).toBeTruthy();
    });

    it('Scribble plugin hide', function () {
        expect(this.plugin._self).toBeDefined();
        expect(this.plugin._self.parent).toBeDefined();
        this.plugin.hide();
        expect(this.plugin.hide).toHaveBeenCalled();
        expect(this.plugin.hide.calls.count()).toEqual(1);
        expect(this.plugin._self.visible).not.toBeTruthy();
    });

    it('Scribble plugin toggleShow when it is visible', function () {
        expect(this.plugin._self).toBeDefined();
        expect(this.plugin._self.parent).toBeDefined();
        this.plugin._self.visible = true;
        this.plugin.toggleShow();
        expect(this.plugin.toggleShow).toHaveBeenCalled();
        expect(this.plugin.toggleShow.calls.count()).toEqual(1);
        expect(this.plugin._self.visible).not.toBeTruthy();
    });

    it('Scribble plugin toggleShow when it is not visible', function () {
        expect(this.plugin._self).toBeDefined();
        expect(this.plugin._self.parent).toBeDefined();
        this.plugin._self.visible = false;
        this.plugin.toggleShow();
        expect(this.plugin.toggleShow).toHaveBeenCalled();
        expect(this.plugin.toggleShow.calls.count()).toEqual(1);
        expect(this.plugin._self.visible).toBeTruthy();
    });

});