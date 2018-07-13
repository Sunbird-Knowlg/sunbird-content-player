describe('Tween Plugin test cases', function () {
   var data = {
      "to": {
         "ease": "linear",
         "duration": 500,
         "__cdata": '{"x": 20,"y": 20}'
      },
      "id": "imageTweenTest", 
      "loop":1, 
      "widthChangeEvent": true
   };
   beforeAll(function (done) {
      this.plugin = TweenPlugin.prototype;
      spyOn(this.plugin, 'initPlugin').and.callThrough();
      spyOn(this.plugin, 'animate').and.callThrough();
      done();
   });

   it('Tween initPlugin function', function () {
      this.plugin.initPlugin(data, org.ekstep.pluginframework.pluginManager.pluginInstances.do_2122479583895552001118_tween);
      expect(this.plugin.initPlugin).toHaveBeenCalled();
      expect(this.plugin.initPlugin.calls.count()).toEqual(1);
   });

   it('Tween animate function', function (done) {
      this.plugin.animate(org.ekstep.pluginframework.pluginManager.pluginInstances.do_2122479583895552001118_tween);
      expect(this.plugin.animate).toHaveBeenCalled();
      expect(this.plugin.animate.calls.count()).toEqual(1);
      setTimeout(function() {
         done();
      }, 1001)
   });
});