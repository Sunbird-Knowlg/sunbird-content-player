var LayoutPlugin = Plugin.extend({
	_isContainer: true,
    _render: true,
	_cells: [],
	_cellsCount: 0,
	initPlugin: function(data) {
        this._cells = [];
        this._cellsCount = 0;
		this._self = new createjs.Container();
		var dims = this.relativeDims();
        this._self.x = dims.x;
        this._self.y = dims.y;

        var hit = new createjs.Shape();
        hit.graphics.beginFill("#000").r(0, 0, dims.w, dims.h);
        this._self.hitArea = hit;

        // If iterate is undefine, then we cant create a layout
        // "Iterate" is Mandatory property
        if(_.isUndefined(data.iterate)) {
            console.error("LayoutPlugin iterate undefined", data);
            return;
        }
        var model = data.iterate;
    	var dataObjs = this._stage.getModelValue(model);
        if(dataObjs) {
            this._cellsCount = dataObjs.length;
        }       
    	this.generateLayout();
        this.renderLayout();     
        
	},
	getCellECML: function() {
    	var children = {};
    	var data = this._data;
        for (k in data) {
	        if (PluginManager.isPlugin(k)) {
	        	children[k] = data[k];
	        }
        }
        return children;
    },
    generateLayout: function() {
    	PluginManager.addError('Subclasses of layout plugin should implement generateLayout()');
    },
    renderLayout: function() {
    	var instance = this;
    	var index = 0;
    	var cellECML = this.getCellECML();
    	this._cells.forEach(function(data) {
    		instance._stage._templateVars[instance._data['var']] = instance._data.iterate+"["+index+"]";
    		instance._addCellAttributes(data);
    		Object.assign(data, cellECML);
    		PluginManager.invoke('g', data, instance, instance._stage, instance._theme);
    		index++;
    	});
    },
    _addCellAttributes: function(data) {
		data.padX = this._data.padX || 0;
        data.padY = this._data.padY || 0;
        data.snapX = this._data.snapX;
        data.snapY = this._data.snapY;

        data.stroke = this._data.stroke;
        data['stroke-width'] = this._data['stroke-width'];
        data.events = this._data.events;
        data.event = this._data.event;

        if (this._data.shadow) {
            data.shadowColor = this._data.shadow;
        }
        if (this._data.highlight) {
            data.highlight = this._data._highlight;
        }
        if (_.isFinite(this._data.blur)) {
            data.blur = this._data.blur;
        }
        if (_.isFinite(this._data.offsetX)) {
            data.offsetX = this._data.offsetX;
        }
        if (_.isFinite(this._data.offsetY)) {
            data.offsetY = this._data.offsetY;
        }
        if(this._data.opacity)
            data.opacity = this._data.opacity;
    }
});