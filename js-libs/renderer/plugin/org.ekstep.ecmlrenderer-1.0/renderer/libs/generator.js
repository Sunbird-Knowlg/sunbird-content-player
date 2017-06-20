var DataGenerator = {
    _loaderMap: {},
    loadData: function(baseDir, type, id, controller, dataType) {
        var folder = type;
        dataType = dataType ? dataType.toLowerCase() : "json";
        var filename = id + "." + dataType, fullPath = baseDir + "/" + folder + "/" + filename;
        jQuery.getJSON(fullPath, function(data) {
            DataGenerator._onLoad(data, controller);
        }).fail(function() {
            console.error("error while fetching json: " + fullPath);
        });
    },
    _onLoad: function(data, controller) {
        controller.onLoad(data);
    }
}, ItemDataGenerator = {
    _loaderMap: {},
    loadData: function(baseDir, type, id, controller) {
        var folder = type, filename = id + ".json", fullPath = baseDir + "/" + folder + "/" + filename;
        jQuery.getJSON(fullPath, function(data) {
            ItemDataGenerator._onLoad(data, controller);
        }).fail(function() {
            console.error("error while fetching json: " + fullPath);
        });
    },
    _onLoad: function(data, controller) {
        var model = ItemDataGenerator._getItems(data);
        data = _.omit(data, "items"), controller.onLoad(data, model);
    },
    _getItems: function(data) {
        var list = [];
        if (_.isObject(data)) {
            var total_items = data.total_items, item_sets = data.item_sets, items = data.items, shuffle = !0, optionShuffle = !0;
            if (void 0 !== data.shuffle && (shuffle = data.shuffle), void 0 !== data.optionShuffle && (optionShuffle = data.optionShuffle), 
            item_sets && items) {
                var cumulativeIndex = 0;
                item_sets.forEach(function(map, setidx) {
                    items[map.id] && (list = ItemDataGenerator._addItems(map.id, map.count, items, list, shuffle, optionShuffle, cumulativeIndex), 
                    cumulativeIndex += items[map.id].length);
                }), total_items && list.length > total_items && (list = _.first(list, total_items));
            }
        }
        return list;
    },
    _addItems: function(id, count, items, list, shuffle, optionShuffle, cumulativeIndex) {
        var set = items[id];
        if (_.isArray(set)) {
            for (var indexArr = [], i = 0; i < set.length; i++) indexArr[i] = i;
            set.length < count && (count = set.length);
            for (var pick = [], qindex = 0, i = 0; i < count; i++) {
                if (shuffle) {
                    var randNum = _.random(0, indexArr.length - 1);
                    pick[i] = set[indexArr[randNum]], qindex = indexArr[randNum], indexArr[randNum] = indexArr[indexArr.length - 1], 
                    indexArr.splice(indexArr.length - 1, 1);
                } else pick[i] = set[indexArr[i]], qindex = i;
                var item = pick[i];
                "mcq" == item.type.toLowerCase() || "mmcq" == item.type.toLowerCase() ? (optionShuffle && (item.options = _.shuffle(item.options)), 
                ItemDataGenerator._registerResValues(item.options)) : "mtf" == item.type.toLowerCase() && (optionShuffle && (item.rhs_options = _.shuffle(item.rhs_options)), 
                ItemDataGenerator._registerResValues(item.lhs_options), ItemDataGenerator._registerResValues(item.rhs_options)), 
                pick[i].qindex = cumulativeIndex + qindex + 1;
            }
            list = _.union(list, pick);
        }
        return list;
    },
    _registerResValues: function(options) {
        _.each(options, function(option, index) {
            void 0 === option.value.resvalue && (option.value.resvalue = option.value.asset || option.value.text || option.value.image || option.value.count || option.value.audio || "option" + index), 
            option.value.resindex = index;
        });
    }
};