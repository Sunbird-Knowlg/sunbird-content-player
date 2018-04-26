var textSampleData = {
            "align": "center",
            "color": "black",
            "font": "Verdana",
            "fontsize": "10",
            "weight": "bold",
            "lineHeight": "1.41",
            "w": 80,
            "h": 10,
            "x": 10,
            "y": 6,
            "z-index": -1,
            "pluginType": "text",
            "shadow": "gray",
            "__text": "This a text plugin"
    };
describe('Text plugin data test cases', function() {
    beforeEach(function(done) {
        this.plugin = org.ekstep.pluginframework.pluginManager.pluginInstances['text'];
        spyOn(this.plugin, 'initPlugin').and.callThrough();
        spyOn(this.plugin, 'refresh').and.callThrough();
        done();
    });

    it('Refresh', function() {
        this.plugin.refresh();
        expect(this.plugin.refresh).toHaveBeenCalled();
        expect(this.plugin.refresh.calls.count()).toEqual(1);
    });
    it('initPlugin', function() {
        this.plugin.initPlugin(textSampleData);
        expect(this.plugin.initPlugin).toHaveBeenCalled();
        expect(this.plugin.initPlugin.calls.count()).toEqual(1);
    });

    it('initPlugin with model', function() {
        textSampleData.model = 'item.title';
        delete textSampleData.__text;
        this.plugin.initPlugin(textSampleData);
        expect(this.plugin.initPlugin).toHaveBeenCalled();
        expect(this.plugin.initPlugin.calls.count()).toEqual(1);
    });

    it("outline test", function() {
        expect(this.plugin._self.outline).toBe(0);
        expect(this.plugin._self.outline).not.toBe(null);

    });

    it("Color test", function() {
        expect(this.plugin._self.color).not.toBe(null);
    });
    it("Font test", function() {
        expect(this.plugin._self.font).not.toBe(null);
    });

    it("align test", function() {
        expect(this.plugin._self.align).not.toBe(null);
    });

    it('Plugin x and y attribute', function() {
        expect(this.plugin._self.x).toBeDefined();
        expect(this.plugin._self.x).not.toBeNull();
        expect(this.plugin._self.y).toBeDefined();
        expect(this.plugin._self.y).not.toBeNull();
    });

    it("valign test", function() {
        expect(this.plugin._self.valign).not.toBe(null);
    });

    it("lineHeight test", function() {
        if (this.plugin._self.lineHeight == undefined || this.plugin._self.lineHeight == "") {
            expect(this.plugin._self.lineHeight).toBe(0);
        }
        expect(this.plugin._self.lineHeight).not.toBe(null);
    });
});
