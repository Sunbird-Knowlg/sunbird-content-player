var OptionsPlugin = Plugin.extend({
    _type: 'options',
    _isContainer: false,
    _render: false,
    initPlugin: function(data) {
        var model = data.options;
        var value = undefined;
        if (this._parent._controller && model) {
        	value = this._parent._controller.getModelValue(model);
        }
        var layout = data.layout;
        if (value && _.isArray(value) && value.length > 0) {
        	if (layout === 'table' && (_.isFinite(data.cols) || _.isFinite(data.rows))) {
        		this.renderTableLayout(value);
        	}
        }
    },
    renderTableLayout: function(value) {
        var cols = undefined;
        var rows = undefined;
    	var count = value.length;
        
        if(this._data.cols) {
            // Cols specified, rows to compute (rows is ignored even if specified)
            cols = Math.min(count, this._data.cols);
            rows = Math.ceil(count/cols);
        }
        else if(this._data.rows) {
            // Rows is specified, cols to compute
            rows = Math.min(count, this._data.rows);
            cols = Math.ceil(count/rows);
        }
        else {
            // None of the constraints specified, lay in a single row
            rows = 1;
            cols = Math.min(count, this._data.cols);
        }
   
    	var instance = this;
    	var marginX = 0;
    	if (_.isFinite(this._data.marginX)) {
    		marginX = this._data.marginX;
    	}
    	var marginY = 0;
    	if (_.isFinite(this._data.marginY)) {
    		marginY = this._data.marginY;
    	}
    	var padX = this._data.padX || 0;
        var padY = this._data.padY || 0;
    	var cw = (this._data.w - ((cols-1) * marginX))/cols;
    	var ch = (this._data.h - ((rows-1) * marginY))/rows;
    	var index = 0;
    	for (var r=0; r<rows; r++) {
    		for (var c=0; c<cols; c++) {
    			if (c*r < count) {
    				var data = {};
    				data.x = instance._data.x + (c * (cw + marginX));
    				data.y = instance._data.y + (r * (ch + marginY));
    				data.w = cw;
    				data.h = ch;
    				data.padX = padX;
                    data.padY = padY;
                    data.snapX = instance._data.snapX;
                    data.snapY = instance._data.snapY;

                    data.stroke = instance._data.stroke;
                    data['stroke-width'] = instance._data['stroke-width'];
                    data.events = instance._data.events;
                    data.event = instance._data.event;

                    if (this._parent._shadow) {
                        data.shadowColor = this._parent._shadow;
                    }
                    if (this._parent._highlight) {
                        data.highlight = this._parent._highlight;
                    }
                    if (_.isFinite(this._parent._blur)) {
                        data.blur = this._parent._blur;
                    }
                    if (_.isFinite(this._parent._offsetX)) {
                        data.offsetX = this._parent._offsetX;
                    }
                    if (_.isFinite(this._parent._offsetY)) {
                        data.offsetY = this._parent.offsetY;
                    }
                    if(this._data.multiple)
                        data.multiple = true;
                    if(this._data.opacity)
                        data.opacity = this._data.opacity;
    				data.option = instance._data.options + '[' + index + ']';
                    var innerECML = this.getInnerECML();
                    if (!_.isEmpty(innerECML)) {
                        // Handle case if device doesnot support ECMAScript 6
                        if (typeof Object.assign != 'function') {
                            objectAssign()
                        }
                        Object.assign(data, innerECML);
                    }
    				index = index + 1;
    				PluginManager.invoke('option', data, instance._parent, instance._stage, instance._theme);
    			}
    		}
    	}
        // check why did we add this delete statements?
        // delete instance._data.events;
        // delete instance._data.event;
    }
});
PluginManager.registerPlugin('options', OptionsPlugin);
