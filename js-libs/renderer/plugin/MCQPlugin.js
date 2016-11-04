var MCQPlugin = Plugin.extend({
    _type: 'mcq',
    _isContainer: true,
    _render: true,
    _multi_select: false,
    _options: [],
    _controller: undefined,
    _shadow: '#0470D8',
    _blur: 30,
    _offsetX: 0,
    _offsetY: 0,
    _highlight: '#E89241',
    initPlugin: function(data) {
        this._multi_select = false;
        this._options = [];
        this._shadow = '#0470D8';
        this._blur = 30;
        this._offsetX = 0;
        this._offsetY = 0;

        var model = data.model;
        if (model) {
            var controller = this._stage.getController(model);
            //get state data from stage._currentObject
            //update the model with mcq state data
            var plugindata= this.getState(this._type);
            if(!_.isUndefined(plugindata)){
               controller._model[controller._index].options=_.isEmpty(plugindata) ? controller._model[controller._index].options : plugindata;
             }
            if(controller){
                // update the MCQ state when user land to the MCQ Page
                this.updateState(controller);
                  // update the MCQ state when user land to the MCQ Page
                this._controller = controller;
                this._multi_select = data.multi_select;
                if ((typeof this._multi_select) == 'undefined' || this._multi_select == null) {
                    this._multi_select = false;
                }
                this._data.x = this._parent._data.x;
                this._data.y = this._parent._data.y;
                this._data.w = this._parent._data.w;
                this._data.h = this._parent._data.h;

                this._self = new createjs.Container();
                var dims = this.relativeDims();
                this._self.x = dims.x;
                this._self.y = dims.y;
                if (data.shadow) {
                    this._shadow = data.shadow;

                    // Unset the shadow on MCQ otherwise default plugin shadow takes effect
                    data.shadow = undefined;
                }
                if (data.highlight) {
                    this._highlight = data.highlight;
                }
                if (_.isFinite(data.blur)) {
                    this._blur = data.blur;
                }
                if (_.isFinite(data.offsetX)) {
                    this._offsetX = data.offsetX;
                }
                if (_.isFinite(data.offsetY)) {
                    this._offsetY = data.offsetY;
                }
                this._multi_select = this.isMultiSelect();
                this.invokeChildren(data, this, this._stage, this._theme);

            }
        }
    },
    isMultiSelect: function() {
        var ansLength = 0;

        var options = this._controller ? this._controller.getModelValue("options") : undefined;
        if (options) {
            ansLength = _.filter(options, function(option) {
                return option.answer == true;
            }).length;
        }
        return (ansLength > 1) ? true : false;
    },
    selectOption: function(option) {
        var controller = this._controller;
        // If it is not a multi-select, then unset all other selected shadows
        if (!this._multi_select) {
            this._options.forEach(function(o) {
                if (o._index != option._index && o.hasShadow()) {
                    o.removeShadow();
                    controller.setModelValue(o._model, false, 'selected');
                }
            });
        }
        // If the shadow is visible, toggle it (unselect)

        var val = undefined;
        if (option) {
            val = option.toggleShadow();
            controller.setModelValue(option._model, val, 'selected');
        }
        this._myflag=true;
          console.info("flag:",this._myflag);
        this.updateState(controller,true);

       // update the MCQ state on SELECTION OF OPTION
        Renderer.update = true;
        return val;
    },
    updateState: function(controller, isSceenChanged) {
        var model = controller._model[controller._index];
        this.saveState(model.type, model.options, isSceenChanged);
    }
});
PluginManager.registerPlugin('mcq', MCQPlugin);
