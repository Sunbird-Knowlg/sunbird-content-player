var KaraokePlugin = Plugin.extend({
	_type: 'image',
	_isContainer: false,
	_render: true,
	initPlugin: function(data) {
	}
});
PluginManager.registerPlugin('karaoke', KaraokePlugin);