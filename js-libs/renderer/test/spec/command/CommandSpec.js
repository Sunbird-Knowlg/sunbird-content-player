describe('Command js test cases', function () {
   var CommandInstance, action;
   beforeEach(function () {
      CommandInstance = Command.prototype;
      spyOn(CommandInstance, 'init').and.callThrough();
      spyOn(CommandInstance, 'getPluginObject').and.callThrough();
      spyOn(CommandInstance, 'invoke').and.callThrough();
      spyOn(CommandInstance, '_invokeRelatedActions').and.callThrough();
      spyOn(CommandInstance, '_callBack').and.callThrough();
   })

   it('Command invoke function', function () {
      action = { "type": "command", "command": "togglePlay", "asset": "audio", "disableTelemetry": false, "stageInstanceId": "scene1__nr473iu8n1" };
      spyOn(CommandManager, '_setDataAttributes').and.callThrough();
      CommandInstance._isAsync = true;
      CommandInstance._methodName = "togglePlay";
      CommandInstance.init(action);
      expect(CommandInstance.init).toHaveBeenCalled();
      expect(CommandInstance.init.calls.count()).toEqual(1);
      expect(CommandManager._setDataAttributes).toHaveBeenCalled();
      expect(CommandInstance._action.cb).toBeDefined();
      expect(CommandInstance.invoke).toHaveBeenCalled();
      expect(CommandInstance._invokeRelatedActions).toHaveBeenCalled();
   })

   describe('Command getPluginObject function', function() {
      it('when action & plugin parent is available', function() {
         CommandInstance._methodName = "reload";
         CommandInstance._action.asset = "ht1";
         CommandInstance._action.parent = true;
         var plugin = CommandInstance.getPluginObject();
         expect(CommandInstance.getPluginObject).toHaveBeenCalled();
         expect(CommandInstance.getPluginObject.calls.count()).toEqual(1);
         expect(plugin).toBeDefined();
         expect(plugin).toEqual(org.ekstep.pluginframework.pluginManager.pluginInstances.ht1._parent);
      })

      it('when plugin is not found in plugin instance', function () {
         CommandInstance._action.pluginObj = org.ekstep.pluginframework.pluginManager.pluginInstances.ht1._parent;
         CommandInstance._methodName = "reload";
         CommandInstance._action.asset = "";
         var plugin = CommandInstance.getPluginObject();
         expect(CommandInstance.getPluginObject).toHaveBeenCalled();
         expect(CommandInstance.getPluginObject.calls.count()).toEqual(1);
         expect(plugin).toBeDefined();
      })
   })

   it('Command invoke function', function () {
      CommandInstance.invoke(action);
      expect(CommandInstance.getPluginObject).toHaveBeenCalled();
      expect(CommandInstance.invoke).toHaveBeenCalled();
      expect(CommandInstance.invoke.calls.count()).toEqual(1);
   })

   describe('Command _invokeRelatedActions function', function(){
      it('when action stage instance id is different as current stage id', function () {
         spyOn(CommandManager, 'handle').and.callThrough();
         CommandInstance._invokeRelatedActions('siblings');
         expect(CommandManager.handle).not.toHaveBeenCalled();
      })

      it('when action stage instance id is same as current stage id', function () {
         CommandInstance._action.stageInstanceId = Renderer.theme._currentScene._stageInstanceId;
         spyOn(CommandManager, 'handle').and.callThrough();
         CommandInstance._action.children = [{ asset: "ht2", command: "play", id: "action_ht2", type: "command", pluginId: "stage1" }]
         CommandInstance._invokeRelatedActions('children');
         expect(CommandManager.handle).toHaveBeenCalled();
         expect(CommandManager.handle.calls.count()).toEqual(1);
      })
   })

   describe('Command _callBack function', function() {
      it('When response status is success ', function() {
         CommandInstance._callBack({status:"success"});
         expect(CommandInstance._callBack).toHaveBeenCalled();
         expect(CommandInstance._callBack.calls.count()).toEqual(1);
         expect(CommandInstance._invokeRelatedActions).toHaveBeenCalled();
      })

      it('When response status is not success ', function () {
         CommandInstance._callBack({ status: "error" });
         expect(CommandInstance._callBack).toHaveBeenCalled();
         expect(CommandInstance._callBack.calls.count()).toEqual(1);
         expect(CommandInstance._invokeRelatedActions).not.toHaveBeenCalled();
      })
   })

})