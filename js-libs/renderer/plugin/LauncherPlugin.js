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
            id: 'org.ekstep.renderer',
            ver: 1.0,
            type: 'plugin'
        }];
        var contentTypePlugin = _.findWhere(dispatcher, {
            'mimeType': content.mimeType
        });
         PluginManager.init('renderer');
        if (!_.isUndefined(contentTypePlugin)) {
            this.loadPlugin(contentTypePlugin, content);
        } else {
             this.loadPlugin(contentTypePlugin, content);
        }
    },
    loadPlugin : function(plugin, content) {
        PluginManager.loadPlugins(plugin, [], function() {
            EkstepRendererAPI.dispatchEvent(plugin.event, undefined, content);
        });
    }

}));