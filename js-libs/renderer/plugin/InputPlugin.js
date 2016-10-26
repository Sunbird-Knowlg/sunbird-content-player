var InputPlugin = HTMLPlugin.extend({
	_type: 'input',
    _input: undefined,
    _checkOptionchanges:false,
	initPlugin: function(data) {
        this._input = undefined;

        var fontsize = data.fontsize || "1.6em";
        var fontweight = data.weight || "normal";
        var color = data.color || "#000000";
        var background = data.fill || "white";
        var font = data.font || "Arial";
        var border = data.stroke || "#000000";
        data.stroke = ""; // unset so that parent plugin doesn't draw the border

		var dims = this.relativeDims();
		var input = document.getElementById(data.id);
		if(input) {
			jQuery("#" + data.id).remove();
		}
        input = document.createElement('input');
        input.id = data.id;
        input.type = data.type;

        input.style.top = "-1000px"; // position off-screen initially
        input.style.width = dims.w + 'px';
        input.style.height = dims.h + 'px';
        input.style.minWidth = dims.w + 'px';
        input.style.minHeight = dims.h + 'px';

        input.style.setProperty("font-size", fontsize, "important");
        input.style.setProperty("font-weight", fontweight, "important");
        input.style.setProperty("font-family", font, "important");
        input.style.setProperty("color", color, "important");
        input.style.setProperty("background-color", background, "important");
        input.style.setProperty("border-color", border, "important");

        input.className = data.class;
        input.style.display = 'none';
        var instance = this;
        var val;
        if (data.model) {
            var model = data.model;
            val = this._stage.getModelValue(model);
        } else if (data.param) {
            val = this._stage.params[data.param.trim()];
        }
        input.value = val || "";
        var div = document.getElementById('gameArea');
        div.insertBefore(input, div.childNodes[0]);
        this._input = input;
        this._self = new createjs.DOMElement(input);
        this._self.x = dims.x;
        this._self.y = dims.y + 1000; // negate the initial off-screen positioning
        this._theme.inputs.push(data.id);
        this._stage._inputs.push(this);
	},
    setModelValue: function() {
    if (this._data.model) {
        var instance=this;
        var model = this._data.model;
        this._stage.setModelValue(model, this._input.value);
        this._checkOptionchanges=true;
        instance.saveInputPlugindata();

    }
},
    saveInputPlugindata:function(){
        var controller = this._stage._stageController;
        if(!_.isUndefined(controller)){
            // if the Stage is FTB 
            var cModel=controller._model[controller._index];       
            var pModel=cModel.model;
            var pType=cModel.type;
            var stageStateFlag="stageStateFlag";
            this.saveState(pType,pModel);
            this.saveState(stageStateFlag,this._checkOptionchanges);
        }else{
            // If the stage is Input plugin
            console.warn("There is no ctrl in this stage");
            pModel=this._input.value;
            pType=this._data.pluginType;
            this.saveState(pType,pModel);
        }
        
    }

});
PluginManager.registerPlugin('input', InputPlugin);
