Plugin.extend({
    _type: 'cmcq',
    initPlugin: function(data) {
        //console.log(data)
        var itemValues = this._stage.getModelValue(data.model);
        this._self = new createjs.Container();
        var dims = this.relativeDims();
        this._self.x = dims.x;
        this._self.y = dims.y;

        if (itemValues.text && itemValues.image) {
            var itemText = Object.create({});
            itemText.id = _.unique("itemTextId");
            itemText.color = "#4c4c4c";
            itemText.align = "center";
            itemText.fontsize = "3vw";
            itemText.$t = itemValues.text;
            itemText.w = 80;
            itemText.x = 10;
            itemText.y = 78;
            itemText.h = 12;
            PluginManager.invoke('text', itemText, this, this._stage, this._theme);

            var itemImage = Object.create({});
            itemImage.id = _.unique("itemImageId");
            itemImage.align = "center";
            itemImage.stretch = "false";
            itemImage.asset = itemValues.image;
            itemImage.x = 10;
            itemImage.y = 5;
            itemImage.h = 65;
            if (itemValues.count && itemValues.count != 1) {
                var plcData = Object.create({});
                plcData.count = itemValues.count;
                plcData.asset = itemValues.image;
                plcData.type = "gridLayout";
                plcData.w = 95;
                plcData.x = 3;
                plcData.y = 2;
                plcData.h = 42;
                PluginManager.invoke('placeholder', plcData, this, this._stage, this._theme);
            } else {
                PluginManager.invoke('image', itemImage, this, this._stage, this._theme);
                
            }

        }

        if (itemValues.text && (!itemValues.image)) {
            var itemText = Object.create({});
            itemText.id = _.unique("itemTextId");
            itemText.align = "center";
            itemText.color = "#4c4c4c";
            itemText.valign = "middle";
            itemText.fontsize = "3vw";
            itemText.$t = itemValues.text;
            itemText.w = 80;
            itemText.lineHeight = 1.4;
            itemText.x = 10;
            itemText.y = 10;
            itemText.h = 80;
            PluginManager.invoke('text', itemText, this, this._stage, this._theme);
        }

        if (itemValues.image && (!itemValues.text)) {
            var itemImage = Object.create({});
            itemImage.id = _.unique("itemImageId");
            itemImage.align = "center";
            itemImage.valign = "middle";
            itemImage.stretch = "false";
            itemImage.asset = itemValues.image;
            itemImage.w = 80;
            // itemImage.h = 80;
            itemImage.x = 10;
            itemImage.y = 10;
            // console.log(itemValues.count)
            if (itemValues.count && itemValues.count != 1) {
                var plcData = Object.create({});
                plcData.count = itemValues.count;
                plcData.asset = itemValues.image;
                plcData.type = "gridLayout";
                plcData.w = 95;
                plcData.x = 5;
                plcData.y = 3;
                plcData.h = 50;
                PluginManager.invoke('placeholder', plcData, this, this._stage, this._theme);
            } else {
                PluginManager.invoke('image', itemImage, this, this._stage, this._theme);
            }
        }
    }
});
