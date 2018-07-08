/**
 * Plugin to create different shapes on canvas using createJS graphics object.
 * @class ShapePlugin
 * @extends EkstepRenderer.Plugin
 * @author Vinu Kumar V S <vinu.kumar@tarento.com>
 */
var ShapePlugin = Plugin.extend({
     
     /**
     * This explains the type of the plugin. 
     * @member {String} _type.
     * @memberof ShapePlugin
     */
    _type: 'shape',

    /**
     * This explains plugin is container OR not. 
     * @member {boolean} _isContainer
     * @memberof ShapePlugin
     */
    _isContainer: false,

    /**
     * This explains plugin should render on canvas OR not. 
     * @member {boolean} _render
     * @memberof ShapePlugin
     */
    _render: true,

    /**
    *   Invoked by framework when plugin instance created/renderered on stage.
    *   Use this plugin to create different shapes like Square, Circle, Rectangle, Polygon, Star etc..
    *   @param data {object} data is input object for the shape plugin.
    *   @memberof ShapePlugin
    *   @override
    */
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
        if(data['strokeWidth']) {
          // Content-Editor issue fix for storkeWidth 
          data['stroke-width'] = data['strokeWidth'];
        }

        if(data['stroke-width']) {
            graphics.setStrokeStyle(data['stroke-width']);
        }
        // Radius for rounded rectangle
        var radius = data.radius || 10;
        data.type = data.type ? data.type.toLowerCase() : 'rect';

        switch(data.type) {
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
    		default:
                this.drawPolygon(data, dims, graphics);
    	}
        // This is required to have border stroke(thick) to have proper close at the end
        // reference: http://stackoverflow.com/questions/26191634/easeljs-triangle-stroke
        graphics.cp(); 

        this._self.x = dims.x;
        this._self.y = dims.y;
        if(!_.isUndefined(data.opacity))
            this._self.alpha = data.opacity;
    },
    drawBorder : function(){

    },
    drawPolygon: function(data, dims, graphics) {

        var points = this.getPoints(data);

        if (!points) {
            console.log("Unsupported shape");
            return;
        }

        var end = points[points.length - 1];
        var x = dims.w * (end.x || 0) / 100;
        var y = dims.h * (end.y || 0) / 100;

        graphics.moveTo(x, y);

        points.forEach(function(point) {
            x = dims.w * (point.x || 0) / 100;
            y = dims.h * (point.y || 0) / 100;
            graphics.lineTo(x, y);
        });
    },

    getPoints: function(data) {
        var shape = data.type;
        var sides = data.sides;
        var corners = data.corners;

        // Check which shape
        if (shape != 'trapezium') {
            if (sides) {
                shape = sides + "polygon";
            }
            else if (corners) {
                shape = corners + "star";
            }
        }

        var points;

        // Check if shape is supported
        if(this.shapes.hasOwnProperty(shape)) {
            points = this.shapes[shape];

        }
        // If it is not a built-in, then expect points array from config data
        else if (data.config.__cdata) {
            try {
                var config = JSON.parse(data.config.__cdata);
                points = config.points;
            }
            catch(err) {
                console.log('Points array not available');
            }
        }

        return points;
    },

    shapes: {

        // Star shapes
        "4star" : [{"x":100,"y":50},{"x":62.7,"y":62.7},{"x":50,"y":100},{"x":37.3,"y":62.7},{"x":0,"y":50},{"x":37.3,"y":37.3},{"x":50,"y":0},{"x":62.7,"y":37.3}],
        "5star" : [{"x":50,"y":0},{"x":60.9,"y":35},{"x":100,"y":35},{"x":67.6,"y":60},{"x":79.4,"y":100},{"x":50,"y":72},{"x":20.6,"y":100},{"x":32.4,"y":60},{"x":0,"y":35},{"x":39.1,"y":35}],
        "6star" : [{"x":50,"y":100},{"x":35,"y":76},{"x":0,"y":75},{"x":20,"y":50},{"x":0,"y":25},{"x":35,"y":24},{"x":50,"y":0},{"x":65,"y":24},{"x":100,"y":25},{"x":80,"y":50},{"x":100,"y":75},{"x":65,"y":76}],
        "7star" : [{"x":100,"y":59.8},{"x":74,"y":68},{"x":72.9,"y":100},{"x":50.8,"y":80},{"x":29.6,"y":100},{"x":27.1,"y":69.4},{"x":0,"y":62.5},{"x":20.6,"y":44.1},{"x":10,"y":19.9},{"x":36.2,"y":23.3},{"x":48.6,"y":0},{"x":62.3,"y":22.6},{"x":88.2,"y":17.7},{"x":79,"y":42.5}],
        "8star" : [{"x":100,"y":50},{"x":82.3,"y":63.4},{"x":85.4,"y":85.4},{"x":63.4,"y":82.3},{"x":50,"y":100},{"x":36.6,"y":82.3},{"x":14.6,"y":85.4},{"x":17.7,"y":63.4},{"x":0,"y":50},{"x":17.7,"y":36.6},{"x":14.6,"y":14.6},{"x":36.6,"y":17.7},{"x":50,"y":0},{"x":63.4,"y":17.7},{"x":85.4,"y":14.6},{"x":82.3,"y":36.6}],
        "9star" : [{"x":100,"y":40.2},{"x":84.6,"y":55.3},{"x":93.8,"y":74},{"x":73.1,"y":76.3},{"x":68.1,"y":100},{"x":50.8,"y":85},{"x":33.9,"y":100},{"x":28.1,"y":77.3},{"x":7.3,"y":75.9},{"x":15.7,"y":56.8},{"x":0,"y":42.4},{"x":19.3,"y":33.2},{"x":17,"y":12.4},{"x":37.3,"y":17.4},{"x":48.9,"y":0},{"x":61.3,"y":16.9},{"x":81.3,"y":11},{"x":79.9,"y":31.8}],
        "10star" : [{"x":100,"y":65.5},{"x":78.3,"y":70.6},{"x":79.4,"y":90.5},{"x":60.8,"y":83.3},{"x":50,"y":100},{"x":39.2,"y":83.3},{"x":20.6,"y":90.5},{"x":21.7,"y":70.6},{"x":0,"y":65.5},{"x":15,"y":50},{"x":0,"y":34.5},{"x":21.7,"y":29.4},{"x":20.6,"y":9.5},{"x":39.2,"y":16.7},{"x":50,"y":0},{"x":60.8,"y":16.7},{"x":79.4,"y":9.5},{"x":78.3,"y":29.4},{"x":100,"y":34.5},{"x":85,"y":50}],

        // Regular polygons
        "3polygon" : [{"x":50,"y":0},{"x":100,"y":100},{"x":0,"y":100}],
        "4polygon" : [{"x":50,"y":0},{"x":100,"y":50},{"x":50,"y":100},{"x":0,"y":50}],
        "5polygon" : [{"x":50,"y":0},{"x":100,"y":34.5},{"x":79.4,"y":100},{"x":20.6,"y":100},{"x":0,"y":34.5}],
        "6polygon" : [{"x":100,"y":50},{"x":75,"y":100},{"x":25,"y":100},{"x":0,"y":50},{"x":25,"y":0},{"x":75,"y":0}],
        "7polygon" : [{"x":50,"y":0},{"x":89.1,"y":18.8},{"x":100,"y":61.1},{"x":71.7,"y":100},{"x":28.3,"y":100},{"x":0,"y":61.1},{"x":10.9,"y":18.8}],
        "8polygon" : [{"x":100,"y":69.1},{"x":69.1,"y":100},{"x":30.9,"y":100},{"x":0,"y":69.1},{"x":0,"y":30.9},{"x":30.9,"y":0},{"x":69.1,"y":0},{"x":100,"y":30.9}],
        "9polygon" : [{"x":50,"y":0},{"x":82.1,"y":11.7},{"x":100,"y":41.3},{"x":93.3,"y":75},{"x":67.1,"y":100},{"x":32.9,"y":100},{"x":6.7,"y":75},{"x":0,"y":41.3},{"x":17.9,"y":11.7}],
        "10polygon": [{"x":100,"y":50},{"x":90.5,"y":79.4},{"x":65.5,"y":100},{"x":34.5,"y":100},{"x":9.5,"y":79.4},{"x":0,"y":50},{"x":9.5,"y":20.6},{"x":34.5,"y":0},{"x":65.5,"y":0},{"x":90.5,"y":20.6}],

        // Other convex polygons
        "trapezium" : [{"x":25,"y":0},{"x":75,"y":0},{"x":100,"y":100},{"x":0,"y":100}]
    }
});
PluginManager.registerPlugin('shape', ShapePlugin);
