var GridlayoutPlugin = LayoutPlugin.extend({
	_type: 'grid',
    generateLayout: function() {
    	var tableProps = this.getTableProperties();
    	var instance = this;
    	var marginX = 0;
    	if (_.isFinite(this._data.marginX)) {
    		marginX = this._data.marginX;
    	}
    	var marginY = 0;
    	if (_.isFinite(this._data.marginY)) {
    		marginY = this._data.marginY;
    	}

    	var cw = (100 - ((tableProps.cols-1) * marginX))/tableProps.cols;
    	var ch = (100 - ((tableProps.rows-1) * marginY))/tableProps.rows;
    	var index = 0;
        
    	for (var r=0; r<tableProps.rows; r++) {
    		for (var c=0; c<tableProps.cols; c++) {
    			if (this._cells.length < this._cellsCount) {
    				var data = {};
    				data.x = (c * (cw + marginX));
    				data.y = (r * (ch + marginY));
    				data.w = cw;
    				data.h = ch;
                    this._cells.push(data);
    			}
    		}
    	}
    },
    getTableProperties: function() {
        var cols = undefined;
        var rows = undefined;
        var count = this._cellsCount;
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
        return {"cols": cols, "rows": rows};
    }
});
PluginManager.registerPlugin('grid', GridlayoutPlugin);