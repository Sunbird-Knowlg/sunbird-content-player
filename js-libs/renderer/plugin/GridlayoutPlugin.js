var GridlayoutPlugin = Plugin.extend({
	_type: 'gridlayout',
    _render: true,
    initPlugin: function(data) {
    	this._self = new createjs.Container();
		var dims = this.relativeDims();
        this._self.x = dims.x;
        this._self.y = dims.y;

        var hit = new createjs.Shape();
        hit.graphics.beginFill("#000").r(0, 0, dims.w, dims.h);
        this._self.hitArea = hit;

    	var model = data.iterate;
    	var dataObjs = this._stage.getModelValue(model);
    	// console.log("dataObjs:", dataObjs);
    	this.renderTableLayout(dataObjs);
    },
    getLayout: function() {
    	var children = {};
    	var data = this._data;
        for (k in data) {
	        if (PluginManager.isPlugin(k)) {
	        	children[k] = data[k];
	        }
        }
        return children;
    },
    renderTableLayout: function(value) {
    	var cols = undefined;
        var rows = undefined;
    	var count = value.length;
        if(this._data.rows && this._data.cols) {
            cols = this._data.cols; 
            rows = Math.ceil(count/cols);
        } else {
            if(this._data.rows)
                rows = this._data.rows; 
            if(this._data.cols)
                cols = this._data.cols;        
            if(this._data.rows)
                cols = Math.ceil(count/rows);
            else
                rows = Math.ceil(count/cols);
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
    	var cw = (100 - ((cols-1) * marginX))/cols;
    	var ch = (100 - ((rows-1) * marginY))/rows;
    	var index = 0;
    	for (var r=0; r<rows; r++) {
    		for (var c=0; c<cols; c++) {
    			if (c*r < count) {
    				var data = {};
    				data.x = (c * (cw + marginX));
    				data.y = (r * (ch + marginY));
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
                    if (_.isFinite(this._parent.offsetY)) {
                        data.offsetY = this._parent.offsetY;
                    }
                    if(this._data.opacity)
                        data.opacity = this._data.opacity;
                    Object.assign(data, this.getLayout());
                    instance._stage._templateVars[this._data['var']] = this._data.iterate+"["+index+"]";
                    index++;
    				PluginManager.invoke('g', data, instance, instance._stage, instance._theme);
    			}
    		}
    	}
    }
});
PluginManager.registerPlugin('grid', GridlayoutPlugin);