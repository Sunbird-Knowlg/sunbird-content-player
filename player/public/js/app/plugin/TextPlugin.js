var TextPlugin = Plugin.extend({
    _type: 'text',
    _isContainer: false,
    _render: true,
    initPlugin: function(data) {
        var text;
        var instance = this;
        if (data.fontsize) {
            text = this.isFontGiven(data);
            // this._self = text;
        } else {
            var dims = this.relativeDims();
            var paramMap = {font:'glegoo', autoReduce:true, autoExpand:true, minSize:70, size:100, debug:true};
            if (data.$t || data.__text) {
                paramMap["text"] = (data.$t || data.__text);
            } else if (data.model) {
                paramMap["text"] = (this._stage.getModelValue(data.model) || '');
            } else if (data.param) {
                paramMap["text"] = (this._stage.params[data.param.trim()] || '');
            }
            if(data.w)
                paramMap["width"] = dims.w;
            if(data.h)
                paramMap["height"] = dims.h;
            if(data.x)
                paramMap["x"] = dims.x;
            if(data.y)
                paramMap["y"] = dims.y;
            if(data.color)
                paramMap["fillColor"] = data.color;
            text = new txt.CharacterText(paramMap);
            // this._theme._self.addChild(text);
            //this._theme.inputs.push(data.id);
        }
        
         this._self = text;
    },
    isFontGiven: function(data) {     
        var dims = this.relativeDims();   
        var fontsize = data.fontsize || 20;
        if (data.w) {
            var exp = parseFloat(PluginManager.defaultResWidth * data.w / 100);
            var cw = this._parent.dimensions().w;
            var width = parseFloat(cw * data.w / 100);
            var scale = parseFloat(width / exp);
            fontsize = parseFloat(fontsize * scale);
        }
        var font = fontsize + 'px ' + data.font || 'Arial';
        if (data.weight) {
            font = data.weight + ' ' + font;
        }
        
        var textStr = '';
        if (data.$t || data.__text) {
            textStr = (data.$t || data.__text);
        } else if (data.model) {
            textStr = (this._stage.getModelValue(data.model) || '');
        } else if (data.param) {
            textStr = (this._stage.params[data.param.trim()] || '');
        }
        var text = new createjs.Text(textStr, font, data.color || '#000000');
        var align = 'left';
        text.x = dims.x;
        if (data.align && data.align.toLowerCase() == 'left') {
            text.x = dims.x;
            align = data.align.toLowerCase();
        } else if (data.align && data.align.toLowerCase() == 'right') {
            text.x = dims.x + dims.w;
            align = data.align.toLowerCase();
        } else if (data.align && data.align.toLowerCase() == 'center') {
            align = data.align.toLowerCase();
            text.x = dims.x + dims.w/2;
        }
        text.y = dims.y;
        text.lineWidth = dims.w;
        text.textAlign = align;
        text.textBaseline = 'middle';
        return text;
    }
});
PluginManager.registerPlugin('text', TextPlugin);
