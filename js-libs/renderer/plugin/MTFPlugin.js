var MTFPlugin = Plugin.extend({
    _type: 'mtf',
    _isContainer: true,
    _render: true,
    _lhs_options: [],
    _rhs_options: [],
    _force: false,
    _controller: undefined,
    initPlugin: function(data) {
        this._lhs_options = [];
        this._rhs_options = [];
        this._force  = false;

        var model = data.model;
        if (model) {
            var controller = this._stage.getController(model); 
        	if (controller) {
                this.updateState(controller);   
                // update the MTF state when user land to the page.
        		this._controller = controller;
                this._force = data.force;
                if ((typeof this._force) == 'undefined' || this._force == null) {
                    this._force = false;
                }
        		this._data.x = this._parent._data.x;
        		this._data.y = this._parent._data.y;
        		this._data.w = this._parent._data.w;
        		this._data.h = this._parent._data.h;
        		this._self = new createjs.Container();
				var dims = this.relativeDims();
        		this._self.x = dims.x;
        		this._self.y = dims.y;
                this.invokeChildren(data, this, this._stage, this._theme);
        	}
        }
    },
    getLhsOption: function(index) {
        var option;
        this._lhs_options.forEach(function(opt) {
            if (opt._index == index) {
                option = opt;
            }
        });
        return option;
    },
    // Deprecated - Use setAnswerMapping instead
    setAnswer: function(rhsOption, lhsIndex) {
        this._controller.setModelValue(rhsOption._model, lhsIndex, 'selected');
    },
    setAnswerMapping: function(rhsOption, lhsOption) {
        if (!_.isUndefined(lhsOption)) {
            rhsOption._value.mapped = lhsOption._value.resvalue;
            this._controller.setModelValue(rhsOption._model, lhsOption._index, 'selected');
        }
        else {
            delete rhsOption._value.mapped;
            this._controller.setModelValue(rhsOption._model, undefined, 'selected');
        }
        // update the MTF state when user mapped the RHS to LHS option 
        this.updateState(this._controller);
    },
    removeAnswer: function(rhsOption, lhsIndex) {
        this._controller.setModelValue(rhsOption._model, lhsIndex, '');
    },
    updateState: function(controller) {
     var model = controller._model[controller._index];
     this.saveState(model.type, model.rhs_options);
 }
});
PluginManager.registerPlugin('mtf', MTFPlugin);
