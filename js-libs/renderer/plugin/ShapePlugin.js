var ShapePlugin = Plugin.extend({
    _type: 'shape',
    _isContainer: false,
    _render: true,
    initPlugin: function(data) {
    	this._self = new createjs.Shape();
    	var graphics = this._self.graphics;
    	var dims = this.relativeDims();
		
        if(data.fill) {
			graphics.beginFill(data.fill);
		}
		
        if(data.stroke) {
			graphics.beginStroke(data.stroke);
		}

        if(data['stroke-width']) {
            graphics.setStrokeStyle(data['stroke-width']);
        }

        // Radius for rounded rectangle
        var radius = data.radius || 10;
        data.type = data.type ? 'rect' : data.type;
        switch(data.type.toLowerCase()) {
    		case 'rect':
    			graphics.dr(0, 0, dims.w, dims.h);
    			if(data.hitArea) {
		    		var hit = new createjs.Shape();
					hit.graphics.beginFill("#000").r(0, 0, dims.w, dims.h);
					this._self.hitArea = hit;
		    	}
    			break;
            case 'roundrect':
                graphics.drawRoundRect(0, 0, dims.w, dims.h, radius);
                if(data.hitArea) {
                    var hit = new createjs.Shape();
                    hit.graphics.beginFill("#000").r(0, 0, dims.w, dims.h);
                    this._self.hitArea = hit;
                }
                break;
    		case 'circle':
    			graphics.dc(0, 0, dims.r || dims.w);
    			if(data.hitArea) {
		    		var hit = new createjs.Shape();
					hit.graphics.beginFill("#000").dc(0, 0, dims.w);
					this._self.hitArea = hit;
		    	}
    			break;
            case 'ellipse':
                graphics.de(0, 0, dims.w, dims.h);
                if(data.hitArea) {
                    var hit = new createjs.Shape();
                    hit.graphics.beginFill("#000").r(0, 0, dims.w, dims.h);
                    this._self.hitArea = hit;
                }
                break;
    		default:
    	}
        this._self.x = dims.x;
        this._self.y = dims.y;
        if(data.rotate) {
            this._self.regX = dims.w/2;
            this._self.regY = dims.h/2;
            this._self.rotation = data.rotate;
        }
        if(data.opacity)
            this._self.alpha = data.opacity;
    },
    drawBorder : function(){

    }

});
PluginManager.registerPlugin('shape', ShapePlugin);