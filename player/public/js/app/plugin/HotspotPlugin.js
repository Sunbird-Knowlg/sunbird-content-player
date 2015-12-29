var HotspotPlugin = ShapePlugin.extend({
    _type: 'hotspot',
    _isContainer: false,
    _render: true,
    initPlugin: function(data) {
        data.fill = undefined;
        data.hitArea = true;
        this._super(data);
    }
});
PluginManager.registerPlugin('hotspot', HotspotPlugin);