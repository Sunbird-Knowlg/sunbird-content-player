var InputPlugin = HTMLPlugin.extend({
	_type: 'input',
    _input: undefined,
	initPlugin: function(data) {
        this._input = undefined;
        // get the model data from the _current state object
        // and update the input/ftb model
        var controller=this._stage._stageController;
        var identifier = controller.getModelValue("identifier");
        if (!_.isUndefined(controller)) {
           plugindata = this.getState(controller._model[controller._index].type);
           if (!_.isUndefined(plugindata)) {
               controller._model[controller._index].model = _.isEmpty(plugindata) ? controller._model[controller._index].model : plugindata;
           }
       } else {
           console.warn("there is no FTB item");
       }
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
        var instance=this;
        $('#' + data.id).on('change', function(){
            instance.updateState(true);
            // update the state of the input when user gives input to the textbox
        });
        $('#' + data.id).on("click", function (event) {
            var telemetryEdata = {
                type: event.type,
                x: event.pageX,
                y: event.pageY,
                itemId: identifier,
                optionTag: "FTB"
            }
            EventManager.processAppTelemetry({}, 'TOUCH', instance, telemetryEdata);
        });
        instance.updateState(false);
        // update the state of input when user land to the page
    },
    setModelValue: function() {
    if (this._data.model) {
        var instance=this;
        var model = this._data.model;
        this._stage.setModelValue(model, this._input.value);
    }
},
    updateState: function(isStateChanged) {
     this.setModelValue();
     var controller = this._stage._stageController;
     // Check stage is FTB controller or Input text area
     if (!_.isUndefined(controller)) {
         var cModel = controller._model[controller._index];
         this.setState(cModel.type, cModel.model, isStateChanged);
     } else {
         console.warn("There is no ctrl in this stage");
         this.setState(this._data.id, this._input.value, isStateChanged);
     }

 }
});
PluginManager.registerPlugin('input', InputPlugin);
