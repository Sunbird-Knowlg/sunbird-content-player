describe('Div Plugin test cases', function() {

    beforeEach(function(done) {
        var parent = {
            dimensions: function() {
                return {
                    x: 0,
                    y: 0,
                    w: 500,
                    h: 500
                }
            },
            addChild: function() {}
        }
        var data = data || {
            "fontsize": "10",
            "h": "50",
            "id": "testDiv",
            "style": "color:red; text-align:center;",
            "w": "40",
            "x": "30",
            "y": "73"
        }
        setFixtures('<div id="gameArea"><canvas id="gameCanvas" width="1366" height="768"></canvas></div>');
        this.plugin = PluginManager.invoke('div', data, parent);
        spyOn(this.plugin, 'initPlugin').and.callThrough();
        spyOn(this.plugin, 'registerEvents').and.callThrough();
        spyOn(this.plugin, '_triggerEvent').and.callThrough();

        done();
    });

    it('Gridlayout plugin initPlugin function call', function() {
        this.plugin.initPlugin({ primary: true });
        expect(this.plugin.initPlugin).toHaveBeenCalled();
        expect(this.plugin.initPlugin.calls.count()).toEqual(1);
    });

    it('Div plugin registerEvents function call validation', function() {
        this.plugin.registerEvents('testDiv');
        expect(this.plugin.registerEvents).toHaveBeenCalled();
        expect(this.plugin.registerEvents.calls.count()).toEqual(1);

    });

    it('Gridlayout plugin _triggerEvent function call', function() {
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