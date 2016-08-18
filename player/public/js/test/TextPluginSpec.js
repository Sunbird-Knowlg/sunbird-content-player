describe('Text plugin data test cases', function() {
    var data = {
        "theme": {
            "manifest": {
                "media": [{
                    "id": "validate",
                    "src": "https://ekstep-public.s3.amazonaws.com/preview/dev/img/icons/splash.png",
                    "type": "image",
                   
                }]
            },
            "controller": {
                "id": "testdata",
                "name": "testData",
                "type": "data",
                "cdata": {
                    "model": {
                        "ts_textpg_align": "Text Plugin - Align"

                    }
                }
            },
            "controller": {
                "name": "testData",
                "type": "data",
                "id": "testdata"
            },
            "startStage": "scene1",
            "id": "theme",
            "ver": 0.3,
            "stage": [{
                "id": "scene1",
                "x": 0,
                "y": 0,
                "w": 100,
                "h": 100,
                "param": [{
                    "name": "next",
                    "value": "scene10b4a500-f08f-48cb-83db-2a62ebe12de3"
                }],
                "events": {
                    "event": []
                },
                "param": {
                    "model": "testData.ts_textpg_align",
                    "name": "heading"
                },
                "image": [{
                    "x": 34.44444444444444,
                    "y": 34.66666666666667,
                    "w": 23.88888888888889,
                    "h": 38,
                    "visible": true,
                    "editable": true,
                    "asset": "validate",
                    "z-index": 1
                }, {
                    "event": {
                        "action": {
                            "type": "command",
                            "command": "transitionTo",
                            "asset": "validate",
                            "param": "next",
                            "effect": "fadein",
                            "direction": "left",
                            "ease": "linear",
                            "duration": 500
                        },
                        "type": "click"
                    },
                    "asset": "next",
                    "x": 93,
                    "y": 3,
                    "w": 5,
                    "h": 8.3,
                    "id": "next",
                    "visible": true,
                    "editable": true,
                    "z-index": 100
                }],
                "text": [{
                    "x": 39.30555555555556,
                    "y": 23.77777777777778,
                    "w": 48.61111111111111,
                    "h": 5.826666666666666,
                    "visible": true,
                    "editable": true,
                    "__text": "Start Page",
                    "weight": "normal",
                    "font": "Helvetica",
                    "color": "#000000",
                    "fontstyle": "",
                    "fontsize": 53,
                    "lineHeight": 1.3,
                    "align": "left",
                    "z-index": 0
                }],
                "shape": [],
                "hotspot": [],
                "embed": [],
                "div": [],
                "audio": [],
                "scribble": [],
                "g": []
            }, {
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
                            "asset": "validate",
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
                "shape": [],
                "hotspot": [],
                "embed": [],
                "div": [],
                "audio": [],
                "scribble": [],
                "g": []
            }]
        }
    };
    startRenderer(data);
    var mydata = {

        "text": {
            "align": "center",
            "color": "black",
            "font": "Verdana",
            "fontsize": "2em",
            "lineHeight": 1.4,
            "model": "testData.ts_textpg_align",
            "w": 80,
            "x": 10,
            "y": 6
        }
    };

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

        Renderer.theme = {
            _currentStage: ''
        };
        this.plugin = PluginManager.invoke('text', mydata, parent);
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

        this.plugin.initPlugin(mydata);
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

    /*it("valign test", function() {
        expect(this.plugin._self.valign).not.toBe(null);
        if(this.plugin._self.valign=='top'){
        this.plugin._self.text.y=this.plugin._self.relativeDims.y;
        this.plugin._self.text.textBaseline = 'hanging';
       }
    });*/

      it("lineHeight test", function() {
        expect(this.plugin._self.lineHeight).toBe(0);
        expect(this.plugin._self.lineHeight).not.toBe(null);
    });




});