describe('Video plugin Jasmine test cases', function() {

    var data;
    beforeEach(function() {
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
        data = {

            "x": 0,
            "y": 0,
            "w": 40,
            "h": 50,
            "src": "videos/Wheels_On_The_Bus.webm",
            "type": "video/webm",
            "autoplay": false,
            "controls": false

        };

        Renderer.theme = { _currentStage: '' };
        this.plugin = PluginManager.invoke('video', data, parent);
        spyOn(this.plugin, 'initPlugin').and.callThrough()
    });

    it("Video plugin initPlugin function validation", function() {
        this.plugin.initPlugin(data)
        expect(this.plugin.initPlugin).toHaveBeenCalled();
        expect(this.plugin.initPlugin.calls.count()).toEqual(1);
    });


    it("Video object defined", function() {
        expect(data).toBeDefined();
    });

    it("Video properties", function() {
        expect(data.x).toBeDefined();
        expect(data.y).toBeDefined();
        expect(data.w).toBeGreaterThan(0);
        expect(data.h).toBeGreaterThan(0);

        //Mandatory properties for video plugin
        expect(data.src).toBeDefined();
        expect(data.type).toBeDefined();
        expect(data.autoplay).toBeDefined();

        //Optional properties
        //expect(data.video.controls).toBeDefined(); 
    });

    it("Check video format", function() {
        expect(data.src).toMatch(/(.*?)\.(ogv|webm)/g);
        expect(data.type).toMatch(/(.*?)\/(ogv|webm)/g);
    })

    /*it("Check video format and type ", function(){
        expect(["apples", "oranges", "pears"]).toContain("oranges");
    });*/

    /*it("Video Plugin initialize", function(){
        this.plugin = PluginManager.invoke('video', data, parent);
    });*/
});