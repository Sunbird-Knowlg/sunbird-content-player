var GridPlugin = Plugin.extend({
	_render: true,
	_properties: {},
	_dataItems: [],
	_dataModel: [],
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
		this._loadDataItems();
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

		for(var j=0; j<this._properties.rowCount; j++){
			for(var i=0; i<this._properties.colCount; i++){
				//Adding grid rows
				var rowData = this._getDataItem(j, i);
				//rowData.type = "rect";
				//rowData.$t = "Row-"+j +", Cell-" + i;
				rowData.w = 100/this._properties.colCount;
				rowData.h = 100/this._properties.rowCount;
				rowData.x = this._properties.colWidth * i;
				rowData.y = this._properties.rowHeight * j;
				//rowData.fill = "grey";
				//rowData.stroke="black"

				var rowContainer = PluginManager.invoke(rowData.pluginType, rowData, this, this._stage, this._theme);
				rowContainer._self.x = rowData.x;
				rowContainer._self.y = rowData.y;

				//Alternate row colors
				var fillColor = "#5DCBFD"
				if(i%2 == 0){
					fillColor = "#D7ECF4"
				}

				//Adding shpae to row to set row bg color, stroke etc..
				var rowShape = new createjs.Shape();
				var cellDims = rowContainer.relativeDims();

				rowShape.graphics.beginFill(fillColor).r(rowData.x, rowData.y, cellDims.w, cellDims.h);
			}
		}
	},
	_getDataItem: function(rowIndex, colIndex){
		//Getting plugin data declared in ecml
		var dataItem = this._dataItems[colIndex];

		//Getting json data for the row
		var dataObj = this._dataModel[rowIndex];
		
		if(dataItem.pluginType == "text"){
			dataItem.$t = dataObj[dataItem.model];
		}else if(dataItem.pluginType == "image"){
			dataItem.asset = dataObj[dataItem.model];
		}

		_.omit(dataItem, dataItem.model);
		console.log("dataItem", dataItem);
		return dataItem;
		//return _.findWhere(this._dataItems, {"order": orderIndex+1});
	},
	_loadDataItems: function(){
		var len = this._data.columns.data.length;
		var dataItems = this._data.columns.data;
		
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

  	this._dataItems = _.sortBy(children, 'index');
  	console.log("_dataItems", this._dataItems);
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
PluginManager.registerPlugin('grid', GridPlugin);