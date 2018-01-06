/**
 *
 * Question Unit plugin to render a MCQ question
 * @class org.ekstep.questionunit.mcq
 * @extends org.ekstep.contentrenderer.questionUnitPlugin
 * @author Manoj Chandrashekar <manoj.chandrashekar@tarento.com>
 */
org.ekstep.contentrenderer.questionUnitPlugin.extend({
    _type: 'org.ekstep.questionunit.mcq',
    _isContainer: true,
    _render: true,
    initPlugin: function (data) {
        //TODO: Implement logic and define interfaces from org.ekstep.questionunit

        //TODO: Remove placeholder images from assets (no.png and yes.png)
    },
    evaluate: function (data) {
        var evaluator = new mcqEvaluator(data);
        return evaluator.evaluate();
    }
});
//# sourceURL=questionunitMCQPlugin.js