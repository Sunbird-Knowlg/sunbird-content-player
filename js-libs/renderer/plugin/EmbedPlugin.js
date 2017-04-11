/**
 * Plugin to render any templates
 * @class EmbedPlugin 
 * @extends EkstepRenderer.Plugin
 * @author Vinu Kumar V S <vinu.kumar@tarento.com>
 */
var EmbedPlugin = Plugin.extend({

    /**
     * This explains the type of the plugin. 
     * @member {String} _type.
     * @memberof EmbedPlugin
     */
    _type: 'embed',

    /**
     * This explains the plugin is container OR not. 
     * @member {boolean} _isContainer.
     * @memberof EmbedPlugin
     */
    _isContainer: false,

    /**
     * This explains plugin should render on canvas OR not. 
     * @member {boolean} _render
     * @memberof EmbedPlugin
     */
    _render: true,

    /**
     *   Invoked by framework when plugin instance created/rendered on stage.
     *   Use this plugin to render any templates.
     *   @param data {object} data is input object of any templates.
     *   @memberof EmbedPlugin
     *   @override
     */
    initPlugin: function(data) {
        var instance = this;
        if (data.template || data['template-name']) {
            var templateId = (data['template-name']) ? data['template-name'] : this._stage.getTemplate(data.template);
            var template = this._theme._templateMap[templateId];
            if (template) {
                for (var k in data) {
                    if (k === 'template' || k === 'template-name') continue;
                    if (k.substring(0, 4) == "var-") {
                        this._stage._templateVars[k.substring(4)] = data[k];
                    } else if (k.substring(0, 3) == "ev-") {
                        var expr = this.replaceExpressions(data[k]);
                        this._stage._templateVars[k.substring(3)] = expr;
                    } else {
                        this._stage._templateVars[k] = data[k];
                    }
                }
                this._self = new createjs.Container();
                data.w = data.w || 100;
                data.h = data.h || 100;
                var dims = this.relativeDims();
                this._self.x = dims.x;
                this._self.y = dims.y;
                // var hit = new createjs.Shape();
                // hit.graphics.beginFill("#000").r(0, 0, dims.w, dims.h);
                // this._self.hitArea = hit;

                this.invokeChildren(template, this, this._stage, this._theme);
            }
        }
    },
    refresh: function() {
        if (_.isArray(this._childIds)) {
            for (var i = 0; i < this._childIds.length; i++) {
                var childPlugin = PluginManager.getPluginObject(this._childIds[i]);
                if (childPlugin) {
                    childPlugin.refresh();
                }
            }
        }
    },
    replaceExpressions: function(model) {
        var arr = [];
        var idx = 0;
        var nextIdx = model.indexOf('${', idx);
        var endIdx = model.indexOf('}', idx + 1);
        while (nextIdx != -1 && endIdx != -1) {
            var expr = model.substring(nextIdx, endIdx + 1);
            arr.push(expr);
            idx = endIdx;
            nextIdx = model.indexOf('${', idx);
            endIdx = model.indexOf('}', idx + 1);
        }
        if (arr.length > 0) {
            for (var i = 0; i < arr.length; i++) {
                var val = this.evaluateExpr(arr[i]);
                model = model.replace(arr[i], val);
            }
        }
        return model;
    }
});
PluginManager.registerPlugin('embed', EmbedPlugin);