var ScribblePlugin = Plugin.extend({
    _type: 'scribble',
    _render: true,
    _isContainer: true,
    _data: undefined,
    _oldPt: undefined,
    _oldMidPt: undefined,
    _startPoint: undefined,
    _endPoint: undefined,
    initPlugin: function(data) {
        this._data = data;
        var color = data.color || "#000";
        var background = data.fill || "#fff"
        var dims = this.relativeDims();
        this._self = new createjs.Container();
        this._self.x = dims.x;
        this._self.y = dims.y;

        // addEventListener for container
        this._self.on("mousedown", this.handleMouseDown.bind(this), true);

        createjs.Ticker.setFPS(50); // This is for smooth drawing of line while mouse move

        data.opacity = (data.opacity == "0" ? "0.01" : data.opacity); // if opacity is coming as 0% then make it 0.01%
        var shapeData = {"shape":{"type":"rect","x":0,"y":0,"w":100,"h":100}};
        if (data.fill) shapeData.shape.fill = data.fill;
        if (data.stroke) shapeData.shape.stroke = data.stroke;
        if (!_.isUndefined(data.opacity)) shapeData.shape.opacity = data.opacity;
        if (data["stroke-width"]) shapeData.shape["stroke-width"] = data["stroke-width"];
        if(data.rotate) shapeData.shape.rotate = data.rotate;
        this.invokeChildren(shapeData, this, this._stage, this._theme);

        // create paint brush
        this.paintBrush = new createjs.Shape();
        this.paintBrush.x = 0;
        this.paintBrush.y = 0;
        this._self.addChild(this.paintBrush);
    },
    setBounderies: function() {
        if (this._startPoint && this._endPoint)
            return;
        var dims = this.relativeDims();
        var startPoint = this._self.localToGlobal(0, 0);
        this._startPoint = new createjs.Point(startPoint.x + 5, startPoint.y + 5);
        var x = startPoint.x + dims.w - 5;
        var y = startPoint.y + dims.h - 5;
        this._endPoint = new createjs.Point(x, y);
    },
    handleMouseDown: function(event) {
        this.setBounderies();
        var mousePoint = {x: event.stageX, y: event.stageY};
        mousePoint = this._self.globalToLocal(mousePoint.x, mousePoint.y);
        this._oldPt = new createjs.Point(mousePoint.x, mousePoint.y);
        this._self.on("pressmove", this.handleMouseMove.bind(this), true);
        this._self.on("pressup", this.handleMouseUp.bind(this), true);
    },
    handleMouseMove: function(event) {
        /*if (event.pointerID == -1) {
            return false;
        }*/
        var mousePoint = {x: event.stageX, y: event.stageY};
        var thickness = this.isInt(this._data.thickness) ?  this._data.thickness : 3;
        if (((mousePoint.x > this._startPoint.x) && (mousePoint.x < this._endPoint.x)) && ((mousePoint.y > this._startPoint.y) && (mousePoint.y < this._endPoint.y))) {
            mousePoint = this._self.globalToLocal(mousePoint.x, mousePoint.y);
            this.paintBrush.graphics.setStrokeStyle(thickness, 'round').beginStroke(this._data.color || "#000");
            this.paintBrush.graphics.mt(this._oldPt.x, this._oldPt.y).lineTo(mousePoint.x , mousePoint.y);
            this._oldPt = new createjs.Point(mousePoint.x, mousePoint.y);
            Renderer.update = true;
        }
    },
    handleMouseUp: function(event) {
        this._self.off("pressmove", this.handleMouseMove);
        this._self.off("pressup", this.handleMouseUp);
    },
    clear: function(action) {
        this.paintBrush.graphics.clear();
        Renderer.update = true;
    },
    isInt : function(value) {
      var x = parseFloat(value);
      return !isNaN(value) && (x | 0) === x;
    },
    show: function(){
        this._self.visible = this._self.parent.visible = true;
        Renderer.update = true;
    },
    hide: function(){
        this._self.visible = this._self.parent.visible = false;
        Renderer.update = true;
    },
    toggleShow: function(){
        this._self.visible = this._self.parent.visible = !this._self.visible;
        Renderer.update = true;
    },
    drawBorder : function() {}
});
PluginManager.registerPlugin('scribble', ScribblePlugin);
