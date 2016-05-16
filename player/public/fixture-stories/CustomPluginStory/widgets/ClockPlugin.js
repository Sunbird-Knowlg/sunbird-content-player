Plugin.extend({
	_type: 'clock',
    _isContainer: false,
    _render: true,
    initPlugin: function(data) {
    	var timeVal = data.time ? data.time.split(":") : [0,0];
    	var hr = timeVal[0];
    	var min = timeVal[1];
    	this._self = new createjs.Container();
		var dims = this.relativeDims();
        this._self.x = dims.x;
        this._self.y = dims.y;

    	var circle = Object.create(data);
    	circle.type = "circle";
    	circle.fill = "black";
    	PluginManager.invoke('shape', circle, this, this._stage, this._theme);

    	var smallHand = Object.create(data);
    	smallHand.id = _.unique("clockSmallHand");
    	smallHand.type = "rect";
    	smallHand.fill = "white";
    	smallHand.h = 5;
    	smallHand.w = data.w - 2*3;
    	PluginManager.invoke('shape', smallHand, this, this._stage, this._theme);
    	PluginManager.getPluginObject(smallHand.id)._self.rotation = (hr*30)-90;

    	var bigHand = Object.create(smallHand);
    	bigHand.w = data.w - 2;
    	bigHand.id = _.unique("clockBigHand");
    	PluginManager.invoke('shape', bigHand, this, this._stage, this._theme);
    	PluginManager.getPluginObject(bigHand.id)._self.rotation = (min*6)-90;
    }
});
