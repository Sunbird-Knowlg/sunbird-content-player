Plugin.extend({
    _type: 'wordduniyatext',
    _isContainer: true,
    _render: true,
    _plginConfig: {},
    _plginData: {},
    _plginAttributes: {},
    initPlugin: function(data) {
        var wordsArr = data.words.split(',');//_.split(data.words, ',');
        var text = data.__text;
        data.__text  = _.map(text.split(' '), function(word) {
            var index = _.indexOf(wordsArr, word)
            if (index != -1) {
                var exp = data.w * (1920 / 100);
                var width = 720 * data.w / 100;
                var fontsize = parseInt(Math.round(data.fontsize * (width / exp)).toString());
                return "<a style='font-weight:bold; cursor:pointer; font-size:"+(parseInt(fontsize)+2)+"px; color:blue; background:yellow; text-decoration:underline;' data-event='word" + index + "_click'>" + word + "</a>";
                //return "<a style='font-weight:bold; font-size:20px; color:blue; background:yellow; text-decoration:underline;' data-event='word" + index + "_click'>" + word + "</a>";
            } else {
                return word;
            }
        }).join(' ');
        
        this._plginData = JSON.parse(data.data.__cdata);
        console.log('_plginData ', this._plginData)

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
        div.style.fontFamily = data.font;
        div.style.fontWeight = data.fontWeight;

        var parentDiv = document.getElementById(Renderer.divIds.gameArea);
        parentDiv.insertBefore(div, parentDiv.childNodes[0]);

        jQuery("#" + data.id).append(data.__text);
        this._div = div;
        this._self = new createjs.DOMElement(div);
        this._self.x = dims.x;
        this._self.y = dims.y;
        // Invoke the embed plugin to start rendering the templates
        // this.invokeEmbed();
        this.registerEvents(data.id);
    },
    // invokeEmbed: function(){
    //   var embedData = {};
    //   embedData.template = this._plginConfig.var || "item";
    //   embedData["var-item"] = this._plginConfig.var || "item";
    //   PluginManager.invoke('embed', embedData, this, this._stage, this._theme);
    // },
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
//# sourceURL=wordactivityrenderer.js