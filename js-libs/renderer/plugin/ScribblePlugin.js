var ScribblePlugin = Plugin.extend({
    _type: 'scribble',
    _render: true,
    _container: undefined,
    _data: undefined,
    _oldPt: undefined,
    _oldMidPt: undefined,
    _shapePoint: undefined,
    _shapeEndPoint: undefined,
    initPlugin: function(data) {
        this._data = data;
        var color = data.color || "#000";
        var background = data.fill || "#fff"
        var dims = this.relativeDims();
        var container = new createjs.Container();
        var bgShape = new createjs.Shape();

        // addEventListener for container
        container.addEventListener("mousedown", this.handleMouseDown.bind(this), true);
        container.addEventListener("pressup", this.handleMouseUp.bind(this), true);
        createjs.Ticker.setFPS(50);


        this.paintBrush = new createjs.Shape();
        bgShape.graphics = new createjs.Graphics().beginFill(background).drawRect(dims.x, dims.y, dims.w, dims.h);
        bgShape.alpha = data.opacity || 1;
        container.addChild(bgShape);
        container.addChild(this.paintBrush);
        this._self = container;
    },       
    handleMouseDown: function(event) {
        if (!event.primary) {
            return;
        }

        var mousePoint = Renderer.theme.mousePoint();
        this._oldPt = new createjs.Point(mousePoint.x, mousePoint.y);
        this._self.addEventListener("pressmove", this.handleMouseMove.bind(this), true);
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
        var mousePoint = Renderer.theme.mousePoint();
        if (((event.stageX > this._shapePoint.x) && (event.stageX < this._shapeEndPoint.x))  && ((event.stageY > this._shapePoint.y) && (event.stageY < this._shapeEndPoint.y))){
            this.paintBrush.graphics.setStrokeStyle(this._data.thickness || 3, 'round').beginStroke(this._data.color || "#000");

            if (((event.stageX > this._shapePoint.x) && (event.stageX < this._shapeEndPoint.x))  && ((event.stageY > this._shapePoint.y) && (event.stageY < this._shapeEndPoint.y))){
                this.paintBrush.graphics.mt(this._oldPt.x, this._oldPt.y).lineTo( mousePoint.x + 1 , mousePoint.y + 1);
                this._oldPt = {x: mousePoint.x, y:mousePoint.y};
            }
            
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
    }
});
PluginManager.registerPlugin('scribble', ScribblePlugin);