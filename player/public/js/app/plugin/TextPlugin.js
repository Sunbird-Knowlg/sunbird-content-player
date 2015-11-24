var TextPlugin = Plugin.extend({
    _type: 'text',
    _isContainer: false,
    _render: true,
    _tween:undefined,
    _tweenObj:undefined,
    _text: undefined,
    _complete: false,
    initPlugin: function(data) {
        var instance = this;
        var fontsize = data.fontsize || 20;
        var dims = this.relativeDims();
        if (data.w) {
            var exp = parseFloat(PluginManager.defaultResWidth * data.w / 100);
            var cw = this._parent.dimensions().w;
            var width = parseFloat(cw * data.w / 100);
            var scale = parseFloat(width / exp);
            fontsize = parseFloat(fontsize * scale);
        }
        var font = fontsize + 'px ' + data.font || 'Arial';
        if (data.weight) {
            font = data.weight + ' ' + font;
        }        
        var textStr = ''; var text='';
        if (data.$t || data.__text) {
            textStr = (data.$t || data.__text);
        } else if (data.model) {
            textStr = (this._stage.getModelValue(data.model) || '');
        } else if (data.param) {
            textStr = (this._stage.params[data.param.trim()] || '');
        }
        if(_.isString(textStr)) 
            text = textStr;
        else
            text = textStr[0].text;
        var align  = (data.align ? data.align.toLowerCase() : 'left');
        var valign = (data.valign ? data.valign.toLowerCase() : 'top');
        var lineHeight = (data.lineHeight ? data.lineHeight : 30);
        var outline = (data.outline ? data.outline : 0);

        // Add text to the TxtJs object.
        var text = new txt.Text( { 
            text:text ? text : "",
            font: 'opensans',
            align:txt.Align.TOP_LEFT,
            lineHeight:data.lineHeight,
            fillColor:data.color ? data.color : "black",
            width:dims.w,
            height:dims.h,
            size:fontsize,
            x:dims.x,
            y:dims.y,
        } ); 
        if(_.isObject(textStr) || data.timing) {
            var highlight;
            if(textStr[2])
                highlight = textStr[2].highlight;
            var graphics = new createjs.Graphics().beginFill(highlight ? highlight : "yellow").drawRect(0, 0, 100, 100);
            var shape = new createjs.Shape(graphics);
            shape.alpha = 0.3;
            text.highlight = shape;
            text.highlight.visible = false;
            instance._theme._self.addChild(shape);
            
        }
        this._text = text;

        text.complete = function() {
            if( _.isObject(textStr) || data.timing) {
                var timing = [];
                if(data.timing) {
                    var tempTiming = JSON.parse(data.timing.__cdata);
                    console.log(tempTiming);
                    _.each(tempTiming.timing, function(obj){
                        timing.push(obj[1] * 1000);
                    });
                }         
                if(_.isObject(textStr[1])) {
                    _.each(textStr[1].timing, function(obj){
                        timing.push(obj[1] * 1000);
                    });
                }
                console.log(timing)
                var fn = '(function() {return function(text, instance){';
                fn += 'instance._tweenObj = createjs.Tween.get(text.highlight, {loop:false}); instance._tweenObj.wait(' + timing[0];
                var timingTemp = timing[0];
                var widthTemp = 0;
                var y = this.words[1].parent.y, x = undefined, lineChange=false;
                fn += ').to({x:' + this.x + ', y:'+ (this.words[0].parent.y + text.y) + ', scaleY:'+(this.words[0].measuredHeight/100) + ', scaleX: ' + (this.words[0].measuredWidth/100) +'}).set({visible: true})';
                for(var i = 1; i < this.words.length; i++) {
                    if(y == this.words[i].parent.y) {
                        lineChange = false;
                        x = text.words[i-1].measuredWidth + text.x + widthTemp + 1; 
                    }   else {
                        x = this.x;
                        lineChange = true;
                    }                                              
                    fn += '.wait(' + (timing[i] - timingTemp) + ').to({x:' + (x) + ',y:'+ (this.words[i].parent.y + text.y) + ', scaleY:'+ (this.words[i].measuredHeight/100) + ', scaleX: ' + ((this.words[i].measuredWidth/100)) +'}).set({visible: true})';
                    timingTemp = timing[i];
                    if(lineChange == false) 
                        widthTemp += text.words[i-1].measuredWidth;
                    else
                        widthTemp = 0;
                    y = this.words[i].parent.y;                        
                }
                fn += '.wait(1000).set({visible: false}).call(function(){instance._complete = true}).addEventListener("change", function(event) {Renderer.update = true;});';
                fn += '}})()';
                this._tween = fn;                                ;
            }
        }

        this._self = text;
    },
    start: function () { 
        this._tween = eval(this._text._tween);
        this._tween.apply(null, [this._text, this]);
    },
    pause: function() {
        this._text.highlight.visible = false;
        this._tweenObj.setPaused(true);
    },
    resume: function() {
        this._text.highlight.visible = true;
        this._tweenObj.setPaused(false);
    },
    toggle: function() {
        if(this._complete) {
            this.start();
            this._complete = false;
        }
        else if(this._text.highlight.visible) {
            this._text.highlight.visible = false;
            this._tweenObj.setPaused(true);
        }
        else {
            this._text.highlight.visible = true;
            this._tweenObj.setPaused(false);
        }
    }
});
PluginManager.registerPlugin('text', TextPlugin);