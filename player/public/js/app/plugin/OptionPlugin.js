var OptionPlugin = Plugin.extend({
    _type: 'option',
    _isContainer: false,
    _render: false,
    _index: -1,
    _model: undefined,
    _value: undefined,

    initPlugin: function(data) {
        
        this._model = undefined;
        this._value = undefined;
        this._index = -1;

        var model = data.option;
        var value = undefined;

        if (this._parent._controller && model) {
            this._model = model;
            var controller = this._parent._controller;
            value = controller.getModelValue(model);
            this._index = parseInt(model.substring(model.indexOf('[') + 1, model.length - 1));
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

            if (value.value.type == 'image') {
                this.renderImage(value.value);
                if (this._parent._type == 'mcq') {
                    this.renderMCQOption();
                } else if (this._parent._type == 'mtf') {
                    this.renderMTFOption(value);
                }
            } else if(value.value.type == 'text') {
                this.renderText(value.value);
                if (this._parent._type == 'mcq') {
                    this.renderMCQOption();
                } else if (this._parent._type == 'mtf') {
                    this.renderMTFOption(value);
                }
            }
        }
    },
    renderMCQOption: function() {
        this._parent._options.push(this);
        this._self.cursor = 'pointer';
        var instance = this;
        this._self.on('click', function(event) {
            var ext = {
                type: event.type,
                x: event.stageX,
                y: event.stageY,
                choice_id: instance._value.asset
            }
            
            var val = instance._parent.selectOption(instance);
            ext.state = (val ? 'selected' : 'unselected');
            EventManager.processAppTelemetry({}, 'CHOOSE', instance, ext);
        });

    },
    renderMTFOption: function(value) {
        var enableDrag = false;
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
                var ext = {
                    type: evt.type,
                    x: evt.stageX,
                    y: evt.stageY,
                    drag_id: instance._value.asset
                }
                EventManager.processAppTelemetry({}, 'DRAG', instance, ext);
            });
            asset.on("pressmove", function(evt) {
                this.x = evt.stageX + this.offset.x;
                this.y = evt.stageY + this.offset.y;
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
                    for (var i=0; i<snapTo.length; i++) {
                        if (snapSuccess) {
                            break;
                        } else {
                            plugin = snapTo[i];
                            dims = plugin._dimensions;
                            var xFactor = parseFloat(this.width * (50/100));
                            var yFactor = parseFloat(this.height * (50/100));
                            var x = dims.x - xFactor,
                                y = dims.y - yFactor,
                                maxX = dims.x + dims.w + xFactor,
                                maxY = dims.y + dims.h + yFactor;
                            if (this.x >= x && (this.x + this.width) <= maxX) {
                                if (this.y >= y && (this.y + this.height) <= maxY) {
                                    snapSuccess = true;
                                }
                            }
                        }
                    }
                } else if (snapTo) {
                    plugin = snapTo;
                    dims = plugin._dimensions;
                    var xFactor = parseFloat(this.width * (50/100));
                    var yFactor = parseFloat(this.height * (50/100));
                    var x = dims.x - xFactor,
                        y = dims.y - yFactor,
                        maxX = dims.x + dims.w + xFactor,
                        maxY = dims.y + dims.h + yFactor;
                    if (this.x >= x && (this.x + this.width) <= maxX) {
                        if (this.y >= y && (this.y + this.height) <= maxY) {
                            snapSuccess = true;
                        }
                    }
                }

                var drop_id = (snapSuccess ? plugin._id : '');
                var drop_idx = (snapSuccess ? plugin._index : '');

                if (!snapSuccess) {
                    this.x = this.origX;
                    this.y = this.origY;
                    instance._parent.setAnswer(instance);
                } else {
                    if (plugin._data.snapX) {
                        this.x = dims.x + (dims.w * plugin._data.snapX / 100);
                    }
                    if (plugin._data.snapY) {
                        this.y = dims.y + (dims.w * plugin._data.snapY / 100);
                    }
                    instance._parent.setAnswer(instance, plugin._index);
                }
                var ext = {
                    type: evt.type,
                    x: evt.stageX,
                    y: evt.stageY,
                    drop_id: drop_id,
                    drop_idx: drop_idx
                }

                EventManager.processAppTelemetry({}, 'DROP', instance, ext);
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

        // var debugData = {x : data.x, y: data.y, w: data.w, h:data.h, type:'rect', stroke:'red'};
        // var debugData2 = {x : 0, y: 0, w: 100, h: 100, type:'rect', stroke:'green'};
        
        // PluginManager.invoke('shape', debugData, this, this._stage, this._theme);
        // PluginManager.invoke('shape', debugData2, this, this._stage, this._theme);

        PluginManager.invoke('image', data, this, this._stage, this._theme);
        this._data.asset = value.asset;
        this._render = true;
    },
    renderText: function(data) {
        data.$t = data.asset;
        var padx = this._data.padX || 0;
        var pady = this._data.padY || 0;
        data.x = padx;
        data.y = pady;
        data.w = 100 - (2 * padx);
        data.h = 100 - (2 * pady);

        var align  = (this._data.align ? this._data.align.toLowerCase() : 'center');
        var valign = (this._data.valign ? this._data.valign.toLowerCase() : 'middle');

        data.align = align;
        data.valign = valign;
        
        // var debugData = {x : data.x, y: data.y, w: data.w, h:data.h, type:'rect', stroke:'red'};
        // var debugData2 = {x : 0, y: 0, w: 100, h: 100, type:'rect', stroke:'green'};
        
        // PluginManager.invoke('shape', debugData, this, this._stage, this._theme);
        // PluginManager.invoke('shape', debugData2, this, this._stage, this._theme);

        PluginManager.invoke('text', data, this, this._stage, this._theme);
        this._data.asset = data.asset;
        this._render = true;
    }
});
PluginManager.registerPlugin('option', OptionPlugin);
