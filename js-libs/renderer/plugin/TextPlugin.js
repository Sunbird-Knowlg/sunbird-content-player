/**
 * Plugin to render text on canvas using createjs Text.
 * @class TextPlugin
 * @extends EkstepRenderer.Plugin
 * @author Vinu Kumar V S <vinu.kumar@tarento.com>
 */

var TextPlugin = Plugin.extend({

    /**
     * This explains the type of the plugin 
     * @member {String} _type
     * @memberof TextPlugin
     */
    _type: 'text',

    /**
     * This explains text is container or not. 
     * @member {boolean} _isContainer
     * @memberof TextPlugin
     */
    _isContainer: false,

    /**
     * This exlpains text should render on canvas or not. 
     * @member {boolean} _render
     * @memberof TextPlugin
     */
    _render: true,

    /**
     * Magic number used to convert lineHeight for text V2
     * @member {number} lineHeightMagicNumber
     * @memberof TextPlugin
     */
    lineHeightMagicNumber: 1.13, // Fabricjs is using magic number 1.13 in their library

    /**
     *   Invoked by framework when plugin instance created/renderered on stage,
     *   Use this plugin to create diffrent style of text on stage.
     *   @param data {object} data is input object for the text plugin.
     *   @memberof TextPlugin
     *   @override
     */
    initPlugin: function(data) {
        var instance = this;
        var fontsize = data.fontsize || 20;
        var dims = this.relativeDims();
        //var fontFace = (data.font || 'Arial');
        var lineHeight = (data.lineHeight ? data.lineHeight : 0);
        var outline = (data.outline ? data.outline : 0);

        // Resize if the font size is a number
        if (_.isFinite(fontsize)) {
            if (data.w) {
                var exp = parseFloat(PluginManager.defaultResWidth * data.w / 100);
                var cw = this._parent.dimensions().w;
                var width = parseFloat(cw * data.w / 100);
                var scale = parseFloat(width / exp);
                fontsize = parseFloat(fontsize * scale);
                fontsize = fontsize + 'px';
            }
        }

        // If font size is in "em", "%" or "px", no resizing will be done
        var font = fontsize + " " + data.font;

        if (data.weight) {
            font = data.weight + ' ' + font;
        }

        // Value of the text
        var textStr = '';
        if (data.$t || data.__text) {
            textStr = (data.$t || data.__text);
        } else if (data.model) {
            textStr = (this._stage.getModelValue(data.model) || '');
        } else if (data.param) {
            textStr = (this.getParam(data.param.trim()) || '');
        }

        // Init text object
        var text = new createjs.Text(textStr, font, data.color || '#000000');
        text.lineWidth = dims.w;
        text.x = dims.x;
        text.y = dims.y;
        text.lineHeight = lineHeight * (text.getMeasuredLineHeight());
        text.outline = outline;

        // H and V alignment
        var align = (data.align ? data.align.toLowerCase() : 'left');
        var valign = (data.valign ? data.valign.toLowerCase() : 'top');

        if (align == 'left') {
            text.x = dims.x;
        } else if (align == 'right') {
            // text.x = dims.x + dims.w;
            text.regX = -dims.w;
        } else if (align == 'center') {
            text.x = dims.x;
            text.regX = -dims.w / 2;
        }

        if (valign == 'top') {
            text.y = dims.y;
            text.textBaseline = 'hanging';
        } else if (valign == 'bottom') {
            text.y = dims.y + dims.h - text.getMeasuredHeight();
            text.textBaseline = 'hanging';
        } else if (valign == 'middle') {
            text.y = dims.y + dims.h / 2 - text.getMeasuredHeight() / 2;
            if (data.textBaseline) {
                text.textBaseline = 'top';
            } else {
                text.textBaseline = 'hanging';
            }
        }

        if (data.textBaseline) {
            text.textBaseline = data.textBaseline;
        }

        // Adding WYSIWYG config 
        if (data.version === 'V2') {
            text.y = text.y + (data.offsetY * parseFloat(fontsize)); // Adding offset value
            // Converting lineheight to supported lineheight for createJS
            lineHeight = this.lineHeightMagicNumber * data.lineHeight * parseFloat(fontsize);
            text.lineHeight = lineHeight;   // Using lineheight coming from ecml(not using createjs function to calculate lineheight)
        }

        text.textAlign = align;
        text.valign = valign;
        this._self = text;
        /*if (data.rotate) {
            this.rotation(data);
        }*/
    },
    refresh: function() {
        var instance = this;
        var textStr = '';
        if (instance._data.$t || instance._data.__text) {
            textStr = (instance._data.$t || instance._data.__text);
        } else if (instance._data.model) {
            textStr = (this._stage.getModelValue(instance._data.model) || '');
        } else if (instance._data.param) {
            textStr = (this.getParam(instance._data.param.trim()) || '');
        }
        if (textStr && textStr != '') {
            this._self.text = textStr;
            Renderer.update = true;
        }
    }
});
PluginManager.registerPlugin('text', TextPlugin);