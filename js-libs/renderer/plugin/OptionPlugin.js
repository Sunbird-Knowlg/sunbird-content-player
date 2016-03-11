var OptionPlugin = Plugin.extend({
    _type: 'option',
    _isContainer: false,
    _render: false,
    _index: -1,
    _model: undefined,
    _value: undefined,
    _answer: undefined,
    _multiple: false,
    initPlugin: function(data) {
        this._model = undefined;
        this._value = undefined;
        this._answer = undefined;
        this._index = -1;

        var model = data.option;
        var value = undefined;

        if (data.multiple)
            this._multiple = data.multiple;

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
            this.setOptionIndex(data);

            if (value.value.type == 'image') {
                this.renderImage(value.value);
                if (this._parent._type == 'mcq') {
                    this.renderMCQOption();
                } else if (this._parent._type == 'mtf') {
                    this.renderMTFOption(value);
                }
            } else if (value.value.type == 'text') {
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
        var controller = this._parent._controller;
        var itemId = controller.getModelValue("identifier");
        this._parent._options.push(this);
        this._self.cursor = 'pointer';
        var instance = this;
        this._self.on('click', function(event) {
            var eventData = {};
            var val = instance._parent.selectOption(instance);
            var data = {
                type: event.type,
                x: event.stageX,
                y: event.stageY,
                choice_id: instance._value.asset,
                itemId: itemId,
                res: [{
                    "option": instance._value.asset
                }],
                state: (val ? 'SELECTED' : 'UNSELECTED'),
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
                dragItem = instance._value.asset;
                dragPos = {
                    x: evt.stageX,
                    y: evt.stageY
                };
                var data = {
                    type: evt.type,
                    x: evt.stageX,
                    y: evt.stageY,
                    drag_id: instance._value.asset,
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
                                    snapSuccess = true;
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

                    var flag = true;
                    // If multiple attribute of option tag is true.
                    if (plugin._multiple)
                        flag = false;
                    // If there is an existing answer, nudge it out
                    if (plugin._answer && flag) {
                        var existing = plugin._answer;
                        existing._parent.setAnswer(existing);
                        existing._self.x = existing._self.origX;
                        existing._self.y = existing._self.origY;
                    }

                    // Set the current answer as accepted
                    if (plugin._data.snapX) {
                        this.x = dims.x + (dims.w * plugin._data.snapX / 100);
                    }
                    if (plugin._data.snapY) {
                        this.y = dims.y + (dims.w * plugin._data.snapY / 100);
                    }
                    instance._parent.setAnswer(instance, plugin._index);

                    // Remember the answer so that on overwrite, we can clear it
                    plugin._answer = instance;
                }

                instance.removeShadow();

                var data = {
                        type: evt.type,
                        x: evt.stageX,
                        y: evt.stageY,
                        choice_id: instance._value.asset,
                        itemId: itemId,
                        drop_id: drop_id,
                        drop_idx: drop_idx,
                        pos: [{x: evt.stageX, y: evt.stageY}, dragPos],
                        res: [{
                            dragItem: drop_idx
                        }],
                        state: drop_idx ? "SELECTED" : "UNSELECTED",
                        optionTag: "MTF"
                    }
                    // data.res[dragItem] = drop_idx;
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

        this.initShadow(data);

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

        var align = (this._data.align ? this._data.align.toLowerCase() : 'center');
        var valign = (this._data.valign ? this._data.valign.toLowerCase() : 'middle');

        data.align = align;
        data.valign = valign;

        this.initShadow(data);

        PluginManager.invoke('text', data, this, this._stage, this._theme);
        this._data.asset = data.asset;
        this._render = true;
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
    }
});
PluginManager.registerPlugin('option', OptionPlugin);