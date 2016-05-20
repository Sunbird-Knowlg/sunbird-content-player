var HighlightTextPlugin = Plugin.extend({
    _type: 'htext',
    _isContainer: false,
    _render: true,
    _div: undefined,
    _wordIds: [],
    _timings: [],
    _isPlaying: false,
    _wordClass: "gc-ht-word",
    _listener: undefined,
    _audioInstance: undefined,
    initPlugin: function(data) {
        var dims = this.relativeDims();
        if (!data.id) data.id = this._data.id = _.uniqueId('plugin');
        if (!data.highlight) data.highlight = this._data.highlight = "#DDDDDD";
        // if (!data["highlight-color"]) data["highlight-color"] = this._data["highlight-color"] = "#000";
        var div = document.createElement('div');
        div.id = data.id;
        div.style.width = dims.w + 'px';
        div.style.height = dims.h + 'px';
        div.style.position = 'absolute';
        if (data.fontsize) {
            div.style["font-size"] = data.fontsize;
        } else {
            div.style["font-size"] = "1.2em";
        }

        var instance = this;
        var parentDiv = document.getElementById(Renderer.divIds.gameArea);
        parentDiv.insertBefore(div, parentDiv.childNodes[0]);

        if (data.timings) {
            this._timings = _.map(data.timings.split(","), function(time) {
                return Number(Number(time).toFixed(0));
            });
            console.info("timings:", this._timings);
        }
        var text = this._getText();
        var htmlText = this._tokenize(text);

        jQuery("#" + data.id).append(htmlText);
        this._div = div;
        this._self = new createjs.DOMElement(div);
        this._self.x = dims.x;
        this._self.y = dims.y;
        this._registerEvents(data.id);
    },
    getWordId: function(index) {
        return this._stage._data.id + "-text-" + this._data.id + "-word-" + index;
    },
    play: function(action) {
        var instance = this;
        var audio = action.audio || this._data.audio;
        if (this._timings.length > 0) {
            this._isPlaying = true;
            if (audio) {
                this._data.audio = audio;
                if (instance._audioInstance) {
                    instance.resume(action);
                } else {
                    instance._audioInstance = AudioManager.play({asset: audio, stageId: this._stage._id});
                    var prevPosition = 0;
                    this._listener = function() {
                        var position = Number(instance._audioInstance.object.position.toFixed(0));
                        if (position && instance._isPlaying) {
                            var matches = _.filter(instance._timings, function(time) {
                                return (time >= prevPosition && time < position);
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
                        prevPosition = position;
                    };
                    createjs.Ticker.addEventListener("tick", instance._listener);
                    instance._audioInstance.object.on("complete", function() {
                        instance._cleanupHighlight();
                    });
                }
            } else {
                // TODO: By calculating the delta time.
            }
        } else {
            console.info("No timing data to play highlight text:", this._id);
        }
    },
    pause: function(action) {
        var instance = this;
        var audio = action.audio || this._data.audio;
        if (this._timings.length > 0) {
            if (audio) {
                instance._isPlaying = false;
                AudioManager.pause({asset: audio}, instance._audioInstance);
            } else {
                // TODO: By calculating the delta time.
            }
        } else {
            console.info("No timing data:", this._id);
        }

    },
    togglePlay: function(action) {
        if (this._isPlaying) {
            this.pause(action);
        } else {
            this.play(action);
        }
    },
    resume: function(action) {
        var instance = this;
        var audio = action.audio || this._data.audio;
        if (this._timings.length > 0) {
            if (audio) {
                instance._isPlaying = true;
                AudioManager.play({asset: audio, stageId: instance._stage._id}, instance._audioInstance);
            } else {
                // TODO: By calculating the delta time.
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
                instance._cleanupHighlight();
            } else {
                // TODO: By calculating the delta time.
            }
        } else {
            console.info("No timing data:", this._id);
        }
    },
    _cleanupHighlight: function() {
        this._isPlaying = false;
        this._removeHighlight();
        if (this._listener) createjs.Ticker.removeEventListener("tick", this._listener);
        if (this._audioInstance) this._audioInstance = undefined;
    },
    _removeHighlight: function() {
        jQuery("."+this._wordClass).css({"background-color": "none", "padding": "0px", "font-weight": "normal"});
    },
    _addHighlight: function(id) {
        jQuery("#"+id).css({"background": this._data.highlight});
    },
    _tokenize: function(text) {
        var htmlText = "";
        var words = text.split(' ');
        this._wordIds = [];
        for(i=0;i<words.length;i++) {
            var wordId = this.getWordId(i);
            this._wordIds.push(wordId);
            htmlText += "<span id=\""+ wordId +"\" class=\"gc-ht-word\">" + words[i] + "</span> ";
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