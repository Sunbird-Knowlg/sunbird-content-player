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
        	if (controller) {
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
                this.invokeChildren(data, this, this._stage, this._theme);
        	}
        }
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
        var val = option.toggleShadow();
        controller.setModelValue(option._model, val, 'selected');
        
        // Shadow state has changed, re-render
        Renderer.update = true;
        return val;
    }
});
PluginManager.registerPlugin('mcq', MCQPlugin);
