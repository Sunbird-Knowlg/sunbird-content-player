describe('Summary Plugin test cases', function () {
   var data;
   beforeAll(function (done) {
      this.plugin = SummaryPlugin.prototype;
      this.plugin._theme = Renderer.theme;
      this.plugin._stage = Renderer.theme._currentScene;
      this.plugin.relativeDims = function() {
         return ({ "x": 104.2392, "y": 116.79299999999999, "w": 354.9, "h": 28.613999999999997, "stretch": true })
      }
      spyOn(this.plugin, 'initPlugin').and.callThrough();
      spyOn(this.plugin, 'renderTextSummary').and.callThrough();
      data = { "controller": 'assessment_mtf'};
      done();
   });

   it('Summary initPlugin function', function () {
      this.plugin.initPlugin(data);
      expect(this.plugin.initPlugin).toHaveBeenCalled();
      expect(this.plugin.initPlugin.calls.count()).toEqual(1);
      expect(this.plugin.renderTextSummary).toHaveBeenCalled();
   });

   it('Summary renderTextSummary function', function (done) {
      this.plugin.renderTextSummary("text", undefined);
      expect(this.plugin.renderTextSummary).toHaveBeenCalled();
      expect(this.plugin.renderTextSummary.calls.count()).toEqual(1);
      setTimeout(function () {
         done();
      }, 1001)
   });
});