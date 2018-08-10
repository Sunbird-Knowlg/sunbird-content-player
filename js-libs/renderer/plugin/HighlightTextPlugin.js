/*Wiki link for ref
https://github.com/ekstep/Common-Design/wiki/ECML-How-to-Guide#highlighting-text*/

var HighlightTextPlugin = HTMLPlugin.extend({
    _type: 'htext',
    _wordIds: [],
    _timings: [],
    _isPlaying: false,
    _isPaused: false,
    _wordClass: "gc-ht-word",
    _listener: undefined,
    _audioInstance: undefined,
    _position: {
        previous: 0,
        current: 0,
        pause: 0
    },
    _time: 0,
    initPlugin: function(data) {
        this._cleanupHighlight();
        var font;
        var dims = this.relativeDims();
        if (!data.id) data.id = this._data.id = _.uniqueId('plugin');
        if (!data.highlight) data.highlight = this._data.highlight = "#DDDDDD";
        var div = document.createElement('div');
        div.id = data.id;
        div.style.width = dims.w + 'px';
        div.style.height = dims.h + 'px';
        div.style.top = "-1000px"; // position off-screen initially
        div.style.position = 'relative';
        var fontsize = "1.2em";
        if (data.fontsize) {
            fontsize = data.fontsize;
        }
        if (isFinite(fontsize)) {
            if (data.w) {
                var exp = parseFloat(PluginManager.defaultResWidth * data.w / 100);
                var cw = this._parent.dimensions().w;
                var width = parseFloat(cw * data.w / 100);
                var scale = parseFloat(width / exp);
                fontsize = parseFloat(fontsize * scale);
                fontsize = fontsize + 'px';
            }
        }
        /*Style properties to handle highlighting text
        syntax of text-shadow: h_offset v-offset Blur shadow_color;*/
        var h_offset = data.offsetX ? data.offsetX : 0;
        var v_offset = data.offsetY ? data.offsetY : 0;
        var Blur = data.blur ? data.blur : 1;
        var shadow_color = data.shadow ? data.shadow : "#ccc"; 
        var shadow = h_offset + "px" + " " + v_offset + "px" + " " + Blur + "px" + " " + shadow_color;      
        if (/\d/.test(data.font) == true) {
            // fontsize and font-family are required for the font attribute.
            font=data.font;
            div.style["font"] = data.font;
        }else {
            font=fontsize + " " + data.font
            div.style["font-family"] = data.font;
            div.style["font-size"] = fontsize;
        }
        if (data.weight) { // weight can handle both font-weight and font-style.
            div.style["font"] = data.weight + " " + font;
        }
        div.style["outline"] = data.outline ? data.outline : 0;
        /*handling shadow with px */
        div.style["line-height"] = data.lineHeight ? data.lineHeight : "1.2em";
        div.style["text-align"] = data.align ? data.align : "left";
        div.style["vertical-align"] = data.valign ? data.valign : "top";
        div.style["color"] = data.color ? data.color : "black";
        div.style["textShadow"] = shadow;       

        var parentDiv = document.getElementById(Renderer.divIds.gameArea);

        parentDiv.insertBefore(div, parentDiv.childNodes[0]);
        if (data.timings) {
            this._timings = _.map(data.timings.split(","), function(time) {
                return Number(Number(time).toFixed(0));
            });
        }
        var text = this._getText();
        var htmlText = this._tokenize(text);

        jQuery("#" + data.id).append(htmlText);
        this._div = div;
        this._self = new createjs.DOMElement(div);
        this._self.x = dims.x;
        this._self.y = dims.y + 1000;
        this._registerEvents(data.id);
    },
    getWordId: function(index) {
        return this._stage._data.id + "-text-" + this._data.id + "-word-" + index;
    },
    play: function(action) {
        var instance = this;
        var audio = action.audio || this._data.audio;
        if (this._timings.length > 0) {
            if (this._isPaused) {
                instance._resume(action);
            } else {
                this._isPlaying = true;
                var prevPosition = 0;
                if (audio) {
                    var soundInstance = this._playAudio(audio);
                    soundInstance.on("complete", function() {
                        instance._cleanupHighlight();
                        if ("undefined" != typeof action.cb)
                            action.cb({"status":"success"});
                    });
                    this._listener = function() {
                        if((_.isUndefined(instance._audioInstance)) || (_.isUndefined(instance._audioInstance.object))) {
                            //removing previous interupted audio instance listener
                            //Has to remove this event listener properly, This will create performance issue
                            if (instance._listener) {
                                createjs.Ticker.removeEventListener("tick", instance._listener);
                                return;
                            }
                        }
                        instance._position.current = Number(instance._audioInstance.object.position.toFixed(0));
                        instance._highlight();
                        instance._position.previous = instance._position.current;
                    }
                } else {
                    this._time = Date.now();
                     this._listener = function() {
                        if (!instance._isPaused) {
                            instance._position.current = Date.now() - instance._time + instance._position.pause;
                            instance._highlight();
                            if (instance._position.previous > instance._timings[instance._timings.length -1] + 500) {
                                instance._cleanupHighlight();
                                if ("undefined" != typeof action.cb)
                                    action.cb({"status":"success"});
                            }
                            instance._position.previous = instance._position.current;
                        }
                    }
                }
                createjs.Ticker.addEventListener("tick", instance._listener);
            }
        } else {
            console.info("No timing data to play highlight text:", this._id);
        }
    },
    pause: function(action) {
        if (this._isPlaying) {
            var instance = this;
            var audio = action.audio || this._data.audio;
            if (this._timings.length > 0) {
                instance._isPaused = true;
                if (audio) {
                    AudioManager.pause({asset: audio}, instance._audioInstance);
                } else {
                    instance._position.pause = instance._position.current;
                }
            } else {
                console.info("No timing data:", this._id);
            }
        } else {
            console.info("highlight is not playing to pause:", this._id);
        }
    },
    togglePlay: function(action) {
        if (this._isPlaying && !this._isPaused) {
            this.pause(action);
            if ("undefined" != typeof action.cb)
                action.cb({"status":"success"});
        } else {
            this.play(action);
        }
    },
    _resume: function(action) {
        var instance = this;
        var audio = action.audio || this._data.audio;
        if (this._timings.length > 0) {
            instance._isPaused = false;
            if (audio) {
                AudioManager.play({asset: audio, stageId: instance._stage._id}, instance._audioInstance);
            } else {
                instance._time = Date.now();
            }
        } else {
            console.info("No timing data:", this._id);
        }
    },
    stop: function(action) {
        var instance = this;
        var audio = action.audio || this._data.audio;
        if (this._timings.length > 0) {
            if (audio) {
                AudioManager.stop({asset: audio, stageId: instance._stage._id});
            }
            instance._cleanupHighlight();
        } else {
            console.info("No timing data:", this._id);
        }
    },
    _playAudio: function(audio) {
        var instance = this;
        instance._data.audio = audio;
        instance._audioInstance = AudioManager.play({asset: audio, stageId: this._stage._id});
        return instance._audioInstance.object;
    },
    _highlight: function() {
        var instance = this;
      
        if (instance._position.current && instance._isPlaying) {
            var matches = _.filter(instance._timings, function(time) {
                return (time >= instance._position.previous && time < instance._position.current);
            });
         
            if (matches.length >0) {
                _.each(matches, function(match) {
                    var index = instance._timings.indexOf(match);
                    var wordId = instance.getWordId(index);
                    instance._removeHighlight();
                    instance._addHighlight(wordId);
                });
            };
        }
    },
    _cleanupHighlight: function() {
        this._isPlaying = false;
        this._removeHighlight();
        if (this._listener) createjs.Ticker.removeEventListener("tick", this._listener);
        if (this._audioInstance) this._audioInstance = undefined;
        this._time = 0;
        this._position = {
            previous: 0,
            current: 0,
            pause: 0
        };
    },
    _removeHighlight: function() {
        jQuery("."+this._wordClass).css({"background-color": "none", "padding": "0px" });
    },
    _addHighlight: function(id) {
        jQuery("#"+id).css({"background": this._data.highlight});
        
    },
    _tokenize: function(text) {

        var htmlText = "";
        Replaced_text = text.replace(/(\r\n|\n|\r)/gm, " </br> "); // Replaces the Brek-line(/n or /r) with </br> tag
        var words = Replaced_text.split(' ');
        this._wordIds = [];
        var index = 0;
        for (i = 0; i < words.length; i++) {
            if (words[i] === '') {
                htmlText += "<span class=\"gc-ht-word\">&nbsp;</span> ";
            } else if (words[i] === '</br>') {
                htmlText += "<span class=\"gc-ht-word\"></br></span> ";
            } else {
                var wordId = this.getWordId(index);
                this._wordIds.push(wordId);
                htmlText += "<span id=\"" + wordId + "\" class=\"gc-ht-word\">" + words[i] + "</span> ";
                index++;
            }

        }
        return htmlText;
    },
    _getText: function() {
        var textStr = '';
        if (this._data.$t || this._data.__text) {
            textStr = (this._data.$t || this._data.__text);
        } else if (this._data.model) {
            textStr = (this._stage.getModelValue(this._data.model) || '');
        } else if (this._data.param) {
            textStr = (this.getParam(this._data.param.trim()) || '');
        }
        return textStr;
    },
    _registerEvents: function(id) {
        var instance = this;
        jQuery('#'+id).children().each(function () {
            var data = jQuery(this).data();
            if (data && data.event) {
                jQuery(this).click(function(event) {
                    event.preventDefault();
                    instance._triggerEvent(data.event);
                    console.info("Triggered event ",data.event);
                });
            }
        });
    },
    _triggerEvent: function(event) {
        var plugin = PluginManager.getPluginObject(Renderer.theme._currentStage);
        event = new createjs.Event(event);
        plugin.dispatchEvent(event);
    }
});
PluginManager.registerPlugin('htext', HighlightTextPlugin);