/***
 * The iEvaluator plugin class is the interfce class, other custom evaluator should have to
 * extend this class with the given default methods.
 * @class EkstepRenderer.Plugin
 * @author Vivek Kasture <vivek_kasture@techjoomla.com>
 */
IEvaluator = Class.extend({
    init: function(data, parent, stage, theme) {
        console.log("IEvaluator Plugin Initialized");
        this.initPlugin();
    },
    evaluate: function(item){
        console.error("Subclass is not implemented this method");
    },
    reset: function(item) {
        console.error("Subclass is not implemented this method");
    },
    initPlugin: function(data) {
        this.evaluate();
    },
});
