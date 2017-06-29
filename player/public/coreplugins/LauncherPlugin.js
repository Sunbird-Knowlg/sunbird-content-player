/**
 * @author Manjunath Davanam <manjunathd@ilimi.in>
 */

org.ekstep.contentrenderer.registerPlguin('launcher', Plugin.extend({
    initialize: function() {
        EkstepRendererAPI.addEventListener('renderer:launcher:initLauncher', this.initLauncher, this);
    },
    initLauncher: function(evt, content) {
        console.info('launcher init is calling..');
        var contentTypePlugin = _.findWhere(AppConfig.CONTENT_LAUNCHERS, {
            'mimeType': content.mimeType
        });
        isCoreplugin = true;
        org.ekstep.contentrenderer.initPlugins('');
        if (!_.isUndefined(contentTypePlugin)) {
            this.loadPlugin(contentTypePlugin, content);
            isCoreplugin = false;
        }
    },
    loadPlugin: function(plugin, content) {
        org.ekstep.contentrenderer.loadPlugins(plugin, [], function() {
            setTimeout(function() {
                EkstepRendererAPI.dispatchEvent('content:load:' + content.mimeType, undefined, content);
            }, 0);
        });
    }

}));
//# sourceURL=launcherPlugin.js