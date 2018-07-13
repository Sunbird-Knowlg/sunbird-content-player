var LayoutPlugin = Plugin.extend({
	_isContainer: true,
    _render: true,
	_cells: [],
	_cellsCount: 0,
    _iterateModel: undefined,
	initPlugin: function(data) {
        this._cells = [];
        this._cellsCount = 0;
		this._self = new createjs.Container();
		var dims = this.relativeDims();
        this._self.x = dims.x;
        this._self.y = dims.y;

        // var hit = new createjs.Shape();
        // hit.graphics.beginFill("#000").r(0, 0, dims.w, dims.h);
        // this._self.hitArea = hit;
        // If iterate is undefine, then we cant create a layout
        // "Iterate" is Mandatory property
        if(_.isUndefined(data.iterate) && _.isUndefined(data.count)) {
            console.warn("LayoutPlugin require iterate or count", data);
            return;
        }
        if ("undefined" != typeof data.count)
            this._cellsCount = data.count;
        var model = data.iterate;
        model = this._iterateModel = this.replaceExpressions(model);
    	var dataObjs = this._stage.getModelValue(model);
        if(dataObjs) {
            var length = dataObjs.length;
            this._cellsCount = (length < this._cellsCount || this._cellsCount == 0) ? length : this._cellsCount;
        }
    	this.generateLayout();
        this.renderLayout();

        // Disable events on the grid itself because these are copied over to children
        this._enableEvents = false;
        // delete this._data.events;
        // delete this._data.event;
	},
    generateLayout: function() {
    	PluginManager.addError('Subclasses of layout plugin should implement generateLayout()');
    },
    renderLayout: function() {
    	var instance = this;
    	var index = 0;
    	this._cells.forEach(function(data) {
            var cellECML = instance.getInnerECML();
            var cellEvents = instance.getCellEvents();
    		instance._stage._templateVars[instance._data['var']] = instance._iterateModel + "[" + index + "]";
    		instance._addCellAttributes(data);
            if(Object.assign)
    		  Object.assign(data, cellECML);
            var resolvedEvents = instance.resolveActionModelValues(cellEvents);
            if(Object.assign)
                Object.assign(data, resolvedEvents);
    		PluginManager.invoke('g', data, instance, instance._stage, instance._theme);

    		index++;
    	});
    },
    _addCellAttributes: function(data) {
		data.padX = this._data.padX || 0;
        data.padY = this._data.padY || 0;
        data.snapX = this._data.snapX;
        data.snapY = this._data.snapY;

        data.stroke = this._data.stroke;
        data['stroke-width'] = this._data['stroke-width'];
        data.events = this._data.events;
        data.event = this._data.event;

        if (this._data.shadow) {
            data.shadowColor = this._data.shadow;
        }
        if (this._data.highlight) {
            data.highlight = this._data._highlight;
        }
        if (_.isFinite(this._data.blur)) {
            data.blur = this._data.blur;
        }
        if (_.isFinite(this._data.offsetX)) {
            data.offsetX = this._data.offsetX;
        }
        if (_.isFinite(this._data.offsetY)) {
            data.offsetY = this._data.offsetY;
        }
        if(this._data.opacity)
            data.opacity = this._data.opacity;
    },
    getCellEvents: function() {
        var events = undefined;
        var instance = this;
        if(instance._data.events) {
            if (_.isArray(instance._data.events)) {
                events = [];
                instance._data.events.forEach(function(e) {
                    events.push.apply(events, e.event);
                });
            } else {
                events = instance._data.events.event;
            }
        } else {
            events = instance._data.event;
        }
        return events;
    },
    resolveActionModelValues: function(events) {
        var returnEvents = undefined;
        var instance = this;
        var updateAction = function(tempAction) {
            var action = _.clone(tempAction);
            if (action.asset_model) {
                var model = action.asset_model;
                var val = instance._stage.getModelValue(model);
                action.asset = val;
                delete action.asset_model;
            }
            if (action["ev-model"]) {
                var model = action["ev-model"];
                var val = instance._stage.getModelValue(model);
                action["value"] = val;
                action["param-value"] = val;
                delete action["ev-model"];
            }
            return action;
        }
        var updateEvent = function(evt) {
            var returnEvent = {"type" : evt.type};
            if(_.isArray(evt.action)) {
                returnEvent.action = [];
                evt.action.forEach(function(action) {
                    returnEvent.action.push(updateAction(action));
                });
            } else if(evt.action) {
                returnEvent.action = updateAction(evt.action);
            }
            return returnEvent;
        }

        if(_.isArray(events)) {
            returnEvents = {"events": [], "hitArea": true};
            events.forEach(function(e) {
                returnEvents.events.push(updateEvent(e));
            });
        } else if(events) {
            returnEvents = {"hitArea": true};
            returnEvents.event = updateEvent(events);
        }
        return returnEvents;
    }
});

