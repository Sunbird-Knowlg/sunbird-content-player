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
        var bgShape = new createjs.Shape();

        // addEventListener for container
        this._self.addEventListener("mousedown", this.handleMouseDown.bind(this), true);

        this._self.addEventListener("pressup", this.handleMouseUp.bind(this), true);
        createjs.Ticker.setFPS(50);

        // create paint brush
        this.paintBrush = new createjs.Shape();
        this.paintBrush.x = 0;
        this.paintBrush.y = 0;
        this._self.addChild(this.paintBrush);

        bgShape.graphics = new createjs.Graphics().beginFill(background).drawRect(0, 0, dims.w, dims.h);
        bgShape.alpha = data.opacity || 1;
        this._self.addChild(bgShape);
        
        var shapeData = {"shape":{"type":"rect","x":0,"y":0,"w":100,"h":100}};
        if (data.fill) shapeData.shape.fill = data.fill;
        if (data.stroke) shapeData.shape.stroke = data.stroke;
        if (data["stroke-width"]) shapeData.shape["stroke-width"] = data["stroke-width"];
        this.invokeChildren(shapeData, this, this._stage, this._theme);
        this.setBounderies();
    },
    setBounderies: function() {
        var dims = this.relativeDims();
        var x = dims.x + dims.w - 5;
        var y = dims.y + dims.h - 5;
        this._endPoint = new createjs.Point(x, y);
        this._startPoint = new createjs.Point(dims.x + 5, dims.y + 5);
    },
    handleMouseDown: function(event) {
        if (!event.primary) {
            return;
        }
        var mousePoint = Renderer.theme.mousePoint();
        mousePoint = this._self.globalToLocal(mousePoint.x, mousePoint.y);
        this._oldPt = new createjs.Point(mousePoint.x, mousePoint.y);
        this._self.addEventListener("pressmove", this.handleMouseMove.bind(this), true);
    },
    handleMouseMove: function(event) {
        if (!event.primary) {
            return;
        }
        var mousePoint = Renderer.theme.mousePoint();
        mousePoint = this._self.globalToLocal(mousePoint.x, mousePoint.y);
        var thickness = this.isInt(this._data.thickness) ?  this._data.thickness : 3;
        if (((mousePoint.x > this._startPoint.x) && (mousePoint.x < this._endPoint.x)) && ((mousePoint.y > this._startPoint.y) && (mousePoint.y < this._endPoint.y))) {
            this.paintBrush.graphics.setStrokeStyle(thickness, 'round').beginStroke(this._data.color || "#000");
            this.paintBrush.graphics.mt(this._oldPt.x, this._oldPt.y).lineTo(mousePoint.x + 1, mousePoint.y + 1);
            this._oldPt = { x: mousePoint.x, y: mousePoint.y };
        }
        Renderer.update = true;
    },
    handleMouseUp: function(event) {
        if (!event.primary) {
            return;
        }
        this._self.removeEventListener("pressmove", this.handleMouseMove.bind(this), true);
    },
    clear: function() {
        this.paintBrush.graphics.clear();
        Renderer.update = true;
    },
    isInt : function(value) {
      var x = parseFloat(value);
      return !isNaN(value) && (x | 0) === x;
    },
    drawBorder : function() {}
});
PluginManager.registerPlugin('scribble', ScribblePlugin);