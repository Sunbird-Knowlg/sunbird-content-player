var ScribblePlugin = Plugin.extend({
    _type: 'scribble',
    _render: true,
    _shape: undefined,
    initPlugin: function(data) {

        var stroke = data.stroke || 1;
        var dims = this.relativeDims();
        var color = data.color || "#000";
        var background = data.bgcolor || "#fff"
        var container = new createjs.Container();
        var shape = new createjs.Shape();

        // addEventListener for container
        container.addEventListener("mousedown", handleMouseDown);
        container.addEventListener("pressup", handleMouseUp);
        createjs.Ticker.setFPS(150);
        
        paintBrush = new createjs.Shape();
        shape.graphics = new createjs.Graphics().beginFill(background).drawRect(dims.x, dims.y, dims.w, dims.h);
        container.addChild(shape);
        container.addChild(paintBrush);
        this._self = container;

        function handleMouseDown(event) {
            if (!event.primary) {
                return;
            }
            stage = Renderer.theme._self;
            oldPt = new createjs.Point(stage.mouseX, stage.mouseY);
            oldMidPt = oldPt.clone();
            container.addEventListener("pressmove", handleMouseMove);
        }

        function handleMouseMove(event) {
            if (!event.primary) {
                return;
            }
            stage = Renderer.theme._self;
            var midPt = new createjs.Point(oldPt.x + stage.mouseX >> 1, oldPt.y + stage.mouseY >> 1);
            var x = dims.x + dims.w - 5;
            var y = dims.y + dims.h - 5;

            console.log("x : ", dims.w , y);

            if (midPt.x <= x && midPt.y < y) 
                paintBrush.graphics.setStrokeStyle(stroke, 'round', 'round').beginStroke(color).moveTo(midPt.x, midPt.y).curveTo(oldPt.x, oldPt.y, oldMidPt.x, oldMidPt.y);

            oldPt.x = stage.mouseX;
            oldPt.y = stage.mouseY;
            // this._oldPt = { x: , y: };
            // this._oldPt = {x: ,y:};
            oldMidPt.x = midPt.x;
            oldMidPt.y = midPt.y;
            stage.update();
        }

        function handleMouseUp(event) {
            if (!event.primary) {
                return;
            }
            container.removeEventListener("pressmove", handleMouseMove);
        }

    }
    // ,
    // _handleMouseDown: function(event) {
    //         if (!event.primary) {
    //             return;
    //         }
    //         stage = Renderer.theme._self;
    //         oldPt = new createjs.Point(stage.mouseX, stage.mouseY);
    //         oldMidPt = oldPt.clone();
    //         container.addEventListener("pressmove", handleMouseMove);
    //     }

});
PluginManager.registerPlugin('scribble', ScribblePlugin);