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

describe('Command manager test cases', function() {

    beforeEach(function(done) {
        spyOn(CommandManager, 'handle').and.callThrough();
        setTimeout(function() {
            done();
        }, 500);
    });

    describe("using shape", function() {
        beforeEach(function() {
            Renderer.theme = {
                _currentStage: '',
                _currentScene: {
                    _stageInstanceId: ''
                }
            };
            data = {
                    "x": 20,
                    "y": 20,
                    "w": 60,
                    "h": 60,
                    "visible": false,
                    "editable": true,
                    "type": "roundrect",
                    "radius": 10,
                    "opacity": 1,
                    "fill": "#45b3a5",
                    "stroke-width": 1,
                    "z-index": 0,
                    "id": "testShape"
            };
            this.plugin = PluginManager.invoke('shape', data, parent);
        });

        it('test command hide', function() {
            // var data = {"theme": {"canvasId": "gameCanvas"}};
            var action = {"command": "hide", "type": "command", "asset": "testShape", "pluginId": "testShape"};
            //var plugin = PluginManager.getPluginObject("testShape");
            CommandManager.handle(action);
            expect(this.plugin._self.visible).toEqual(false);
        });

        it('test command show', function() {
            var action = {"command": "show", "type": "command", "asset": "testShape", "pluginId": "testShape"};
            CommandManager.handle(action);
            // var plugin = PluginManager.getPluginObject("testShape");
            expect(this.plugin._self.visible).toEqual(true);
        });

        it('test command toggleshow', function() {
            var action = {"command": "toggleShow", "type": "command", "asset": "testShape", "pluginId": "testShape"};
            var plugin = PluginManager.getPluginObject("testShape");
            CommandManager.handle(action);
            expect(this.plugin._self.visible).toEqual(true);

            CommandManager.handle(action);
            expect(this.plugin._self.visible).toEqual(false);
        });

        it('test command toggleshadow', function() {
            var plugin = PluginManager.getPluginObject("testShape");
            var action = {"command": "toggleShadow", "type": "command", "asset": "testShape", "pluginId": "testShape"};
            CommandManager.handle(action);
            expect(this.plugin._self.shadow).not.toEqual(null);

            CommandManager.handle(action);
            expect(this.plugin._self.shadow).toEqual(undefined);
        });

        it('test command with delay', function() {
            expect(this.plugin._self.visible).toEqual(false);
            var action = {"command": "show", "type": "command", "asset": "testShape", "pluginId": "testShape", "delay": "3000"};
            CommandManager.handle(action);
            expect(this.plugin._self.visible).toEqual(false);
            setTimeout(function() {
                expect(this.plugin._self.visible).toEqual(true);
            }, 4000);
        });

    });

    describe("using audio manager", function() {
        beforeEach(function() {
            var data = {"event":[{"action":{"type":"command","command":"play"},"type":"click"}],"id":"audio1", "asset": "goodjob_audio"};
            var stagePlugin = PluginManager.getPluginObject(Renderer.theme._currentStage);
            PluginManager.invoke('audio', data, stagePlugin, stagePlugin, Renderer.theme);
        }, 500);

        it('test command play', function() {
            spyOn(AudioManager, 'play').and.callFake(function() {
                var action = CommandManager.handle.calls.argsFor(0)[0];
                expect('play').toEqual(action.command);
                expect('goodjob_audio').toEqual(action.asset);
            });
            var action = {"type": "command", "command": "play", "asset": "goodjob_audio", "pluginId": "audio1"};
            CommandManager.handle(action);
        });

        it('test command pause', function() {
            spyOn(AudioManager, 'pause').and.callFake(function() {
                var action = CommandManager.handle.calls.argsFor(0)[0];
                expect('pause').toEqual(action.command);
                expect('goodjob_audio').toEqual(action.asset);
            });
            var action = {"type": "command", "command": "pause", "asset": "goodjob_audio", "pluginId": "audio1"};
            CommandManager.handle(action);
        });

        it('test command stop', function() {
            spyOn(AudioManager, 'stop').and.callFake(function() {
                var action = CommandManager.handle.calls.argsFor(0)[0];
                expect('stop').toEqual(action.command);
                expect('goodjob_audio').toEqual(action.asset);
            });
            var action = {"type": "command", "command": "stop", "asset": "goodjob_audio", "pluginId": "audio1"};
            CommandManager.handle(action);
        });

        it('test command toggleplay', function() {
            spyOn(AudioManager, 'togglePlay').and.callFake(function() {
                var action = CommandManager.handle.calls.argsFor(0)[0];
                expect('toggleplay').toEqual(action.command);
                expect('goodjob_audio').toEqual(action.asset);
            });
            var action = {"type": "command", "command": "toggleplay", "asset": "goodjob_audio", "pluginId": "audio1"};
            CommandManager.handle(action);
        });
    });

    describe("using recorder manager", function() {
        beforeEach(function() {
            var data = {};
        }, 500);

        xit('test command startrecord', function() {
            spyOn(RecorderManager, 'startRecording').and.callFake(function() {
                var action = CommandManager.handle.calls.argsFor(0)[0];
                expect(action).toBeDefined();
                // expect('startrecord').toEqual(action.command);
                // expect('scene1').toEqual(action.asset);
                // expect('90000').toEqual(action.timeout);
            });
            var action = {"type": "command", "command": "startrecord", "asset": "scene1", "pluginId": "scene1", "failure": "rec_start_fail", "success": "rec_started", "timeout": "90000"};
            CommandManager.handle(action);
        });

        xit('test command stoprecord', function() {
            spyOn(RecorderManager, 'stopRecording').and.callFake(function() {
                var action = CommandManager.handle.calls.argsFor(0)[0];
                expect(action).toBeDefined();
                expect('stoprecord').toEqual(action.command);
                expect('scene1').toEqual(action.asset);
                done();
            });
            var action = {"type": "command", "command": "stoprecord", "asset": "scene1", "pluginId": "scene1", "failure": "rec_stop_failed", "success": "rec_stopped"};
            CommandManager.handle(action);
        });

        xit('test command processrecord', function() {
            spyOn(RecorderManager, 'processRecording').and.callFake(function() {
                var action = CommandManager.handle.calls.argsFor(0)[0];
                expect(action).toBeDefined();
                expect('processrecord').toEqual(action.command);
                expect('scene1').toEqual(action.asset);
                expect('1').toEqual(action["data-lineindex"]);
                done();
            });
            var action = {"type": "command", "command": "processrecord", "asset": "scene1", "pluginId": "scene1", "data-lineindex": "1", "failure": "rec_process_fail", "success": "rec_processed"};
            CommandManager.handle(action);
        });
    });

    describe("using stage", function() {

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
            var data = {
                id: "splash1",
                x: 10,
                y: 10,
                w: 90,
                h: 90,
                audio: { asset: 'splash_audio' },
                param:[{
                    name: "next",
                    value: "Scene2"
                }],
                shape: {
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
                },
                iterate:"assessment",
                var: "item"

            }
            // this.plugin = PluginManager.invoke('stage', data, parent);
        }, 500);

        xit('test test command reload', function() {
            // var stagePlugin = PluginManager.getPluginObject("scene1");
            // spyOn(stagePlugin, 'reload').and.callFake(function() {
                // var action = CommandManager.handle.calls.argsFor(0)[0];
                // expect(action).toBeDefined();
                // expect('reload').toEqual(action.command);
                // expect('scene1').toEqual(action.asset);
            // });
            var action = {"command": "reload", "type": "command", "asset": "scene1", "pluginId": "scene1"};
            CommandManager.handle(action);
            // expect(10).toBeDefined();
        });

        xit('test command reload', function() {
            // var stagePlugin = PluginManager.getPluginObject("scene1");
            // expect(stagePlugin).toBeDefined();
            // spyOn(stagePlugin, 'reload').and.callFake(function() {
                // var action = CommandManager.handle.calls.argsFor(0)[0];
                // expect(action).toBeDefined();
                // expect('reload').toEqual(action.command);
                // expect('scene1').toEqual(action.asset);
            // });
            // var action = {"command": "reload", "type": "command", "asset": "scene1", "pluginId": "scene1"};
            // CommandManager.handle(action);
        });

        xit('test command transitionto', function() {
            var themePlugin = PluginManager.getPluginObject("theme");
            expect(themePlugin).toBeDefined();
            spyOn(themePlugin, 'transitionTo').and.callFake(function() {
                var action = CommandManager.handle.calls.argsFor(0)[0];
                expect(action).toBeDefined();
                expect('transitionTo').toEqual(action.command);
                expect('theme').toEqual(action.asset);
                expect('next').toEqual(action.param);
                expect('scroll').toEqual(action.effect);
                expect('left').toEqual(action.direction);
                done();
            });
            var action = {"type": "command", "command": "transitionTo", "asset": "theme", "pluginId": "theme", "param": "next", "effect": "scroll", "direction": "left", "ease": "linear", "duration": "500"};
            CommandManager.handle(action);
        });

        xit('test command restart', function() {
            var themePlugin = PluginManager.getPluginObject("theme");
            expect(themePlugin).toBeDefined();
            spyOn(themePlugin, 'restart').and.callFake(function() {
                var action = CommandManager.handle.calls.argsFor(0)[0];
                expect(action).toBeDefined();
                expect('restart').toEqual(action.command);
                expect('theme').toEqual(action.asset);
                done();
            });
            var action = {"type": "command", "command": "restart", "asset": "theme", "pluginId": "theme"};
            CommandManager.handle(action);
        });

        xit('test command eval', function() {
            var stagePlugin = PluginManager.getPluginObject("scene1");
            expect(stagePlugin).toBeDefined();
            spyOn(stagePlugin, 'evaluate').and.callFake(function() {
                var action = CommandManager.handle.calls.argsFor(0)[0];
                expect(action).toBeDefined();
                expect('eval').toEqual(action.command);
                expect('scene1').toEqual(action.asset);
                done();
            });
            var action = {"command": "eval", "type": "command", "asset": "scene1", "pluginId": "scene1", "htmlEval": "true"};
            CommandManager.handle(action);
        });
    });
});
