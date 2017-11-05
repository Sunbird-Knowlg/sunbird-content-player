Plugin.extend({
    _type: 'org.ekstep.customeval',
    _render: true,
    initPlugin: function(data){
      this._self = new createjs.Shape();
      console.log("org.ekstep.customEvalPlugin plugin initPlugin");
      var custEvalInst = new CustomEval();
      EkstepRendererAPI.registerEval("mcq", custEvalInst);
    }
});