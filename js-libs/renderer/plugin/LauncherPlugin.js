org.ekstep.contentrenderer.registerPlguin('launcher', Plugin.extend({
    initialize: function() {
        EkstepRendererAPI.addEventListener('renderer:launcher:initLauncher', this.initLauncher, this);
    },
    initLauncher: function(evt, content) {
        console.info('launcher init is calling..');
        var dispatcher = [{
            mimeType: 'application/vnd.ekstep.html-archive',
            id: 'org.ekstep.htmlrenderer',
            ver: 1.0,
            type: 'plugin'
        }, {
            mimeType: 'application/vnd.ekstep.ecml-archive',
            id: 'org.ekstep.ecmlrenderer',
            ver: 1.0,
            type: 'plugin'
        }];
        var contentTypePlugin = _.findWhere(dispatcher, {
            'mimeType': content.mimeType
        });
        isCoreplugin = true;
        org.ekstep.contentrenderer.initPlugins('renderer');
        if (!_.isUndefined(contentTypePlugin)) {
            this.loadPlugin(contentTypePlugin, content);
            isCoreplugin = false;
        }
    },
    loadPlugin : function(plugin, content) {
        org.ekstep.contentrenderer.loadPlugins(plugin, [], function() {
            EkstepRendererAPI.dispatchEvent('content:load:' + content.mimeType, undefined, content);
        });
    }

}));
//# sourceURL=launcherPlugin.js