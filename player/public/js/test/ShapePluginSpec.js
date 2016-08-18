describe('Shape Plugin test cases', function() {
 /*   var data = {
        "theme": {
            "manifest": {
                "media": [{
                    "id": "validate",
                    "src": "https://ekstep-public.s3.amazonaws.com/preview/dev/img/icons/splash.png",
                    "type": "image",
                    "assetId": "domain_38852"
                }]
            },
            "startStage": "scene10b4a500-f08f-48cb-83db-2a62ebe12de3",
            "id": "theme",
            "ver": 0.3,
            "stage": [{
                "id": "scene10b4a500-f08f-48cb-83db-2a62ebe12de3",
                "x": 0,
                "y": 0,
                "w": 100,
                "h": 100,
                "param": [{
                    "name": "previous",
                    "value": "scene1"
                }],
                "events": {
                    "event": []
                },
                "image": [{
                    "x": 37.22222222222222,
                    "y": 40.88888888888889,
                    "w": 22.083333333333332,
                    "h": 34.66666666666667,
                    "visible": true,
                    "editable": true,
                    "asset": "domain_665",
                    "z-index": 1
                }, {
                    "event": {
                        "action": {
                            "type": "command",
                            "command": "transitionTo",
                            "asset": "domain_38852",
                            "param": "previous",
                            "effect": "fadein",
                            "direction": "right",
                            "ease": "linear",
                            "duration": 100
                        },
                        "type": "click"
                    },
                    "asset": "previous",
                    "x": 2,
                    "y": 3,
                    "w": 5,
                    "h": 8.3,
                    "id": "previous",
                    "visible": true,
                    "editable": true,
                    "z-index": 100
                }],
                "text": [{
                    "x": 42.916666666666664,
                    "y": 30.444444444444446,
                    "w": 48.61111111111111,
                    "h": 5.826666666666666,
                    "visible": true,
                    "editable": true,
                    "__text": "End Page",
                    "weight": "normal",
                    "font": "Helvetica",
                    "color": "#000000",
                    "fontstyle": "",
                    "fontsize": 53,
                    "lineHeight": 1.3,
                    "align": "left",
                    "z-index": 0
                }],
                "shape": {
                    "type": "rect",
                    "x": "87",
                    "y": "82",
                    "w": "13",
                    "h": "18",
                    "hitArea": "true",
                    "event": {
                        "type": "click",
                        "action": {
                            "type": "command",
                            "command": "togglePlay",
                            "asset": "fair_sound"
                        }
                    }
                },
                "hotspot": [],
                "embed": [],
                "div": [],
                "audio": [],
                "scribble": [],
                "g": []
            }]
        }
    };
    startRenderer(data);*/

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
        };
        var mydata = {
            "shape": [{
                "x": 20,
                "y": 20,
                "w": 60,
                "h": 60,
                "visible": true,
                "editable": true,
                "type": "roundrect",
                "radius": 10,
                "opacity": 1,
                "fill": "#45b3a5",
                "stroke-width": 1,
                "z-index": 0,
                "id": "textBg"
            }]
        };

        Renderer.theme = {
            _currentStage: ''
        };
        this.plugin = PluginManager.invoke('shape', mydata, parent);
        spyOn(this.plugin, 'initPlugin').and.callThrough();

        done();
    });

    it('initPlugin', function() {
        this.plugin.initPlugin({
            primary: true
        });
        expect(this.plugin.initPlugin).toHaveBeenCalled();
        expect(this.plugin.initPlugin.calls.count()).toEqual(1);
    });
    it("fill attribute", function() {


        expect(this.plugin._self.fill).not.toBe(null);
    });
    it("check the mouse is enable or not", function() {
        expect(this.plugin._self.mouseEnabled).toBe(true);
        expect(this.plugin._self.mouseEnabled).not.toBe(false);

    });
    it("comman attribute", function() {
        expect(this.plugin._self.x).toBeDefined();
        expect(this.plugin._self.y).toBeDefined();
        expect(this.plugin._self.x).not.toBeNull();
        expect(this.plugin._self.y).not.toBeNull();
        expect(this.plugin._self.h).not.toBeNull();
        expect(this.plugin._self.w).not.toBeNull();

    });
    it('type attribute', function() {
        expect(this.plugin._self.type).not.toBeNull();
    });

    it('shape instance', function() {
        expect(true).toEqual(this.plugin._self instanceof createjs.Shape);
    });

    it("Stroke ", function() {
        expect(this.plugin._self.stroke).not.toBeNull();
    });
    xit('hitArea', function() {
        expect(true).toEqual(this.plugin._self.hitArea instanceof createjs.Shape);
    });
    it('Opacity', function() {
        expect(this.plugin._self.opacity).not.toBeNull();
    });
    /*it('data type',function(){
        var graphics = this.plugin._self.graphics;
        var dims = this.plugin.relativeDims();
   
        if(data.type==='rect'){
            console.log("yes");
            graphics.dr(0, 0, dims.w, dims.h);
        }else if(data.type==='roundrect'){
            graphics.drawRoundRect(0, 0, dims.w, dims.h, radius);
        }else if(data.type==='circle'){
            graphics.drawRoundRect(0, 0, dims.w, dims.h, radius);
        }
      
    });*/


});