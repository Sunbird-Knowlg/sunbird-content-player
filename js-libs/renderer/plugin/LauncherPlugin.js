PluginManager.registerPlugin('launcher', Plugin.extend({
    initialize: function() {
        EkstepRendererAPI.addEventListener('renderer:launcher:initLauncher', this.initLauncher, this);
    },
    initLauncher: function(evt, content) {
        console.info('launcher init is calling..');
        var dispatcher = [{
            mimeType: 'application/vnd.ekstep.html-archive',
            event: 'renderer:html:launch',
            id: 'org.ekstep.htmlrenderer',
            ver: 1.0,
            type: 'plugin'
        }, {
            mimeType: 'application/vnd.ekstep.ecml-archive',
            event: 'renderer:ecml:launch',
            id: 'org.ekstep.ecmlrenderer',
            ver: 1.0,
            type: 'plugin'
        }];
        var contentTypePlugin = _.findWhere(dispatcher, {
            'mimeType': content.mimeType
        });
        isCoreplugin = true;
        PluginManager.init('renderer');
        if (!_.isUndefined(contentTypePlugin)) {
            this.loadPlugin(contentTypePlugin, content);
            isCoreplugin = false;
        }
    },
    loadPlugin : function(plugin, content) {
        PluginManager.loadPlugins(plugin, [], function() {
            EkstepRendererAPI.dispatchEvent(plugin.event, undefined, content);
        });
    }

}));
//# sourceURL=launcherPlugin.js