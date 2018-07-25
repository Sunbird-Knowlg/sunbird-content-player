var DivPlugin = HTMLPlugin.extend({
    _type: 'div',
    initPlugin: function(data) {
        this._input = undefined;
        var dims = this.relativeDims();
        var div = document.getElementById(data.id);
        if (div) {
            jQuery("#" + data.id).remove();
        }
        div = document.createElement('div');
        if (data.style)
            div.setAttribute("style", data.style);
        div.id = data.id;
        div.style.width = dims.w + 'px';
        div.style.height = dims.h + 'px';
        div.style.position = 'absolute';

        var instance = this;
        var parentDiv = document.getElementById(Renderer.divIds.gameArea);
        parentDiv.insertBefore(div, parentDiv.childNodes[0]);

        // Value of the text
        var textStr = '';
        if (data.$t || data.__text) {
            textStr = (data.$t || data.__text);
        } else if (data.model) {
            textStr = (this._stage.getModelValue(data.model) || '');
        } else if (data.param) {
            textStr = (this.getParam(data.param.trim()) || '');
        }

        var innerHtml = (data.__cdata || textStr);

        // need to check child events working with the current div and it's children (if id is provided.)
        // get the data from model - like how we are getting the JSON data for scene title.
        jQuery("#" + data.id).append(data.__cdata);
        this._div = div;
        this._self = new createjs.DOMElement(div);
        this._self.x = dims.x;
        this._self.y = dims.y;
        this.registerEvents(data.id);
    },
    registerEvents: function(id) {
        var instance = this;
        jQuery('#'+id).children().each(function () {
            var data = jQuery(this).data();
            if (data && data.event) {
                jQuery(this).click(function(event) {
                    event.preventDefault();
                    instance._triggerEvent(data.event);
                    console.info("Triggered event ",data.event);
                });
            }
        });
    },
    _triggerEvent: function(event) {
        var plugin = PluginManager.getPluginObject(Renderer.theme._currentStage);
        event = new createjs.Event(event);
        if(plugin)
            plugin.dispatchEvent(event);
    }
});
PluginManager.registerPlugin('div', DivPlugin);
