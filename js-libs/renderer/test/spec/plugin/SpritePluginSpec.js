// Sprite plugin is to handle animation when different position of asset is available in single image. 
// This will give illusion that asset is moving

var spritedata;
describe('Sprite Plugin test cases', function () {
   beforeEach(function (done) {
      spritedata = {asset:"sprite",start:"lift",x:0,y:0,w:100,h:100,id:"spriteAnimation","z-index":100,pluginType:"sprite",font:"NotoSans, NotoSansGujarati, NotoSansOriya, NotoSansMalayalam"};
      this.plugin = PluginManager.invoke('sprite', spritedata, Renderer.theme._currentScene, Renderer.theme._currentScene, Renderer.theme);
      spyOn(this.plugin, 'initPlugin').and.callThrough();
      spyOn(this.plugin, 'play').and.callThrough();
      spyOn(this.plugin, 'togglePlay').and.callThrough();
      spyOn(this.plugin, 'pause').and.callThrough();
      spyOn(this.plugin, 'stop').and.callThrough();
      done();
   });

   it('Sprite Plugin initPlugin function', function () {
      this.plugin.initPlugin({ primary: true });
      expect(this.plugin.initPlugin).toHaveBeenCalled();
      expect(this.plugin._self).toBeDefined();
      expect(this.plugin.initPlugin.calls.count()).toEqual(1);
   });

   it('Sprite plugin play', function () {
      expect(this.plugin._self).toBeDefined();
      spyOn(this.plugin._self, 'gotoAndPlay').and.callThrough();
      this.plugin._self.visible = false;
      this.plugin.play({ primary: true });
      expect(this.plugin.play).toHaveBeenCalled();
      expect(this.plugin._self.gotoAndPlay).toHaveBeenCalled();
      expect(this.plugin.play.calls.count()).toEqual(1);
   });

   describe('Sprite plugin togglePlay', function() {
      it('when sprite is paused', function () {
         expect(this.plugin._self).toBeDefined();
         spyOn(this.plugin._self, 'gotoAndPlay').and.callThrough();
         this.plugin._self.paused = true;
         this.plugin.togglePlay({ primary: true });
         expect(this.plugin.togglePlay).toHaveBeenCalled();
         expect(this.plugin._self.gotoAndPlay).toHaveBeenCalled();
         expect(this.plugin.togglePlay.calls.count()).toEqual(1);
      });

       it('when sprite is playing', function () {
         expect(this.plugin._self).toBeDefined();
         this.plugin._self.paused = false;
         this.plugin.togglePlay({ primary: true });
         expect(this.plugin.togglePlay).toHaveBeenCalled();
         expect(this.plugin.togglePlay.calls.count()).toEqual(1);
         expect(this.plugin._self.paused).toBeTruthy();
      });
   });

   it('when Sprite Plugin pause is called', function () {
      expect(this.plugin._self).toBeDefined();
      this.plugin.pause();
      expect(this.plugin.pause).toHaveBeenCalled();
      expect(this.plugin.pause.calls.count()).toEqual(1);
      expect(this.plugin._self.paused).toBeTruthy();
   });

   it('when Sprite Plugin stop is called', function () {
      expect(this.plugin._self).toBeDefined();
      spyOn(this.plugin._self, 'stop').and.callThrough();
      this.plugin.stop();
      expect(this.plugin.stop).toHaveBeenCalled();
      expect(this.plugin.stop.calls.count()).toEqual(1);
      expect(this.plugin._self.stop).toHaveBeenCalled();
   });
});