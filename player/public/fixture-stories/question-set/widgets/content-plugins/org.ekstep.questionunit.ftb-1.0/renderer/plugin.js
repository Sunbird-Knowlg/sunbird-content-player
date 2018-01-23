/**
 *
 * Question Unit plugin to render a FTB question
 * @class org.ekstep.questionunit.ftb
 * @extends org.ekstep.contentrenderer.questionUnitPlugin
 * @author Gourav More <gourav_m@tekditechnologies.com>
 */
org.ekstep.contentrenderer.questionUnitPlugin.extend({
    _type: 'org.ekstep.questionunit.ftb',
    _isContainer: true,
    _render: true,
    _selectedanswere:undefined,
    // initPlugin: function (data) {
        //TODO: Implement logic and define interfaces from org.ekstep.questionunit

        //TODO: Remove placeholder images from assets (no.png and yes.png)
    // },
    evaluate: function (data) {
        EkstepRendererAPI.dispatchEvent(this._manifest.id + ":evaluate");
    }
});
//# sourceURL=questionunitFtbRendererePlugin.js