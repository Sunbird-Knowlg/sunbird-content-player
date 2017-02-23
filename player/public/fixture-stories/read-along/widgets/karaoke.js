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
                return "<a style='font-weight:bold; cursor:pointer; font-size:"+(parseInt(fontsize)+2)+"px; color:blue; background:yellow; text-decoration:underline;' data-event='" + word + "_click'>" + word + "</a>";
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
        this._self = new createjs.Container();
        this._self.x = dims.x;
        this._self.y = dims.y;
        this.invokeController();
        this.invokeTemplate();
        //Invoke the embed plugin to start rendering the templates
        this.invokeEmbed(data);
        this.registerEvents(data.id);
    },
    invokeController: function() {
        var controllerData = {};
        controllerData.__cdata = this._plginData.controller;
        controllerData.type = "data";
        controllerData.name = "dictionary";
        controllerData.id = "dictionary";
        this._theme.addController(controllerData);
        //this._theme._controllerMap['dictionary'] ;
    },
    invokeTemplate: function() {
        var instance = this;
        var templateType = "data";
        var templateId = this._stage.getTemplate("dictionary");
        this._theme._templateMap[this._plginData.template.id] = this._plginData.template;
    },
    invokeEmbed: function(data){
        var instance = this;
        var wordsArr = data.words.split(',');
        _.forEach(wordsArr, function(value, key) {
            var embedData = {};
            // embedData.template = "data";
            // embedData["var-word"] = "data";
            // PluginManager.invoke('embed', embedData, this, this._stage, this._theme);
            embedData["id"] = value+'_info';
            embedData["stroke"] = "white";
            embedData["template-name"] = instance._plginData.template.id;
            embedData["var-word"] = "dictionary."+value;
            embedData["z-index"] = 1000+key;
            PluginManager.invoke('embed', embedData, instance, instance._stage, instance._theme);
        });
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
//# sourceURL=wordactivityrenderer.js