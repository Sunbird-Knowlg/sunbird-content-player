var DataGenerator = {
	_loaderMap: {},
	loadData: function(baseDir, type, id, controller, dataType) {
		var folder = type;
		(dataType)?dataType = dataType.toLowerCase(): dataType = "json";
		var filename = id + '.' + dataType;
		var fullPath = baseDir + "/" + folder + "/" + filename;
		jQuery.getJSON(fullPath, function(data) {
			DataGenerator._onLoad(data, controller);
		}).fail(function() {
			console.error("error while fetching json: "+fullPath);
		});
	},
	_onLoad: function(data, controller) {
		controller.onLoad(data);
	}
}
