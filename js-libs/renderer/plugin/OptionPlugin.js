var OptionPlugin = Plugin.extend({
    _type: 'option',
    _isContainer: false,
    _render: false,
    _index: -1,
    _model: undefined,
    _value: undefined,
    _answer: undefined,
    _multiple: false,
    _mapedTo: undefined,
    _uniqueId: undefined,
    _modelValue: undefined,
    initPlugin: function(data) {
        this._model = undefined;
        this._value = undefined;
        this._answer = undefined;
        this._index = -1;
        this._uniqueId = _.uniqueId('opt_');

        var model = data.option;
        var value = undefined;

        if (data.multiple)
            this._multiple = data.multiple;

        if (this._parent._controller && model) {
            this._model = model;
            var controller = this._parent._controller;
            value = controller.getModelValue(model);
            this._index = parseInt(model.substring(model.indexOf('[') + 1, model.length - 1));
            var varName = (this._data['var'] ? this._data['var'] : 'option');
            this._stage._templateVars[varName] = this._parent._data.model + "." + model;
            this._modelValue = this._stage.getModelValue(this._parent._data.model + '.' + model);
        }
        if (value && _.isFinite(this._index) && this._index > -1) {
            this._self = new createjs.Container();
            var dims = this.relativeDims();
            this._self.x = dims.x;
            this._self.y = dims.y;
            this._self.origX = dims.x;
            this._self.origY = dims.y;
            this._self.width = dims.w;
            this._self.height = dims.h;
            var hit = new createjs.Shape();
            hit.graphics.beginFill("#000").r(0, 0, dims.w, dims.h);
            this._self.hitArea = hit;
            this._value = value.value;
            this.setOptionIndex(data);
            this.initShadow(data);
            var innerECML = this.getInnerECML();
            if (!_.isEmpty(innerECML)) {
                this.renderInnerECML();
            } else if (value.value.type == 'image') {
                this.renderImage(value.value);
            } else if (value.value.type == 'text') {
                this.renderText(value.value);
            }

            if (this._parent._type == 'mcq') {
                this.renderMCQOption();
            } else if (this._parent._type == 'mtf') {
                this.renderMTFOption(value);
            }
            this.resolveModelValue(this._data);
            this._render = true;
        }
    },
    renderMCQOption: function() {
        var controller = this._parent._controller;
        var itemId = controller.getModelValue("identifier");
        this._parent._options.push(this);
        this._self.cursor = 'pointer';
        var instance = this;
        if(this._modelValue.selected === true) {
          var val = instance._parent.selectOption(instance);
          Overlay.isReadyToEvaluate(true);
        }
        this._self.on('click', function(event) {
            Overlay.isReadyToEvaluate(true);
            var eventData = {};
            var val = instance._parent.selectOption(instance);
            var data = {
                type: event.type,
                x: event.stageX,
                y: event.stageY,
                choice_id: instance._value.resindex,
                itemId: itemId,
                res: [{
                    "option": instance._value.resvalue
                }],
                state: val ? 'SELECTED' : 'UNSELECTED',
                optionTag: "MCQ"
            }
            EventManager.processAppTelemetry({}, 'CHOOSE', instance, data);
        });        
    },
    renderMTFOption: function(value) {
        var enableDrag = false;
        var dragPos = {};
        var dragItem = {};
        var controller = this._parent._controller;
        var itemId = controller.getModelValue("identifier");
        if (_.isFinite(value.index)) {
            this._index = value.index;
            this._parent._lhs_options.push(this);
        } else {
            this._parent._rhs_options.push(this);
            enableDrag = true;
        }
        if (enableDrag) {
            var instance = this;
            var asset = this._self;
            asset.cursor = 'pointer';

            asset.on("mousedown", function(evt) {
                this.parent.addChild(this);
                this.offset = {
                    x: this.x - evt.stageX,
                    y: this.y - evt.stageY
                };
                dragItem = instance._value.resvalue;
                dragPos = {
                    x: evt.stageX,
                    y: evt.stageY
                };
                var data = {
                    type: evt.type,
                    x: evt.stageX,
                    y: evt.stageY,
                    drag_id: instance._value.resvalue,
                    itemId: itemId
                }
                EventManager.processAppTelemetry({}, 'DRAG', instance, data);
            });
            asset.on("pressmove", function(evt) {
                this.x = evt.stageX + this.offset.x;
                this.y = evt.stageY + this.offset.y;

                instance.addShadow();

                Renderer.update = true;
            });
            asset.on("pressup", function(evt) {
                var snapTo;
                if (instance._parent._force === true) {
                    snapTo = instance._parent.getLhsOption(value.answer);
                } else {
                    snapTo = instance._parent._lhs_options;
                }

                var plugin;
                var dims;
                var snapSuccess = false;
                if (_.isArray(snapTo)) {
                    for (var i = 0; i < snapTo.length; i++) {
                        if (snapSuccess) {
                            break;
                        } else {
                            plugin = snapTo[i];
                            dims = plugin._dimensions;
                            var xFactor = parseFloat(this.width * (50 / 100));
                            var yFactor = parseFloat(this.height * (50 / 100));
                            var x = dims.x - xFactor,
                                y = dims.y - yFactor,
                                maxX = dims.x + dims.w + xFactor,
                                maxY = dims.y + dims.h + yFactor;
                            if (this.x >= x && (this.x + this.width) <= maxX) {
                                if (this.y >= y && (this.y + this.height) <= maxY) {
                                    this._mapedTo = snapTo[i];
                                    snapSuccess = true;
                                    Overlay.isReadyToEvaluate(true);
                                }
                            }
                        }
                    }
                } else if (snapTo) {
                    plugin = snapTo;
                    dims = plugin._dimensions;
                    var xFactor = parseFloat(this.width * (50 / 100));
                    var yFactor = parseFloat(this.height * (50 / 100));
                    var x = dims.x - xFactor,
                        y = dims.y - yFactor,
                        maxX = dims.x + dims.w + xFactor,
                        maxY = dims.y + dims.h + yFactor;
                    if (this.x >= x && (this.x + this.width) <= maxX) {
                        if (this.y >= y && (this.y + this.height) <= maxY) {
                            snapSuccess = true;
                            Overlay.isReadyToEvaluate(true);
                        }
                    }
                }

                var drop_id = (snapSuccess ? plugin._id : '');
                var drop_idx = (snapSuccess ? plugin._index : '');
                var drop_rsv = (snapSuccess ? plugin._value.resvalue : '');
                var drag_rsv = instance._value.resvalue;

                if (!snapSuccess) {
                    this.x = this.origX;
                    this.y = this.origY;
                    if (_.isArray(snapTo)) {
                        for (var i = 0; i < snapTo.length; i++) {
                            var lhsQues = snapTo[i];
                            if(lhsQues._answer){
                                if (lhsQues._answer._uniqueId == instance._uniqueId) {
                                    lhsQues._answer = undefined;
                                    // instance._parent.setAnswer(instance, undefined);
                                    instance._parent.setAnswerMapping(instance, undefined);
                                    break;
                                }
                            }
                        }
                    }
                    //instance._parent._lhs_options[instance._currIndex]._answer = undefined;
                } else {

                    var flag = true;
                    // If multiple attribute of option tag is true.
                    if (plugin._multiple)
                        flag = false;
                    // If there is an existing answer, nudge it out
                    if (plugin._answer && flag) {
                        var existing = plugin._answer;
                        // existing._parent.setAnswer(existing);
                        existing._parent.setAnswerMapping(existing, undefined);

                        existing._self.x = existing._self.origX;
                        existing._self.y = existing._self.origY;
                    }

                    // Set the current answer as accepted
                    if (!_.isUndefined(plugin._data.snapX)) {
                        this.x = dims.x + (dims.w * plugin._data.snapX / 100);
                    }
                    if (!_.isUndefined(plugin._data.snapY)) {
                        this.y = dims.y + (dims.h * (plugin._data.snapY/100));
                    }

                    // instance._parent.setAnswer(instance, plugin._index);
                    instance._parent.setAnswerMapping(instance, plugin);


                    // Remember the answer so that on overwrite, we can clear it
                    if (_.isArray(snapTo)) {
                        for (var i = 0; i < snapTo.length; i++) {
                            var rhsOption = snapTo[i];
                            if (rhsOption._answer == instance)
                                rhsOption._answer = undefined;
                        }
                    } else if (snapTo) {
                        if (snapTo._answer == instance)
                            snapTo._answer = undefined;
                    }
                    plugin._answer = instance;
                }

                 if(!(("undefined" != typeof drop_idx) && ("" !== drop_idx))) {
                    // instance._parent.setAnswer(instance, undefined);
                    instance._parent.setAnswerMapping(instance, undefined);
                 }

                instance.removeShadow();
                var data = {
                    type: evt.type,
                    x: evt.stageX,
                    y: evt.stageY,
                    choice_id: instance._value.resindex,
                    itemId: itemId,
                    drop_id: drop_id,
                    drop_idx: drop_idx,
                    pos: [{x: evt.stageX, y: evt.stageY}, dragPos],
                    res: [{
                        "rhs" : drag_rsv
                    },{
                        "lhs" : drop_rsv
                    }],
                    state: (("undefined" != typeof drop_idx) && ("" !== drop_idx)) ? "SELECTED" : "UNSELECTED",
                    optionTag: "MTF"
                }

                EventManager.processAppTelemetry({}, 'DROP', instance, data);
                Renderer.update = true;
            });
            
        }
       
    },
    renderImage: function(value) {
        var data = {};
        data.asset = value.asset;
        var padx = this._data.padX || 0;
        var pady = this._data.padY || 0;
        data.x = padx;
        data.y = pady;
        data.w = 100 - (2 * padx);
        data.h = 100 - (2 * pady);

        if (value.count) {
            data.count = value.count;
            data.type = "gridLayout";
            PluginManager.invoke('placeholder', data, this, this._stage, this._theme);
        } else {
            PluginManager.invoke('image', data, this, this._stage, this._theme);
        }

        this._data.asset = value.asset;
    },
    renderText: function(data) {
        data.$t = data.asset;
        var padx = this._data.padX || 0;
        var pady = this._data.padY || 0;
        data.x = padx;
        data.y = pady;
        data.w = 100 - (2 * padx);
        data.h = 100 - (2 * pady);
        data.fontsize = (data.fontsize) ? data.fontsize: 200;
        var align = (this._data.align ? this._data.align.toLowerCase() : 'center');
        var valign = (this._data.valign ? this._data.valign.toLowerCase() : 'middle');

        data.align = align;
        data.valign = valign;

        PluginManager.invoke('text', data, this, this._stage, this._theme);
        this._data.asset = data.asset;
    },
    initShadow: function(data) {

        var highlightColor = this._data.highlight || '#E89241';
        var shadowColor = this._data.shadowColor || '#cccccc';
        var shadowData = {
            x: 0,
            y: 0,
            w: 100,
            h: 100,
            type: 'roundrect',
            fill: highlightColor,
            visible: false,
            opacity: (this._data.opacity || 1)
        };
        this._self.shadow = PluginManager.invoke('shape', shadowData, this, this._stage, this._theme);

        var offsetX = this._data.offsetX || 0;
        var offsetY = this._data.offsetY || 0;
        var blur = this._data.blur || 2;
        this._self.shadow._self.shadow = new createjs.Shadow(shadowColor, offsetX, offsetY, blur);
    },
    setOptionIndex: function(data) {
        data = JSON.stringify(data);
        data = data.replace(new RegExp('\\$current', 'g'), this._index);
        data = JSON.parse(data);
        this._data = data;
    },
    renderInnerECML: function() {
        var innerECML = this.getInnerECML();
        if (!_.isEmpty(innerECML)) {
            var data = {};
            var padx = this._data.padX || 0;
            var pady = this._data.padY || 0;
            data.x = padx;
            data.y = pady;
            data.w = 100 - (2 * padx);
            data.h = 100 - (2 * pady);
            Object.assign(data, innerECML);
            PluginManager.invoke('g', data, this, this._stage, this._theme);
        }
    },
    resolveModelValue: function(data) {
        var instance = this;
        var updateAction = function(action) {
            if (action.asset_model) {
                var model = action.asset_model;
                var val = instance._stage.getModelValue(model);
                action.asset = val;
                delete action.asset_model;
            }
        }
        var updateEvent = function(evt) {
            if(_.isArray(evt.action)) {
                evt.action.forEach(function(action) {
                    updateAction(action);
                });
            } else if(evt.action) {
                updateAction(evt.action);
            }
        }
        var events = undefined;
        if(data.events) {
            if (_.isArray(data.events)) {
                events = [];
                data.events.forEach(function(e) {
                    events.push.apply(events, e.event);
                });
            } else {
                events = data.events.event
            }
        } else {
            events = data.event;
        }
        if(_.isArray(events)) {
            events.forEach(function(e) {
                updateEvent(e);
            });
        } else if(events) {
            updateEvent(events);
        }
    }
});
PluginManager.registerPlugin('option', OptionPlugin);
