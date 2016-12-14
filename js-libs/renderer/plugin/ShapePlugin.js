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
        data.type = data.type ? data.type : 'rect';
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
                    hit.graphics.beginFill("#000").de(0, 0, dims.w, dims.h);
                    this._self.hitArea = hit;
                }
                break;
            case 'star':
                this.drawStar(5, dims, graphics, data.hitArea);
                break;
            case '6star':
                this.drawStar(6, dims, graphics, data.hitArea);
                break;
            case '7star':
                this.drawStar(7, dims, graphics, data.hitArea);
                break;
            case '8star':
                this.drawStar(8, dims, graphics, data.hitArea);
                break;
            case '9star':
                this.drawStar(9, dims, graphics, data.hitArea);
                break;
            case '10star':
                this.drawStar(10, dims, graphics, data.hitArea);
                break;
            case 'polygon':
                this.drawPolygon(5, dims, graphics, data.hitArea);
                break;
            case '6polygon':
                this.drawPolygon(6, dims, graphics, data.hitArea);
                break;
            case '7polygon':
                this.drawPolygon(7, dims, graphics, data.hitArea);
                break;
            case '8polygon':
                this.drawPolygon(8, dims, graphics, data.hitArea);
                break;
            case '9polygon':
                this.drawPolygon(9, dims, graphics, data.hitArea);
                break;
            case '10polygon':
                this.drawPolygon(10, dims, graphics, data.hitArea);
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

    },
    drawPolygon: function(numsides, dims, graphics, hitArea) {
        var r = (dims.w < dims.h ? dims.w : dims.h) / 2;
        var x = r;
        var y = r;
        graphics.drawPolyStar(x,y,r,numsides,0,0);
        if(hitArea) {
            var hit = new createjs.Shape();
            hit.graphics.beginFill("#000").drawPolyStar(x,y,r,numsides,0,0);
            this._self.hitArea = hit;
        }
    },
    drawStar: function(numsides, dims, graphics, hitArea) {
        var r = (dims.w < dims.h ? dims.w : dims.h) / 4;
        var x = 2*r;
        var y = 2*r;
        graphics.drawPolyStar(x,y,r,numsides,-1,0);
        if(hitArea) {
            var hit = new createjs.Shape();
            hit.graphics.beginFill("#000").drawPolyStar(x,y,r,numsides,-1,0);
            this._self.hitArea = hit;
        }
    }
});
PluginManager.registerPlugin('shape', ShapePlugin);
