var ScribblePlugin = Plugin.extend({
    _type: 'scribble',
    _render: true,
    _actualStage: undefined,
    _container: undefined,
    _data: undefined,
    _oldPt: undefined,
    _oldMidPt: undefined,
    _shapePoint: undefined,
    _shapeEndPoint: undefined,
    initPlugin: function(data) {
        var instance = this;
        instance._data = data;
        instance._actualStage = Renderer.theme._self;
        var stroke = data.stroke || 1;
        var color = data.color || "#000";
        var background = data.bgcolor || "#fff"
        var dims = this.relativeDims();
        var container = new createjs.Container();
        var bgShape = new createjs.Shape();

        // addEventListener for container
        container.addEventListener("mousedown", instance.handleMouseDown.bind(instance), true);
        container.addEventListener("pressup", instance.handleMouseUp.bind(instance), true);
        createjs.Ticker.setFPS(50);

        paintBrush = new createjs.Shape();
        bgShape.graphics = new createjs.Graphics().beginFill(background).drawRect(dims.x, dims.y, dims.w, dims.h);
        container.addChild(bgShape);
        container.addChild(paintBrush);
        this._container = container;
        this._self = container;
    },       
    handleMouseDown: function(event) {
        if (!event.primary) {
            return;
        }
        paintBrush.graphics.setStrokeStyle(this._data.stroke || 1).beginStroke(this._data.color || "#000");
        this._oldPt = new createjs.Point(this._actualStage.mouseX, this._actualStage.mouseY);
        this._oldMidPt = this._oldPt.clone();
        this._container.addEventListener("pressmove", this.handleMouseMove.bind(this), true);
        var dims = this.relativeDims();
        var x = dims.x + dims.w - 5;
        var y = dims.y + dims.h - 5;
        this._shapeEndPoint = new createjs.Point(x, y);
        this._shapePoint = new createjs.Point(dims.x + 5, dims.y + 5);
    },
    handleMouseMove: function(event) {
        if (!event.primary) {
            return;
        }
        var mx = this._actualStage.mouseX;
        var my = this._actualStage.mouseY;
        if (((this._oldPt.x > this._shapePoint.x) && (this._oldPt.x < this._shapeEndPoint.x))  && ((this._oldPt.y > this._shapePoint.y) && (this._oldPt.y < this._shapeEndPoint.y))){
             paintBrush.graphics.lineTo( this._oldPt.x + 1 , this._oldPt.y + 1);
        }
        this._oldPt = new createjs.Point(mx, my);
        this._actualStage.update();
    },
    handleMouseUp: function(event) {
        if (!event.primary) {
            return;
        }
        this._container.removeEventListener("pressmove", this.handleMouseMove.bind(this), true);
    }

});
PluginManager.registerPlugin('scribble', ScribblePlugin);