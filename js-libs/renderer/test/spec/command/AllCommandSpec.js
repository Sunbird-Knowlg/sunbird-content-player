describe('Animate Command test cases', function () {
   var animateCommand = AnimateCommand.prototype;
   beforeEach(function() {
      spyOn(animateCommand, 'invoke').and.callThrough();
   })
   it('Animate command invoke function when correct action is available', function() {
      var action = { asset: "do_2122479583895552001118_tween"};
      animateCommand.invoke(action);
      expect(animateCommand.invoke).toHaveBeenCalled();
      expect(animateCommand.invoke.calls.count()).toEqual(1);
      expect(CommandManager.commandMap[animateCommand._name]).toBeDefined();
   })
   it('Animate command invoke function when no action is available', function () {
      animateCommand.invoke();
      expect(animateCommand.invoke).toHaveBeenCalled();
      expect(animateCommand.invoke.calls.count()).toEqual(1);
   })
})

describe('Custom Command js test cases', function () {
   var action;
   beforeEach(function () {
      this.plugin = CustomCommand.prototype;
      spyOn(this.plugin, 'invoke').and.callThrough();
   })

   it('Custom Command invoke function when plugin is available', function () {
      action = { "type": "command", "command": "togglePlay", "asset": "audio", "disableTelemetry": false, "stageInstanceId": "scene1__nr473iu8n1", "invoke": "reload" };
      spyOn(this.plugin, 'getPluginObject').and.callThrough();
      this.plugin._action = action;
      this.plugin.invoke(action);
      expect(this.plugin.getPluginObject).toHaveBeenCalled();
      expect(this.plugin.invoke).toHaveBeenCalled();
      expect(this.plugin.invoke.calls.count()).toEqual(1);
      expect(CommandManager.commandMap[this.plugin._name]).toBeDefined();
   })

   it('Custom Command invoke function when plugin is not available', function () {
      action = { "type": "command", "command": "togglePlay", "asset": "audio1", "disableTelemetry": false, "stageInstanceId": "scene1__nr473iu8n1", "invoke": "reload" };
      spyOn(this.plugin, 'getPluginObject').and.callThrough();
      this.plugin._action = action;
      this.plugin.invoke();
      expect(this.plugin.getPluginObject).toHaveBeenCalled();
      expect(this.plugin.invoke).toHaveBeenCalled();
      expect(this.plugin.invoke.calls.count()).toEqual(1);
   })
});

describe('Default Next Command js test cases', function () {
   var action;
   beforeEach(function () {
      this.plugin = DefaultNextCommand.prototype;
      this.fn = function () { };
      spyOn(this.plugin, 'invoke').and.callThrough();
   })

   it('Default Next Command invoke function', function () {
      action = { "type": "command", "command": "togglePlay", "asset": "audio", "disableTelemetry": false, "stageInstanceId": "scene1__nr473iu8n1", "invoke": "reload" };
      spyOn(this, 'fn').and.callThrough();
      EkstepRendererAPI.addEventListener('actionNavigateNext', this.fn, this);
      this.plugin.invoke(action);
      expect(this.plugin.invoke).toHaveBeenCalled();
      expect(this.plugin.invoke.calls.count()).toEqual(1);
      expect(this.fn).toHaveBeenCalled();
      expect(CommandManager.commandMap[this.plugin._name]).toBeDefined();
   })
});

describe('Erase Command js test cases', function () {
   var action;
   beforeEach(function () {
      this.plugin = EraseCommand.prototype;
      spyOn(this.plugin, 'initCommand').and.callThrough();
   })

   it('Erase Command initCommand function', function () {
      action = { "type": "command", "command": "togglePlay", "asset": "audio", "disableTelemetry": false, "stageInstanceId": "scene1__nr473iu8n1", "invoke": "reload" };
      this.plugin.initCommand(action);
      expect(this.plugin.initCommand).toHaveBeenCalled();
      expect(this.plugin.initCommand.calls.count()).toEqual(1);
      expect(CommandManager.commandMap[this.plugin._name]).toBeDefined();
   })
});

describe('Eval Command js test cases', function () {
   var action;
   beforeEach(function () {
      this.plugin = EvalCommand.prototype;
      spyOn(this.plugin, 'invoke').and.callThrough();
   })

   it('Eval Command invoke function', function () {
      action = { "type": "command", "command": "eval", "asset": "stage1", "pluginId": "stage1", "success": "correct_answer", "failure": "wrong_answer", "dataAttributes": {}, "stageId": "stage1" };
      spyOn(this.plugin,'getPluginObject').and.callThrough();
      this.plugin._action = action;
      this.plugin.invoke(action);
      expect(this.plugin.invoke).toHaveBeenCalled();
      expect(this.plugin.getPluginObject).toHaveBeenCalled();
      expect(this.plugin.invoke.calls.count()).toEqual(1);
      expect(CommandManager.commandMap[this.plugin._name]).toBeDefined();
   })
});

describe('Event Command js test cases', function () {
   var action;
   beforeEach(function () {
      this.plugin = EventCommand.prototype;
      spyOn(this.plugin, 'invoke').and.callThrough();
   })

   it('Event Command invoke function', function () {
      action = { "type": "command", "command": "eval", "asset": "stage1", "pluginId": "stage1", "success": "correct_answer", "failure": "wrong_answer", "dataAttributes": {}, "stageId": "stage1", "value": {"target": "1"} };
      spyOn(EventManager, 'dispatchEvent').and.callThrough();
      this.plugin._action = action;
      this.plugin.invoke(action);
      expect(this.plugin.invoke).toHaveBeenCalled();
      expect(EventManager.dispatchEvent).toHaveBeenCalled();
      expect(this.plugin.invoke.calls.count()).toEqual(1);
      expect(CommandManager.commandMap[this.plugin._name]).toBeDefined();
   })

   it('Event Command initCommand function', function() {
      spyOn(this.plugin, 'initCommand').and.callThrough();
      this.plugin.initCommand(action);
      expect(this.plugin.initCommand).toHaveBeenCalled();
      expect(this.plugin.initCommand.calls.count()).toEqual(1);
   })
});

describe('External Command js test cases', function () {
   var action;
   beforeEach(function () {
      this.plugin = ExternalCommand.prototype;
      spyOn(this.plugin, 'invoke').and.callThrough();
   })

   it('External Command invoke function when href is available', function () {
      action = { "type": "command", "command": "eval", "asset": "stage1", "pluginId": "stage1", "success": "correct_answer", "failure": "wrong_answer", "dataAttributes": {}, "stageId": "stage1", "value": { "target": "1" }, "href": "about:blank" };
      spyOn(window, 'open').and.callThrough();
      this.plugin.invoke(action);
      expect(this.plugin.invoke).toHaveBeenCalled();
      expect(window.open).toHaveBeenCalled();
      expect(this.plugin.invoke.calls.count()).toEqual(1);
      expect(CommandManager.commandMap[this.plugin._name]).toBeDefined();
   })

   it('External Command invoke function when href is not available', function () {
      action = { "type": "command", "command": "eval", "asset": "stage1", "pluginId": "stage1", "success": "correct_answer", "failure": "wrong_answer", "dataAttributes": {}, "stageId": "stage1", "value": { "target": "1" }};
      spyOn(window, 'startApp').and.callThrough();
      this.plugin.invoke(action);
      expect(this.plugin.invoke).toHaveBeenCalled();
      expect(window.startApp).toHaveBeenCalled();
      expect(this.plugin.invoke.calls.count()).toEqual(1);
   })
});

describe('Hide Command js test cases', function () {
   var action;
   beforeEach(function () {
      this.plugin = HideCommand.prototype;
      spyOn(this.plugin, 'initCommand').and.callThrough();
   })

   it('Hide Command initCommand function', function () {
      action = { "type": "command", "command": "eval", "asset": "stage1", "pluginId": "stage1", "success": "correct_answer", "failure": "wrong_answer", "dataAttributes": {}, "stageId": "stage1", "value": { "target": "1" }, "href": "about:blank" };
      this.plugin.initCommand(action);
      expect(this.plugin.initCommand).toHaveBeenCalled();
      expect(this.plugin.initCommand.calls.count()).toEqual(1);
      expect(CommandManager.commandMap[this.plugin._name]).toBeDefined();
   })
});

describe('Hide Html Command js test cases', function () {
   var action;
   beforeEach(function () {
      this.plugin = HideHTMLElementsCommand.prototype;
      spyOn(this.plugin, 'invoke').and.callThrough();
      spyOn(CommandManager, 'displayAllHtmlElements').and.callThrough();
   })

   it('Hide HTML Command invoke function', function () {
      action = { "type": "command", "command": "eval", "asset": "stage1", "pluginId": "stage1", "success": "correct_answer", "failure": "wrong_answer", "dataAttributes": {}, "stageId": "stage1", "value": { "target": "1" }, "href": "about:blank" };
      this.plugin._action = action;
      this.plugin.invoke(action);
      expect(this.plugin.invoke).toHaveBeenCalled();
      expect(CommandManager.displayAllHtmlElements).toHaveBeenCalled();
      expect(this.plugin.invoke.calls.count()).toEqual(1);
      expect(CommandManager.commandMap[this.plugin._name]).toBeDefined();
   })
});

describe('Pause Command js test cases', function () {
   var action;
   beforeEach(function () {
      this.plugin = PauseCommand.prototype;
      spyOn(this.plugin, 'invoke').and.callThrough();
      spyOn(this.plugin, 'getPluginObject').and.callThrough();
   })

   it('Pause Command invoke function when plugin is available', function () {
      action = { "type": "command", "command": "eval", "asset": "stage1", "pluginId": "stage1", "success": "correct_answer", "failure": "wrong_answer", "dataAttributes": {}, "stageId": "stage1", "value": { "target": "1" } };
      this.plugin._action = action;
      this.plugin.invoke(action);
      expect(this.plugin.invoke).toHaveBeenCalled();
      expect(this.plugin.invoke.calls.count()).toEqual(1);
      expect(CommandManager.commandMap[this.plugin._name]).toBeDefined();
   })

   it('Pause Command invoke function when plugin is not available', function () {
      action = { "type": "command", "command": "eval", "asset": "test", "pluginId": "stage1", "success": "correct_answer", "failure": "wrong_answer", "dataAttributes": {}, "stageId": "stage1", "value": { "target": "1" } };
      this.plugin._action = action;
      this.plugin.invoke(action);
      expect(this.plugin.invoke).toHaveBeenCalled();
      expect(this.plugin.invoke.calls.count()).toEqual(1);
      expect(CommandManager.commandMap[this.plugin._name]).toBeDefined();
   })
});

describe('Play Command js test cases', function () {
   var action;
   beforeEach(function () {
      this.plugin = PlayCommand.prototype;
      spyOn(this.plugin, 'invoke').and.callThrough();
      spyOn(this.plugin, 'getPluginObject').and.callThrough();
   })

   it('Play Command invoke function when plugin is available', function () {
      action = { "type": "command", "command": "eval", "asset": "stage1", "pluginId": "stage1", "success": "correct_answer", "failure": "wrong_answer", "dataAttributes": {}, "stageId": "stage1", "value": { "target": "1" } };
      this.plugin._action = action;
      this.plugin.invoke(action);
      expect(this.plugin.invoke).toHaveBeenCalled();
      expect(this.plugin.invoke.calls.count()).toEqual(1);
      expect(CommandManager.commandMap[this.plugin._name]).toBeDefined();
   })

   it('Play Command invoke function when plugin is not available', function () {
      action = { "type": "command", "command": "eval", "asset": "test", "pluginId": "stage1", "success": "correct_answer", "failure": "wrong_answer", "dataAttributes": {}, "stageId": "stage1", "value": { "target": "1" } };
      this.plugin._action = action;
      this.plugin.invoke(action);
      expect(this.plugin.invoke).toHaveBeenCalled();
      expect(this.plugin.invoke.calls.count()).toEqual(1);
      expect(CommandManager.commandMap[this.plugin._name]).toBeDefined();
   })
});

describe('Process Record Command js test cases', function () {
   var action;
   beforeEach(function () {
      this.plugin = ProcessRecordCommand.prototype;
      spyOn(this.plugin, 'invoke').and.callThrough();
      spyOn(RecorderManager, 'processRecording').and.callThrough();
   })

   it('Process Record Command invoke function', function () {
      action = { "type": "command", "command": "eval", "asset": "stage1", "pluginId": "stage1", "success": "correct_answer", "failure": "wrong_answer", "dataAttributes": {}, "stageId": "stage1", "value": { "target": "1" } };
      this.plugin._action = action;
      this.plugin.invoke(action);
      expect(RecorderManager.processRecording).toHaveBeenCalled();
      expect(this.plugin.invoke).toHaveBeenCalled();
      expect(this.plugin.invoke.calls.count()).toEqual(1);
      expect(CommandManager.commandMap[this.plugin._name]).toBeDefined();
   })
});

describe('Refresh Command js test cases', function () {
   var action;
   beforeEach(function () {
      this.plugin = RefreshCommand.prototype;
      spyOn(this.plugin, 'initCommand').and.callThrough();
   })

   it('Refresh Command initCommand function', function () {
      action = { "type": "command", "command": "eval", "asset": "stage1", "pluginId": "stage1", "success": "correct_answer", "failure": "wrong_answer", "dataAttributes": {}, "stageId": "stage1", "value": { "target": "1" } };
      this.plugin._action = action;
      this.plugin.initCommand(action);
      expect(this.plugin.initCommand).toHaveBeenCalled();
      expect(this.plugin.initCommand.calls.count()).toEqual(1);
      expect(CommandManager.commandMap[this.plugin._name]).toBeDefined();
   })
});

describe('Reload Command js test cases', function () {
   var action;
   beforeEach(function () {
      this.plugin = ReloadCommand.prototype;
      spyOn(this.plugin, 'initCommand').and.callThrough();
   })

   it('Reload Command initCommand function', function () {
      action = { "type": "command", "command": "eval", "asset": "stage1", "pluginId": "stage1", "success": "correct_answer", "failure": "wrong_answer", "dataAttributes": {}, "stageId": "stage1", "value": { "target": "1" } };
      this.plugin._action = action;
      this.plugin.initCommand(action);
      expect(this.plugin.initCommand).toHaveBeenCalled();
      expect(this.plugin.initCommand.calls.count()).toEqual(1);
      expect(CommandManager.commandMap[this.plugin._name]).toBeDefined();
   })
});

describe('Reset Command js test cases', function () {
   var action;
   beforeEach(function () {
      this.plugin = ResetCommand.prototype;
      spyOn(this.plugin, 'invoke').and.callThrough();
   })

   it('Reset Command invoke function when controller is not available', function () {
      action = { "type": "command", "command": "eval", "asset": "stage1", "pluginId": "stage1", "success": "correct_answer", "failure": "wrong_answer", "dataAttributes": {}, "stageId": "stage1", "value": { "target": "1" } };
      this.plugin._action = action;
      this.plugin.invoke(action);
      expect(this.plugin.invoke).toHaveBeenCalled();
      expect(this.plugin.invoke.calls.count()).toEqual(1);
      expect(CommandManager.commandMap[this.plugin._name]).toBeDefined();
   })

   it('Reset Command invoke function when controller is available', function () {
      action = { "type": "command", "command": "eval", "asset": "stage1", "pluginId": "stage1", "success": "correct_answer", "failure": "wrong_answer", "dataAttributes": {}, "stageId": "stage1", "value": { "target": "1" }, "cType": "items", "controller": "assessment_mtf" };
      this.plugin._action = action;
      this.plugin.invoke(action);
      expect(this.plugin.invoke).toHaveBeenCalled();
      expect(this.plugin.invoke.calls.count()).toEqual(1);
      expect(CommandManager.commandMap[this.plugin._name]).toBeDefined();
   })
});

describe('Restart Command js test cases', function () {
   var action;
   beforeEach(function () {
      this.plugin = RestartCommand.prototype;
      spyOn(this.plugin, 'initCommand').and.callThrough();
   })

   it('Reset Command initCommand function', function () {
      action = { "type": "command", "command": "eval", "asset": "stage1", "pluginId": "stage1", "success": "correct_answer", "failure": "wrong_answer", "dataAttributes": {}, "stageId": "stage1", "value": { "target": "1" } };
      this.plugin._action = action;
      this.plugin.initCommand(action);
      expect(this.plugin.initCommand).toHaveBeenCalled();
      expect(this.plugin.initCommand.calls.count()).toEqual(1);
      expect(CommandManager.commandMap[this.plugin._name]).toBeDefined();
   })
});

describe('Set Command js test cases', function () {
   var action;
   beforeEach(function () {
      this.plugin = SetCommand.prototype;
      spyOn(this.plugin, 'invoke').and.callThrough();
   })

   it('Set Command initCommand function when set type plugin is available', function () {
      action = { "type": "command", "command": "eval", "asset": "stage1", "pluginId": "stage1", "success": "correct_answer", "failure": "wrong_answer", "dataAttributes": {}, "stageId": "stage1", "value": { "target": "1" }};
      org.ekstep.pluginframework.pluginManager.pluginInstances.stage1._type = "set";
      this.plugin._action = action;
      this.plugin.invoke(action);
      expect(this.plugin.invoke).toHaveBeenCalled();
      expect(this.plugin.invoke.calls.count()).toEqual(1);
      expect(CommandManager.commandMap[this.plugin._name]).toBeDefined();
   })

   it('Set Command initCommand function when set type plugin is not available', function () {
      action = { "type": "command", "command": "eval", "asset": "stage1", "pluginId": "stage1", "success": "correct_answer", "failure": "wrong_answer", "dataAttributes": {}, "stageId": "stage1", "value": { "target": "1" } };
      delete org.ekstep.pluginframework.pluginManager.pluginInstances.stage1._type;
      this.plugin._action = action;
      this.plugin.invoke(action);
      expect(this.plugin.invoke).toHaveBeenCalled();
      expect(this.plugin.invoke.calls.count()).toEqual(1);
      expect(CommandManager.commandMap[this.plugin._name]).toBeDefined();
   })

   it('Set Command initCommand function when plugin not found', function () {
      action = { "type": "command", "command": "eval", "asset": "stage", "pluginId": "stage1", "success": "correct_answer", "failure": "wrong_answer", "dataAttributes": {}, "stageId": "stage1", "value": { "target": "1" } };
      delete org.ekstep.pluginframework.pluginManager.pluginInstances.stage1._type;
      this.plugin._action = action;
      this.plugin.invoke(action);
      expect(this.plugin.invoke).toHaveBeenCalled();
      expect(this.plugin.invoke.calls.count()).toEqual(1);
      expect(CommandManager.commandMap[this.plugin._name]).toBeDefined();
   })
});

describe('Show Command js test cases', function () {
   var action;
   beforeEach(function () {
      this.plugin = ShowCommand.prototype;
      spyOn(this.plugin, 'initCommand').and.callThrough();
   })

   it('Set Command initCommand function', function () {
      action = { "type": "command", "command": "eval", "asset": "stage1", "pluginId": "stage1", "success": "correct_answer", "failure": "wrong_answer", "dataAttributes": {}, "stageId": "stage1", "value": { "target": "1" } };
      this.plugin._action = action;
      this.plugin.initCommand(action);
      expect(this.plugin.initCommand).toHaveBeenCalled();
      expect(this.plugin.initCommand.calls.count()).toEqual(1);
      expect(CommandManager.commandMap[this.plugin._name]).toBeDefined();
   })
});

describe('Show Html Elements Command js test cases', function () {
   var action;
   beforeEach(function () {
      this.plugin = ShowHTMLElementsCommand.prototype;
      spyOn(this.plugin, 'invoke').and.callThrough();
      spyOn(CommandManager, 'displayAllHtmlElements').and.callThrough();
   })

   it('Show Html Elements Command invoke function', function () {
      action = { "type": "command", "command": "eval", "asset": "stage1", "pluginId": "stage1", "success": "correct_answer", "failure": "wrong_answer", "dataAttributes": {}, "stageId": "stage1", "value": { "target": "1" } };
      this.plugin._action = action;
      this.plugin.invoke(action);
      expect(this.plugin.invoke).toHaveBeenCalled();
      expect(this.plugin.invoke.calls.count()).toEqual(1);
      expect(CommandManager.displayAllHtmlElements).toHaveBeenCalled();
      expect(CommandManager.commandMap[this.plugin._name]).toBeDefined();
   })
});

describe('Start Genie Command js test cases', function () {
   var action;
   beforeEach(function () {
      this.plugin = StartGenieCommand.prototype;
      spyOn(this.plugin, 'invoke').and.callThrough();
      spyOn(TelemetryService, 'end').and.callThrough();
      spyOn(window, 'exitApp').and.callThrough();
   })

   it('When _gameData id is not equal to packageName & packageNameDelhi ', function (done) {
      action = { "type": "command", "command": "eval", "asset": "stage1", "pluginId": "stage1", "success": "correct_answer", "failure": "wrong_answer", "dataAttributes": {}, "stageId": "stage1", "value": { "target": "1" } };
      this.plugin._action = action;
      TelemetryService._gameData.id = "org.ekstep.newcontentplayer";
      org.ekstep.service.renderer.endGenieCanvas = function() {};
      this.plugin.invoke(action);
      expect(this.plugin.invoke).toHaveBeenCalled();
      expect(this.plugin.invoke.calls.count()).toEqual(1);
      expect(TelemetryService.end).toHaveBeenCalled();
      expect(CommandManager.commandMap[this.plugin._name]).toBeDefined();
      setTimeout(function() {
         expect(window.exitApp).toHaveBeenCalled();
         done();
      }, 501);
   })

   it('When _gameData id is equal to either packageName or packageNameDelhi ', function () {
      action = { "type": "command", "command": "eval", "asset": "stage1", "pluginId": "stage1", "success": "correct_answer", "failure": "wrong_answer", "dataAttributes": {}, "stageId": "stage1", "value": { "target": "1" } };
      this.plugin._action = action;
      TelemetryService._gameData.id = "org.ekstep.contentplayer";
      org.ekstep.service.renderer.endGenieCanvas = function () { };
      this.plugin.invoke(action);
      expect(this.plugin.invoke).toHaveBeenCalled();
      expect(this.plugin.invoke.calls.count()).toEqual(1);
      expect(window.exitApp).toHaveBeenCalled();
   })
});

describe('Start Record Command js test cases', function () {
   var action;
   beforeEach(function () {
      this.plugin = StartRecordCommand.prototype;
      spyOn(this.plugin, 'invoke').and.callThrough();
      spyOn(RecorderManager, 'startRecording').and.callThrough();
   })

   it('invoke function call ', function () {
      action = { "type": "command", "command": "eval", "asset": "stage1", "pluginId": "stage1", "success": "correct_answer", "failure": "wrong_answer", "dataAttributes": {}, "stageId": "stage1", "value": { "target": "1" } };
      this.plugin._action = action;
      this.plugin.invoke(action);
      expect(this.plugin.invoke).toHaveBeenCalled();
      expect(this.plugin.invoke.calls.count()).toEqual(1);
      expect(RecorderManager.startRecording).toHaveBeenCalled();
      expect(CommandManager.commandMap[this.plugin._name]).toBeDefined();
   })
});

describe('Start Record Command js test cases', function () {
   var action;
   beforeEach(function () {
      this.plugin = StopCommand.prototype;
      spyOn(this.plugin, 'invoke').and.callThrough();
   })

   it('invoke function call when audio plugin is available', function () {
      action = { "type": "command", "command": "eval", "asset": "stage1", "pluginId": "stage1", "success": "correct_answer", "failure": "wrong_answer", "dataAttributes": {}, "stageId": "stage1", "value": { "target": "1" }, "sound": true };
      spyOn(AudioManager, 'stopAll').and.callThrough();
      this.plugin._action = action;
      this.plugin.invoke(action);
      expect(this.plugin.invoke).toHaveBeenCalled();
      expect(AudioManager.stopAll).toHaveBeenCalled();
      expect(this.plugin.invoke.calls.count()).toEqual(1);
      expect(CommandManager.commandMap[this.plugin._name]).toBeDefined();
   })

   it('invoke function call when audio plugin is not available', function () {
      action = { "type": "command", "command": "eval", "asset": "stage", "pluginId": "stage1", "success": "correct_answer", "failure": "wrong_answer", "dataAttributes": {}, "stageId": "stage1", "value": { "target": "1" } };
      spyOn(AudioManager, 'stop').and.callThrough();
      this.plugin._action = action;
      this.plugin.invoke(action);
      expect(this.plugin.invoke).toHaveBeenCalled();
      expect(AudioManager.stop).toHaveBeenCalled();
      expect(this.plugin.invoke.calls.count()).toEqual(1);
   })
});

describe('Stop Record Command js test cases', function () {
   var action;
   beforeEach(function () {
      this.plugin = StopRecordCommand.prototype;
      spyOn(this.plugin, 'invoke').and.callThrough();
      spyOn(RecorderManager, 'stopRecording').and.callThrough();
   })

   it('invoke function call', function () {
      action = { "type": "command", "command": "eval", "asset": "stage1", "pluginId": "stage1", "success": "correct_answer", "failure": "wrong_answer", "dataAttributes": {}, "stageId": "stage1", "value": { "target": "1" } };
      this.plugin._action = action;
      this.plugin.invoke(action);
      expect(this.plugin.invoke).toHaveBeenCalled();
      expect(RecorderManager.stopRecording).toHaveBeenCalled();
      expect(this.plugin.invoke.calls.count()).toEqual(1);
      expect(CommandManager.commandMap[this.plugin._name]).toBeDefined();
   })
});

describe('Toggle Play Command js test cases', function () {
   var action;
   beforeEach(function () {
      this.plugin = TogglePlayCommand.prototype;
      spyOn(this.plugin, 'invoke').and.callThrough();
   })
   
   it('invoke function call when plugin is available', function () {
      action = { "type": "command", "command": "eval", "asset": "stage1", "pluginId": "stage1", "success": "correct_answer", "failure": "wrong_answer", "dataAttributes": {}, "stageId": "stage1", "value": { "target": "1" } };
      this.plugin._action = action;
      var plugin = this.plugin.getPluginObject();
      spyOn(plugin, 'togglePlay').and.callThrough();
      this.plugin.invoke(action);
      expect(this.plugin.invoke).toHaveBeenCalled();
      expect(plugin.togglePlay).toHaveBeenCalled();
      expect(this.plugin.invoke.calls.count()).toEqual(1);
      expect(CommandManager.commandMap[this.plugin._name]).toBeDefined();
   })

   it('invoke function call when plugin is not available', function () {
      action = { "type": "command", "command": "eval", "asset": "stage", "pluginId": "stage1", "success": "correct_answer", "failure": "wrong_answer", "dataAttributes": {}, "stageId": "stage1", "value": { "target": "1" } };
      this.plugin._action = action;
      spyOn(AudioManager, 'togglePlay').and.callThrough();
      this.plugin.invoke(action);
      expect(this.plugin.invoke).toHaveBeenCalled();
      expect(AudioManager.togglePlay).toHaveBeenCalled();
      expect(this.plugin.invoke.calls.count()).toEqual(1);
   })
});

describe('Toggle Shadow Command js test cases', function () {
   var action;
   beforeEach(function () {
      this.plugin = ToggleShadowCommand.prototype;
      spyOn(this.plugin, 'initCommand').and.callThrough();
   })

   it('invoke function call', function () {
      action = { "type": "command", "command": "eval", "asset": "stage1", "pluginId": "stage1", "success": "correct_answer", "failure": "wrong_answer", "dataAttributes": {}, "stageId": "stage1", "value": { "target": "1" } };
      this.plugin.initCommand(action);
      expect(this.plugin.initCommand).toHaveBeenCalled();
      expect(this.plugin.initCommand.calls.count()).toEqual(1);
      expect(CommandManager.commandMap[this.plugin._name]).toBeDefined();
   })
});

describe('Toggle Show Command js test cases', function () {
   var action;
   beforeEach(function () {
      this.plugin = ToggleShowCommand.prototype;
      spyOn(this.plugin, 'initCommand').and.callThrough();
   })

   it('invoke function call', function () {
      action = { "type": "command", "command": "eval", "asset": "stage1", "pluginId": "stage1", "success": "correct_answer", "failure": "wrong_answer", "dataAttributes": {}, "stageId": "stage1", "value": { "target": "1" } };
      this.plugin.initCommand(action);
      expect(this.plugin.initCommand).toHaveBeenCalled();
      expect(this.plugin.initCommand.calls.count()).toEqual(1);
      expect(CommandManager.commandMap[this.plugin._name]).toBeDefined();
   })
});

describe('Toggle Show Command js test cases', function () {
   var action;
   beforeEach(function () {
      this.plugin = TransitionToCommand.prototype;
      spyOn(this.plugin, 'initCommand').and.callThrough();
   })

   it('invoke function call', function () {
      action = { "type": "command", "command": "eval", "asset": "stage1", "pluginId": "stage1", "success": "correct_answer", "failure": "wrong_answer", "dataAttributes": {}, "stageId": "stage1", "value": { "target": "1" } };
      this.plugin.initCommand(action);
      expect(this.plugin.initCommand).toHaveBeenCalled();
      expect(this.plugin.initCommand.calls.count()).toEqual(1);
      expect(CommandManager.commandMap[this.plugin._name]).toBeDefined();
   })
});

describe('Toggle Show Command js test cases', function () {
   var action;
   beforeEach(function () {
      this.plugin = UnblurCommand.prototype;
      spyOn(this.plugin, 'initCommand').and.callThrough();
   })

   it('invoke function call', function () {
      action = { "type": "command", "command": "eval", "asset": "stage1", "pluginId": "stage1", "success": "correct_answer", "failure": "wrong_answer", "dataAttributes": {}, "stageId": "stage1", "value": { "target": "1" } };
      this.plugin.initCommand(action);
      expect(this.plugin.initCommand).toHaveBeenCalled();
      expect(this.plugin.initCommand.calls.count()).toEqual(1);
      expect(CommandManager.commandMap[this.plugin._name]).toBeDefined();
   })
});

describe('Toggle Show Command js test cases', function () {
   var action;
   beforeEach(function () {
      this.plugin = WindowEventCommand.prototype;
      spyOn(this.plugin, 'invoke').and.callThrough();
   })

   it('invoke function call when previousContentMimeType  is available', function () {
      action = { "type": "command", "command": "eval", "asset": "stage1", "pluginId": "stage1", "success": "correct_answer", "failure": "wrong_answer", "dataAttributes": {}, "stageId": "stage1", "value": { "target": "1" } };
      GlobalContext.previousContentMimeType = "application/vnd.ekstep.ecml-archive";
      this.plugin.invoke(action);
      expect(this.plugin.invoke).toHaveBeenCalled();
      expect(this.plugin.invoke.calls.count()).toEqual(1);
      expect(CommandManager.commandMap[this.plugin._name]).toBeDefined();
   })

   it('invoke function call when currentContentMimeType  is available', function () {
      action = { "type": "command", "command": "eval", "asset": "stage1", "pluginId": "stage1", "success": "correct_answer", "failure": "wrong_answer", "dataAttributes": {}, "stageId": "stage1", "value": { "target": "1" } };
      delete GlobalContext.previousContentMimeType;
      CONTENT_MIMETYPES = ['application/vnd.ekstep.ecml-archive'];
      GlobalContext.currentContentMimeType = "application/vnd.ekstep.ecml-archive";
      this.plugin.invoke(action);
      expect(this.plugin.invoke).toHaveBeenCalled();
      expect(this.plugin.invoke.calls.count()).toEqual(1);
   })

   it('invoke function call when mimetype is not available', function () {
      action = { "type": "command", "command": "eval", "asset": "stage1", "pluginId": "stage1", "success": "correct_answer", "failure": "wrong_answer", "dataAttributes": {}, "stageId": "stage1", "value": { "target": "1" } };
      delete GlobalContext.previousContentMimeType;
      delete GlobalContext.currentContentMimeType;
      this.plugin.invoke(action);
      expect(this.plugin.invoke).toHaveBeenCalled();
      expect(this.plugin.invoke.calls.count()).toEqual(1);
   })
});