var themeData = {
       theme : {
        canvasId: "gameCanvas",
        startStage: "splash",
        manifest: {
            media: [
                { id: 'sringeri', src: 'http-image/sringeri.png', type: 'image' },
                { id: 'splash_audio', src: 'http-image/splash.ogg', type: 'audio' }
            ]
        },
        controller: [
            {
                "identifier": "haircut_story_1",
                "item_sets": [
                    {
                        "count": 4,
                        "id": "set_1"
                    }
                ],
                "items": {
                    "set_1": [
                        {
                            "feedback": "",
                            "hints": [
                                {
                                    "asset": "learning11_sound",
                                    "type": "audio"
                                },
                                {
                                    "asset": "Barber has Scissors to Cut hair.",
                                    "type": "text"
                                }
                            ],
                            "identifier": "hs1_set_1_1",
                            "max_score": 1,
                            "model": {
                                "title_audio": {
                                    "asset": "learning10_sound",
                                    "type": "audio"
                                }
                            },
                            "num_answers": 1,
                            "options": [
                                {
                                    "value": {
                                        "asset": "carpenter_img",
                                        "type": "image"
                                    }
                                },
                                {
                                    "answer": true,
                                    "value": {
                                        "asset": "barber_img",
                                        "type": "image"
                                    }
                                },
                                {
                                    "value": {
                                        "asset": "tailor_img",
                                        "type": "image"
                                    }
                                },
                                {
                                    "value": {
                                        "asset": "wife_img",
                                        "type": "image"
                                    }
                                }
                            ],
                            "partial_scoring": false,
                            "qlevel": "MEDIUM",
                            "template": "mcq_template_1",
                            "title": "Find the Barber.",
                            "type": "mcq"
                        }
                    ]
                },
                "max_score": 9,
                "shuffle": false,
                "subject": "LIT",
                "title": "Haircut Story Assessment",
                "total_items": 4
            }],
        stage: [
            { "id": "splash", 
            "audio": [{ asset: 'splash_audio' }], 
            "text": [{
                "x" : 0,
                "y" : 0,
                "w" : 100,
                "h" : 20,
                "fontsize": 12,
                "__text": "Testing text plugin"
            }],
            "image": [{ asset: 'sringeri' }], 
                "x" : 0,
                "y" : 0,
                "w" : 100,
                "h" : 100,
                "param" : [{
                        "name" : "instructions",
                        "value" : ""
                    }, {
                        "name" : "next",
                        "value" : "splash1"
                    }
                ],
                "image" : [{
                    "x" : 10,
                    "y" : 20,
                    "w" : 70,
                    "h" : 80,
                    "visible" : true,
                    "editable" : true,
                    "asset" : "sringeri",
                    "z-index" : 4,
                }],
                "event": [{
                    "type": "enter", 
                    "action": {
                        "type": "command",
                       "asset": "sringeri",
                       "command": "toggleShow",
                   }
               }]
            },
            { id: "splash1", audio: [{ asset: 'splash_audio' }], img: [{ asset: 'sringeri' }] },
            { id: "splash2", audio: [{ asset: 'splash_audio' }], img: [{ asset: 'sringeri' }] }
        ]
       }
    }

function newPlugin() {
    ShapePluginExt = ShapePlugin.extend({});
    PluginManager.registerPlugin('shapeext', ShapePluginExt);
    return ShapePluginExt;
}

function invokePlugin(data) {
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
        "event": [{
            "action": {
                "type": "command",
                "command": "show",
                "asset": "testShape"
            },
            "type": "click"
        }, {
            "action": {
                "type": "command",
                "command": "toggleShow",
                "asset": "testShape"
            },
            "type": "toggle"
        }],
        "type": "rect",
        "x": 87,
        "y": 82,
        "w": 13,
        "h": 18,
        "hitArea": true,
        "id": "testShape"
    };
    return PluginManager.invoke('shape', data, parent);
}

function createAndInvokePlugin(data) {
    newPlugin();
    return invokePlugin(data);
}

function startRenderer(data) {
    var fixture = setFixtures('<div id="gameArea"><canvas id="gameCanvas" width="1366" height="768"></canvas></div>');
    Renderer.start("", "gameCanvas", {}, data);
}

function startRendererWithDefaultData(){
    startRenderer(themeData);
}

describe("Load content", function(){
    beforeEach(function(done) {
        //startRendererWithDefaultData();
    });
})