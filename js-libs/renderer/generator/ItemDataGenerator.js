var ItemDataGenerator = {
	_loaderMap: {},
	loadData: function(baseDir, type, id, controller) {
		var folder = type;
		var filename = id + '.json';
		var fullPath = baseDir + "/" + folder + "/" + filename;
		jQuery.getJSON(fullPath, function(data) {
			ItemDataGenerator._onLoad(data, controller);
		}).fail(function() {
			console.error("error while fetching json: "+ fullPath);
		});
	},
	_onLoad: function(data, controller) {
		var model = ItemDataGenerator._getItems(data);
		data = _.omit(data, 'items');
		controller.onLoad(data, model);
	},
    _getItems: function(data) {
    	var list = [];
    	if (_.isObject(data)) {
    		var total_items = data.total_items;
			var item_sets = data.item_sets;
			var items = data.items;
			var shuffle = true;
			if (typeof data.shuffle != 'undefined')
				shuffle = data.shuffle;
			if (item_sets && items) {
				var cumulativeIndex = 0; // How many questions have been there before this set
				item_sets.forEach(function(map, setidx) {
					list = ItemDataGenerator._addItems(map.id, map.count, items, list, shuffle, cumulativeIndex);
					cumulativeIndex += items[map.id].length; // Next iteration will have these many questions
				});
				if (total_items && list.length > total_items) {
					list = _.first(list, total_items);
				}
			}
    	}
		return list;
	},
	_addItems: function(id, count, items, list, shuffle, cumulativeIndex) {
		var set = items[id];
		if (_.isArray(set)) {
			var indexArr = [];
			for(var i = 0; i < set.length; i++)
				indexArr[i] = i;
			if(set.length < count)
				count = set.length;

			var pick = [];
			var qindex = 0;

			for(var i = 0; i < count; i++) {
				if(shuffle) {
					var randNum = _.random(0,indexArr.length-1);
					pick[i] = set[indexArr[randNum]];
					qindex = indexArr[randNum]; // When shuffling, the random index is the original index

					// Rearrange the index array so that no repeat happens
					indexArr[randNum] = indexArr[indexArr.length - 1];
					indexArr.splice(indexArr.length - 1, 1);
				} else {
					pick[i] = set[indexArr[i]];
					qindex = i; // When not shuffling, the iterator is the index
				}

				// Set the qindex value on the item
				pick[i].qindex = (cumulativeIndex + qindex + 1);
			}
			list = _.union(list, pick);
		}
		return list;
	}
}
