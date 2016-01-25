var TestcasePlugin = Plugin.extend({
    _type: 'testcase',
    _render: true,
    _header: {
        "g": {
            "id": "hint",
            "visible": "true",
            "shape": {
                "w": "100",
                "h": "100",
                "x": "0",
                "y": "0",
                "hitArea": true,
                "type": "rect"
            },
            "text": [{
                "id": "yes",
                "font": "Georgia",
                "fontsize": "80",
                "h": "100",
                "w": "10",
                "weight": "bold",
                "x": "80",
                "y": "10",
                "__text": "Yes",
                "valign": "middle"
            }, {
                "id": "no",
                "font": "Georgia",
                "fontsize": "80",
                "h": "100",
                "w": "10",
                "weight": "bold",
                "x": "90",
                "y": "10",
                "__text": "No",
                "valign": "middle"
            }]
        }
    },
    initPlugin: function(data) {
        this._self = new createjs.Container();
        var dims = this.relativeDims();
        this._self.x = dims.x;
        this._self.y = dims.y;
        var hit = new createjs.Shape();
        hit.graphics.beginFill("#000").r(0, 0, dims.w, dims.h);
        this._self.hitArea = hit;
        this.createHeader(data);
        this.invokeChildren(data, this, this._stage, this._theme);
    },
    createHeader: function(data) {
        var uniqueId = _.uniqueId('testcase');
        this._header.g.x = data.x;
        this._header.g.y = data.y;
        this._header.g.w = data.w;
        this._header.g.h = this._getHeaderHeight(data.h);
        this._header.g.text[0].id += uniqueId;
        this._header.g.text[1].id += uniqueId;
        if (data.stroke) this._header.g.shape.fill = data.stroke;
        this.invokeChildren(this._header, this._stage, this._stage, this._theme);
        var pass = PluginManager.getPluginObject(this._header.g.text[0].id);
        var fail = PluginManager.getPluginObject(this._header.g.text[1].id);
        this.registerTestActions(pass);
        this.registerTestActions(fail);
    },
    registerTestActions: function(plugin) {
        var instance = this;
        if (plugin._self) {
            var element = plugin._self;
            element.cursor = 'pointer';
            element.addEventListener("click", function(event) {
                var pass = (plugin._data.__text == "Yes")? true: false;
                TelemetryService.assess(instance._id, "TESTCASE", "MEDIUM").start().end(pass);
            });
        }
    },
    _getHeaderHeight: function(h) {
        return h / 10;   
    }
});
PluginManager.registerPlugin('testcase', TestcasePlugin);