var ItemDataGenerator = {
    _loaderMap: {},
    loadData: function(baseDir, type, id, controller) {
        var folder = type;
        var filename = id + '.json';
        var fullPath = baseDir + "/" + folder + "/" + filename;
        jQuery.getJSON(fullPath, function(data) {
            ItemDataGenerator._onLoad(data, controller);
        }).fail(function() {
            console.error("error while fetching json: " + fullPath);
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
            var optionShuffle = true;

            if (typeof data.shuffle != 'undefined') shuffle = data.shuffle;
            if (typeof data.optionShuffle != 'undefined') optionShuffle = data.optionShuffle;

            if (item_sets && items) {
                var cumulativeIndex = 0; // How many questions have been there before this set
                item_sets.forEach(function(map, setidx) {
                    if (items[map.id]) {
                        list = ItemDataGenerator._addItems(map.id, map.count, items, list, shuffle, optionShuffle, cumulativeIndex);
                        cumulativeIndex += items[map.id].length;
                    }
                    // Next iteration will have these many questions
                });
                if (total_items && list.length > total_items) {
                    list = _.first(list, total_items);
                }
            }
        }
        return list;
    },
    _addItems: function(id, count, items, list, shuffle, optionShuffle, cumulativeIndex) {
        var set = items[id];
        if (_.isArray(set)) {
            var indexArr = [];
            for (var i = 0; i < set.length; i++) indexArr[i] = i;
            if (set.length < count) count = set.length;
            var pick = [];
            var qindex = 0;
            for (var i = 0; i < count; i++) {
                if (shuffle) {
                    var randNum = _.random(0, indexArr.length - 1);
                    pick[i] = set[indexArr[randNum]];
                    qindex = indexArr[randNum]; // When shuffling, the random index is the original index
                    // Rearrange the index array so that no repeat happens
                    indexArr[randNum] = indexArr[indexArr.length - 1];
                    indexArr.splice(indexArr.length - 1, 1);
                } else {
                    pick[i] = set[indexArr[i]];
                    qindex = i; // When not shuffling, the iterator is the index
                }

                // Shuffle the options and check resvalues
                var item = pick[i];
                if (item.type.toLowerCase() == 'mcq' || item.type.toLowerCase() == 'mmcq') {

		            // Shuffles the options if given "optionShuffle": true
	                if (optionShuffle) item.options = _.shuffle(item.options);

	                // Register the res value for the options
                    ItemDataGenerator._registerResValues(item.options);

	            } else if (item.type.toLowerCase() == 'mtf') {

	                // Shuffles the options if given "optionShuffle": true
	                // When shuffling options, ONLY RHS should be shuffled
                    // If we also shuffle LHS, then the RHS answer mappings become incorred
                    // therefore we DO NOT SHUFFLE LHS OPTIONS

	                if (optionShuffle) item.rhs_options = _.shuffle(item.rhs_options);

	                // Register the res value for the options
	                ItemDataGenerator._registerResValues(item.lhs_options);
	                ItemDataGenerator._registerResValues(item.rhs_options);

	            }

                // Set the qindex value on the item
                pick[i].qindex = (cumulativeIndex + qindex + 1);
            }
            list = _.union(list, pick);
        }
        return list;
    },
    _registerResValues: function(options) {
        _.each(options, function(option, index) {

        	// Either option.resvalue is defined, or we take the value of asset, text or image in
        	// the following order of precedence
        	// resvalue > asset > text > count > image > audio

			/*if (typeof option.value.resvalue == 'undefined') option.value.resvalue = option.value.asset;
			if (typeof option.value.resvalue == 'undefined') option.value.resvalue = option.value.text;
			if (typeof option.value.resvalue == 'undefined') option.value.resvalue = option.value.count;
            if (typeof option.value.resvalue == 'undefined') option.value.resvalue = option.value.image;
            if (typeof option.value.resvalue == 'undefined') option.value.resvalue = option.value.audio;
            if (typeof option.value.resvalue == 'undefined') option.value.resvalue = 'option' + index;
*/           if(typeof option.value.resvalue == 'undefined'){
                option.value.resvalue = option.value.asset || option.value.text || option.value.image || option.value.count || option.value.audio || 'option' + index;  

            }
			option.value.resindex = index;
        });
    }
}
