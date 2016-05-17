describe('Video plugin Jasmine test cases', function () {
   
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
       data = data || {
            "video": {
                "x": 0,
                "y": 0,
                "w": 40,
                "h": 50,
                "src": "videos/Wheels_On_The_Bus.webm",
                "type": "video/webm",
                "autoplay": true,
                "controls": false
            }
        };    	
    });

    it("Video object defined", function(){
        expect(data.video).toBeDefined();

        /*describe("Video source to be defined", function(){
            expect(data.video.src).toBeDefined();            
        });*/
    });

    it("Video properties", function(){
        expect(data.video.x).toBeDefined(); 
        expect(data.video.y).toBeDefined(); 
        expect(data.video.w).toBeGreaterThan(0); 
        expect(data.video.h).toBeGreaterThan(0); 

        //Mandatory properties for video plugin
        expect(data.video.src).toBeDefined(); 
        expect(data.video.type).toBeDefined(); 
        expect(data.video.autoplay).toBeDefined(); 

        //Optional properties
        //expect(data.video.controls).toBeDefined(); 
    });

    it("Check video format", function(){
        expect(data.video.src).toMatch(/(.*?)\.(ogv|webm)/g);
        expect(data.video.type).toMatch(/(.*?)\/(ogv|webm)/g);
    })

    /*it("Check video format and type ", function(){
        expect(["apples", "oranges", "pears"]).toContain("oranges");
    });*/

    /*it("Video Plugin initialize", function(){
        this.plugin = PluginManager.invoke('video', data, parent);
    });*/
});