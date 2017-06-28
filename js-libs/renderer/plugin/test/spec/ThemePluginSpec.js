describe('Theme Plugin test cases', function() {

    beforeEach(function(done) {
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
        // Renderer.theme = { _currentStage: '' };
        startRenderer(themeData);
        this.plugin = Renderer.theme;

        spyOn(this.plugin, 'initPlugin').and.callThrough();
        spyOn(this.plugin, 'start').and.callThrough();
        spyOn(this.plugin, 'updateCanvas').and.callThrough();
        spyOn(this.plugin, 'render').and.callThrough();

        spyOn(this.plugin, 'addController').and.callThrough();
        spyOn(this.plugin, 'initStageControllers').and.callThrough();
        spyOn(this.plugin, 'reRender').and.callThrough();

        spyOn(this.plugin, 'update').and.callThrough();
        spyOn(this.plugin, 'tick').and.callThrough();
        spyOn(this.plugin, 'restart').and.callThrough();

        // spyOn(this.plugin, 'addChild').and.callThrough();

        spyOn(this.plugin, 'invokeStage').and.callThrough();
        spyOn(this.plugin, 'replaceStage').and.callThrough();

        spyOn(this.plugin, 'preloadStages').and.callThrough();
        //spyOn(this.plugin, 'mergeStages').and.callThrough();
        //spyOn(this.plugin, 'isStageChanging').and.callThrough();
        spyOn(this.plugin, 'transitionTo').and.callThrough();

        spyOn(this.plugin, 'removeHtmlElements').and.callThrough();
        spyOn(this.plugin, 'disableInputs').and.callThrough();
        spyOn(this.plugin, 'enableInputs').and.callThrough();

        //spyOn(this.plugin, 'getTransitionEffect').and.callThrough();

        spyOn(this.plugin, 'getDirection').and.callThrough();
        spyOn(this.plugin, 'getEase').and.callThrough();
        //spyOn(this.plugin, 'getAsset').and.callThrough();
        spyOn(this.plugin, 'mousePoint').and.callThrough();

        spyOn(this.plugin, 'getStagesToPreLoad').and.callThrough();
        //spyOn(this.plugin, 'cleanUp').and.callThrough();
        //spyOn(this.plugin, 'pause').and.callThrough();
        //spyOn(this.plugin, 'resume').and.callThrough();
        //spyOn(this.plugin, 'setParam').and.callThrough();
        //spyOn(this.plugin, 'getParam').and.callThrough();


        done();
    });
    
    afterEach(function() {
      jasmine.clock().uninstall();
    });

    it('Theme plugin initPlugin() fields validation', function() {
        this.plugin.initPlugin({canvasId : "gameCanvas"});
        expect(this.plugin.initPlugin).toHaveBeenCalled();
        expect(this.plugin.initPlugin.calls.count()).toEqual(1);

        // expect(true).toEqual(this.plugin._self instanceof createjs.Stage);
        // expect(true).toEqual(this.plugin._self.mouseMoveOutside);

    });

    it('Theme plugin updateCanvas()', function() {
        this.plugin.updateCanvas(200, 200);
        expect(this.plugin.updateCanvas).toHaveBeenCalled();
        expect(this.plugin.updateCanvas.calls.count()).toEqual(1);
    });

    it('Theme plugin start()', function() {
        this.plugin.start({ primary: true });
        expect(this.plugin.start).toHaveBeenCalled();
        expect(this.plugin.start.calls.count()).toEqual(1);
    });

    it('Theme plugin render()', function() {
        this.plugin.render();
        expect(this.plugin.render).toHaveBeenCalled();
        expect(this.plugin.render.calls.count()).toEqual(1);
    });

    it('Theme plugin addController()', function() {
        this.plugin.addController({name: "Test", type:"item", id:"Test"});
        expect(this.plugin.addController).toHaveBeenCalled();
        expect(this.plugin.addController.calls.count()).toEqual(1);
    });

    it('Theme plugin initStageControllers()', function() {
        this.plugin.initStageControllers("");
        expect(this.plugin.initStageControllers).toHaveBeenCalled();
        expect(this.plugin.initStageControllers.calls.count()).toEqual(1);
    });

    it('Theme plugin reRender()', function() {
        this.plugin.reRender();
        expect(this.plugin.reRender).toHaveBeenCalled();
        expect(this.plugin.reRender.calls.count()).toEqual(1);
    });

    it('Theme plugin update()', function() {
        this.plugin.update();
        expect(this.plugin.update).toHaveBeenCalled();
        expect(this.plugin.update.calls.count()).toEqual(1);
    });

    it('Theme plugin tick()', function() {
        this.plugin.tick();
        expect(this.plugin.tick).toHaveBeenCalled();
        expect(this.plugin.tick.calls.count()).toEqual(1);
    });

    it('Theme plugin restart()', function() {
        this.plugin.restart();
        expect(this.plugin.restart).toHaveBeenCalled();
        expect(this.plugin.restart.calls.count()).toEqual(1);
    });

    it('Theme plugin restart()', function() {
        this.plugin.restart();
        expect(this.plugin.restart).toHaveBeenCalled();
        expect(this.plugin.restart.calls.count()).toEqual(1);
    });

    it('Theme plugin addChild()', function() {
        var stageInstance = PluginManager.invoke('stage', this.plugin._data.stage[0], this.plugin, null, this.plugin);
        this.plugin.addChild(stageInstance._self,  stageInstance);
        expect(stageInstance).not.toBe(undefined);
        expect(this.plugin._currentScene).not.toBe(undefined);
    });

    it('Theme plugin replaceStage()', function() {
        this.plugin.replaceStage("splash");
        expect(this.plugin.replaceStage).toHaveBeenCalled();
        expect(this.plugin.replaceStage.calls.count()).toEqual(1);
    });

    it('Theme plugin preloadStages()', function() {
        var stageInstance = PluginManager.invoke('stage', this.plugin._data.stage[0], this.plugin, null, this.plugin);
        this._currentScene = PluginManager.invoke('stage', stageInstance, this, null, this);
        this.plugin.preloadStages();
        // expect(this.plugin.preloadStages).toHaveBeenCalled();
        expect(AssetManager.strategy.loaders[this.plugin._data.stage[1].id]).not.toBe(undefined);
        // expect(this.plugin.preloadStages.calls.count()).toEqual(1);
    });

    it('Theme plugin removeHtmlElements()', function() {
        this.plugin.removeHtmlElements("splash");
        expect(this.plugin.removeHtmlElements).toHaveBeenCalled();
        expect(this.plugin.removeHtmlElements.calls.count()).toEqual(1);
    });

    it('Theme plugin removeHtmlElements()', function() {
        this.plugin.removeHtmlElements();
        expect(this.plugin.removeHtmlElements).toHaveBeenCalled();
        expect(this.plugin.removeHtmlElements.calls.count()).toEqual(1);
    });

    it('Theme plugin disableInputs()', function() {
        this.plugin.disableInputs();
        expect(this.plugin.disableInputs).toHaveBeenCalled();
        expect(this.plugin.disableInputs.calls.count()).toEqual(1);
    });

    it('Theme plugin enableInputs()', function() {
        this.plugin.enableInputs();
        expect(this.plugin.enableInputs).toHaveBeenCalled();
        expect(this.plugin.enableInputs.calls.count()).toEqual(1);
    });

    it('Theme plugin getDirection()', function() {
        this.plugin.getDirection();
        expect(this.plugin.getDirection).toHaveBeenCalled();
        expect(this.plugin.getDirection.calls.count()).toEqual(1);
    });

    it('Theme plugin getEase()', function() {
        this.plugin.getEase();
        expect(this.plugin.getEase).toHaveBeenCalled();
        expect(this.plugin.getEase.calls.count()).toEqual(1);
    });

    it('Theme plugin getAsset()', function() {
        callback = jasmine.createSpy("callback");
        jasmine.clock().install();
        var instance = this;
        setTimeout(function() {
            callback();
            //console.log("Pausing 2 seconds...");
            var mediaAsset = instance.plugin.getAsset("sringeri");            
            expect(mediaAsset).toBeDefined();
        }, 2000);


        expect(callback).not.toHaveBeenCalled();

        jasmine.clock().tick(2000);

        expect(callback).toHaveBeenCalled();

        // CommandManager.handle({"type": "command", "asset": "sringeri", "command": "toggleShow", "stageInstanceId": Renderer.theme._currentScene._stageInstanceId,
        //     "stageId": Renderer.theme._currentStage});

        //Reference: https://makandracards.com/makandra/32477-testing-settimeout-and-setinterval-with-jasmine
        // Example : For setTimeout/callback
        /*callback = jasmine.createSpy("callback");
        jasmine.clock().install();

        setTimeout(function() {
            callback();
        }, 100);

        expect(callback).not.toHaveBeenCalled();

        jasmine.clock().tick(100);

        expect(callback).toHaveBeenCalled();*/
    });

    xit('Theme plugin mousePoint()', function() {
        this.plugin.mousePoint();
        expect(this.plugin.mousePoint).toHaveBeenCalled();
        expect(this.plugin.mousePoint.calls.count()).toEqual(1);
    });

    it('Theme plugin getStagesToPreLoad()', function() {
        this.plugin.getStagesToPreLoad({next : "splash", previous: "splash"});
        expect(this.plugin.getStagesToPreLoad).toHaveBeenCalled();
        expect(this.plugin.getStagesToPreLoad.calls.count()).toEqual(1);
    });

});
