var GridPlugin = Plugin.extend({
	_render: true,
	_properties: {},
	_dataItems: [],
	_dataModel: [],
	_cellCount: 0,
	initPlugin: function(data) {
		this._data = data;
		var container = new createjs.Container();
 		this._self = container;
 		this._setProperties();

		// Adding shape to grid for bg, border etc..
		/*var fillShape = new createjs.Shape();
		fillShape.graphics.beginFill(data.fill).r(0, 0, dims.w, dims.h);
 		container.addChild(fillShape);*/
 		this.invokeChildren(data, this, this._stage, this._theme);

		this._drawGrid();
	},
	_setProperties: function(){
		var dims = this.relativeDims();

		this._properties.rowCount = this._data.rows.count;
		this._properties.colCount = this._data.columns.count;

		this._properties.rowHeight = this._dimensions.h / this._properties.rowCount;
		this._properties.colWidth = this._dimensions.w / this._properties.colCount;
	},
	_drawGrid: function() {
		//Adding rows, internally it will columns to each row
		this._dataItems = this._getDataItems(this._data.columns);
		this._addRows();
		return;
	},
	_addRows:function(){
		//Adding Row to grid
		var colLen = this._properties.colCount;
		var cellWidth = this._data.w / this._properties.colCount;
		var cellHeight = this._data.h / this._properties.rowCount;

		if (this._data.model) {
      this._dataModel = (this._stage.getModelValue(this._data.model) || '');
      console.log(this._dataModel);
    } 
		_cellCount = 0;

		for(var j=0; j<this._properties.rowCount; j++){
			//Adding grid rows
			for(var i=0; i<this._properties.colCount; i++){

				//Creating cell container
				var cellContObj = {} 
				cellContObj.w = 100/this._properties.colCount;
				cellContObj.h = 100/this._properties.rowCount;
				cellContObj.x = this._properties.colWidth * i;
				cellContObj.y = this._properties.rowHeight * j;

				var cellCont = PluginManager.invoke("g", cellContObj, this, this._stage, this._theme);

				cellCont._self.x = cellContObj.x;
				cellCont._self.y = cellContObj.y;

				for(var k=0; k<this._dataItems.length; k++){
					var dataItem = this._getDataItem(this._dataItems[k], this._dataModel[_cellCount]);
					var pluginItem = PluginManager.invoke(dataItem.pluginType, dataItem, cellCont, cellCont._stage, cellCont._theme);
					
					//pluginItem.invokeChildren(dataItem, pluginItem, this._stage, this._theme);

					var conDims = pluginItem.relativeDims();
				}
				_cellCount++;
			}
		}
	},
	_getDataItem: function(dataItem, dataObj){
		//Getting plugin data declared in ecml
		//var dataItem = this._dataItems[colIndex];

		//Getting json data for the row
		//var dataObj = this._dataModel[rowIndex];
		var dataItemCopy = _.clone(dataItem);
		if(dataItemCopy.pluginType == "text"){
			dataItemCopy.$t = dataObj[dataItemCopy.model];
			dataItemCopy.fontsize = dataItemCopy.fontsize * this._properties.colCount;
		}else if(dataItemCopy.pluginType == "image"){
			dataItemCopy.asset = dataObj[dataItemCopy.model];
		}/*else if(dataItemCopy.pluginType == "g"){
			var childItems = this._getdataItemCopys(dataItemCopy);
			for(k in childItems){
				childItem = childItems[k];
				if(childItem.model != null){
					childItem = this._getdataItemCopy(childItem, dataObj);
					_.find(dataItemCopy, )
					console.log("childItem", childItem);
				}
			}
			console.log("g children", dataItemCopy);
		}*/

		_.omit(dataItemCopy, dataItemCopy.model);
		//console.log("dataItemCopy", dataItemCopy);
		return dataItemCopy;
		//return _.findWhere(this._dataItems, {"order": orderIndex+1});
	},
	_getDataItems: function(inputData){
		var len = inputData.length;
		var dataItems;
		if(inputData.data){
			dataItems = inputData.data
		}else{
			dataItems = inputData;
		}
		
		var children = [];
		for (k in dataItems) {
			if (PluginManager.isPlugin(k)) {
				if(_.isArray(dataItems[k])) {
					_.each(dataItems[k], function(item) {
						item.pluginType = k;
						children.push(item);
					});
				} else {
					dataItems[k].pluginType = k;
					children.push(dataItems[k]);
				}
			}
		}
		return _.sortBy(children, 'index');
  	//this._dataItems = _.sortBy(children, 'index');
  	//console.log("_dataItems", this._dataItems);
	},
	_addColumns: function(rowContainer, rowIndex){
		// Not required
		//Adding columns to each row
		var len = this._properties.colCount;
		for(var j=0; j<len; j++){

			var dataObj = {};
			dataObj.x = this._properties.colWidth * j;
			dataObj.y = 0;
			dataObj.h = this._properties.rowHeight;
			dataObj.w = this._properties.colWidth;

			var colContainer = PluginManager.invoke("g", dataObj, rowContainer, this._stage, this._theme);
			//var colContainer = //new createjs.Container();
			

			//Adding shpae to row to get row bg color, stroke etc..
			var colShape = new createjs.Shape();
			colShape.graphics.setStrokeStyle(1).beginStroke("grey").r(0, 0, colContainer.width, colContainer.height);
			colContainer.addChild(colShape);

			//Adding column to row
			rowContainer.addChild(colContainer);

			
			/*var orderIndex = (rowIndex * this._properties.colCount) + j;
			var dataItem = this._getDataItem(orderIndex);
			if(dataItem){
				PluginManager.invoke(dataItem.pluginType, dataItem, colContainer, this._stage, this._theme);
			}*/
			//container.addChild(dataItem);

		}
		return rowContainer;
	}
});
// PluginManager.registerPlugin('grid', GridPlugin);