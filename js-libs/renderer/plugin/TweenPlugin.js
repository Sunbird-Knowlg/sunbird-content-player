var TweenPlugin = AnimationPlugin.extend({
    _animateFn: undefined,
    initPlugin: function(data, plugin) {
        var to = data.to;
        var loop = data.loop;

        if(!_.isArray(to)) {
            to = [to];
        }

        var loopStr = '';
        if (loop) {
            loopStr = ', loop:true';
        }

        var fn = '(function() {return function(plugin, cb){';
        fn += 'createjs.Tween.get(plugin, {override:true ' + loopStr + '})';
        to.forEach(function(to) {
            var data = (_.isString(to.__cdata)) ? JSON.parse(to.__cdata) : to.__cdata;
            var relDims = plugin.getRelativeDims(data);
            data.x = relDims.x;
            data.y = relDims.y;
            data.width = relDims.w;
            data.height = relDims.h;

            data.scaleX = plugin._self.scaleX * data.scaleX;
            data.scaleY = plugin._self.scaleY * data.scaleY;

            fn += '.to(' + JSON.stringify(data) + ',' + to.duration + ', createjs.Ease.' + to.ease + ')';
        });
        fn += '.call(function() {cb({status: "success"})})';
        fn += '.addEventListener("change", function(event) {Renderer.update = true;';
        if(data.widthChangeEvent) {
            fn += 'AnimationManager.widthHandler(event, plugin);';
        }
        fn += '})}})()';
        this._animateFn = fn;
    },
    animate: function(plugin, cb) {
        if (!cb) cb = function(resp) {console.info("Tween execution completed.")};
        var fn = this._animateFn.replace("COMPLETE_CALLBACK", cb.toString());
        var animationFn = eval(fn);
        animationFn.apply(null, [plugin._self,cb]);
    }
});
AnimationManager.registerPlugin('tween', TweenPlugin);
