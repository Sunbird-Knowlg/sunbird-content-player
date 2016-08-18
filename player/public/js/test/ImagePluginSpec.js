describe('Image Plugin test cases', function() {

    var data = {
        "theme": {
            "manifest": {
                "media": [{
                    "id": "validate",
                    "src": "https://ekstep-public.s3.amazonaws.com/preview/dev/img/icons/splash.png",
                    "type": "image",
                    "assetId": "domain_38852"
                }, {
                    "id": "popupTint",
                    "src": "https://ekstep-public.s3.amazonaws.com/preview/dev/img/icons/splash.png",
                    "type": "image",
                    "assetId": "domain_38606"
                }, {
                    "id": "goodjobBg",
                    "src": "https://sandbox-community.ekstep.in/assets/public/content/goodjobBg_1460727428389.png",
                    "type": "image",
                    "assetId": "domain_38939"
                }, {
                    "id": "retryBg",
                    "src": "https://sandbox-community.ekstep.in/assets/public/content/retryBg_1460727370746.png",
                    "type": "image",
                    "assetId": "domain_38938"
                }, {
                    "id": "retry_audio",
                    "src": "https://sandbox-community.ekstep.in/assets/public/content/retry_1460636610607.mp3",
                    "type": "sound",
                    "assetId": "domain_38624"
                }, {
                    "id": "goodjob_audio",
                    "src": "https://sandbox-community.ekstep.in/assets/public/content/goodJob_1460636677521.mp3",
                    "type": "sound",
                    "assetId": "domain_38625"
                }, {
                    "id": "next",
                    "src": "https://sandbox-community.ekstep.in/assets/public/content/btn_back_1461401700215.png",
                    "type": "image",
                    "assetId": "domain_40358"
                }, {
                    "id": "previous",
                    "src": "https://sandbox-community.ekstep.in/assets/public/content/btn_back_1461401700215.png",
                    "type": "image",
                    "assetId": "domain_40359"
                }, {
                    "id": "submit",
                    "src": "https://sandbox-community.ekstep.in/assets/public/content/icon_submit_1459243202199.png",
                    "type": "image",
                    "assetId": "domain_14524"
                }, {
                    "id": "home",
                    "src": "https://sandbox-community.ekstep.in/assets/public/content/icon_home_1459242981364.png",
                    "type": "image",
                    "assetId": "domain_14519"
                }, {
                    "id": "reload",
                    "src": "https://sandbox-community.ekstep.in/assets/public/content/icon_reload_1459243110661.png",
                    "type": "image",
                    "assetId": "domain_14522"
                }, {
                    "id": "icon_hint",
                    "src": "https://sandbox-community.ekstep.in/assets/public/content/icon_hint_1454918891133.png",
                    "type": "image",
                    "assetId": "domain_799"
                }, {
                    "id": "bg",
                    "src": "https://sandbox-community.ekstep.in/assets/public/content/background_1458729298020.png",
                    "type": "image"
                }, {
                    "id": "domain_665",
                    "type": "image",
                    "src": "https://sandbox-community.ekstep.in/assets/public/content/ekstep-placeholder-blue-eye1_1454412631459.png",
                    "assetId": "domain_665"
                }]
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
                "image": [{
                    "x": 34.44444444444444,
                    "y": 34.66666666666667,
                    "w": 23.88888888888889,
                    "h": 38,
                    "visible": true,
                    "editable": true,
                    "asset": "validate",
                    "z-index": 1
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
                            "asset": "theme",
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
  /*startRenderer(data);*/
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
            "image": [{
                "event": {
                    "action": {
                        "type": "command",
                        "command": "show",
                        "asset": "validate"
                    },
                    "type": "click"
                },
                "asset": "validate",
                "x": -100,
                "y": -150,
                "w": 550,
                "h": 600,
                "visible": true,
                "id": "popup-Tint"
            }, {
                "asset": "validate",
                "x": 0,
                "y": 0,
                "w": 150,
                "h": 150,
                "visible": true,
                "id": "right"
            }]
        };


        Renderer.theme = {
            _currentStage: ''
        };
        this.plugin = PluginManager.invoke('image', mydata, parent);
        spyOn(this.plugin, 'initPlugin').and.callThrough();
        spyOn(this.plugin, 'refresh').and.callThrough();
        spyOn(this.plugin, 'alignDims').and.callThrough();
        done();
    });
    it('initPlugin', function() {
        this.plugin.initPlugin(data);
        expect(this.plugin.initPlugin).toHaveBeenCalled();
        expect(this.plugin.initPlugin.calls.count()).toEqual(1);
    });
    it('Refresh', function() {
        this.plugin.refresh(data);
        expect(this.plugin.refresh).toHaveBeenCalled();
        expect(this.plugin.refresh.calls.count()).toEqual(1);

    });
    it('alignDims', function() {
        this.plugin.alignDims();
        expect(this.plugin.alignDims).toHaveBeenCalled();
        expect(this.plugin.alignDims.calls.count()).toEqual(1);
    });

    it('X  ,Y Width and Height properties', function() {
        expect(this.plugin.x).not.toBe(null);
        expect(this.plugin.y).not.toBe(null);
        expect(this.plugin.w).not.toBe(null);
        expect(this.plugin.h).not.toBe(null);

    });
    it('Image asset properties', function() {
        expect(this.plugin.asset).not.toBeNull();

    });
});