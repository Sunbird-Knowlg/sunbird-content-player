EventManager = {
    registerEvents: function(plugin, data) {
        try {
            var events = undefined;
            if (data.events) {
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
            if (_.isArray(events)) {
                events.forEach(function(e) {
                    EventManager.registerEvent(e, plugin);
                });
            } else if (events) {
                EventManager.registerEvent(events, plugin);
            }
        } catch (e) {
            showToaster('error', 'Event fails to register');
            console.warn("Event fails to register due to", e);
        }
    },
    registerEvent: function(evt, plugin) {
        var register = true;
        // Conditional evaluation to register event.
        if (evt['ev-if']) {
            var expr = evt['ev-if'].trim();
            var modelExpr = expr = plugin.replaceExpressions(expr);
            if (!(expr.substring(0, 2) == "${")) expr = "${" + expr;
            if (!(expr.substring(expr.length - 1, expr.length) == "}")) expr = expr + "}"
            register = plugin.evaluateExpr(expr);
            if (typeof register == "undefined" && plugin._stage) {
                register = plugin._stage.getModelValue(modelExpr);
            }
        }
        if (register) {
            plugin.events.push(evt.type);
            if (_.contains(createjs.DisplayObject._MOUSE_EVENTS, evt.type)) {
                var element = plugin._self;
                if (element) {
                    if (plugin instanceof HTMLPlugin || plugin._div) {
                        element = plugin._self.htmlElement;
                        element.style.cursor = 'pointer';
                    } else {
                        element.cursor = 'pointer';
                    }
                    element.addEventListener(evt.type, function(event) {
                        EventManager.processMouseTelemetry(evt, event, plugin);
                        EventManager.handleActions(evt, plugin);
                    });
                }
            } else {
                plugin.on(evt.type, function() {
                    EventManager.handleActions(evt, plugin);
                });
            }
        }
    },
    dispatchEvent: function(id, event) {
        var plugin = PluginManager.getPluginObject(id);
        if (_.contains(createjs.DisplayObject._MOUSE_EVENTS, event)) {
            plugin._self.dispatchEvent(event);
        } else {
            plugin.dispatchEvent(event);
        }
    },
    handleActions: function(evt, plugin) {
        try {
            var disableTelemetry = false;
            EventManager._setPluginId(evt.action, plugin._id);
            var unmuteActions = _.clone(evt.action);
            evt.action = EventManager._chainActions(evt.action, unmuteActions);
            if (evt.type !== 'click') disableTelemetry = true;
            if (_.isArray(evt.action)) {
                var data = JSON.parse(JSON.stringify(evt.action));
                delete evt.action;
                evt.action = data;
                evt.action.forEach(function(a) {
                    // Disabling the OE_INTREACT Telemetry if event type is other than click
                    a.disableTelemetry = disableTelemetry;
                    var action = _.clone(a);
                    action.pluginId = plugin._id;
                    CommandManager.handle(action);
                });
            } else if (evt.action) {
                evt.action.disableTelemetry = disableTelemetry;
                var action = _.clone(evt.action)
                action.pluginId = plugin._id;
                CommandManager.handle(action);
            }
        } catch (e) {
            _.isUndefined(evt) ? showToaster('error', 'Event failed') : showToaster('error', evt.type + ': Event failed');
            EkstepRendererAPI.logErrorEvent(e, {'type': 'asset', 'objectId': evt.action.id, 'asset': evt.action.asset, "action": evt.action ? evt.action.command : ''});
             console.warn("Event fails to handle due to", e);
        }
    },
    _setPluginId: function(actions, pluginId) {
        if (_.isArray(actions)) {
            actions.forEach(function(action) {
                action.pluginId = pluginId;
            });
        } else if (actions) {
            actions.pluginId = pluginId;
        }
    },
    _chainActions: function(actions, unmuteActions) {
        if (_.isArray(actions)) {
            var filter = _.filter(actions, function(action) {
                return (action.with || action.after);
            });
            if (filter.length > 0) {
                var action = filter[0];
                var parentId = action.after || action.with;
                var p = _.findWhere(unmuteActions, {
                    "id": parentId
                });
                if (p) {
                    if (action.after) {
                        if (!p.children) p.children = [];
                        p.children.push(action);
                    }
                    if (action.with) {
                        if (!p.siblings) p.siblings = [];
                        p.siblings.push(action);
                    }
                    actions = _.without(actions, action);
                } else {
                    console.warn("Didn't find action with id:", parentId);
                }
                delete action.after;
                delete action.with;
                return EventManager._chainActions(actions, unmuteActions);
            } else {
                return actions;
            }
        } else {
            return actions;
        }
    },
    processMouseTelemetry: function(action, event, plugin) {
        var data = {
            type: event.type,
            x: event.stageX,
            y: event.stageY
        }
        var type = TelemetryService.getMouseEventMapping()[action.type];
        EventManager.processAppTelemetry(action, type, plugin, data);
    },
    processAppTelemetry: function(action, type, plugin, data) {
        if (!plugin) {
            plugin = {
                _data: {
                    id: '',
                    asset: ''
                }
            };
        }
        if (!action) {
            action = {
                disableTelemetry: true
            };
        }
        if (action.disableTelemetry !== true) {
            if (type) {
                var id = plugin._data.id || plugin._data.asset;
                if (!id) {
                    id = action.asset;
                }
                if (!id) {
                    var actionObj = action.action;
                    if (_.isArray(actionObj) && actionObj.length >= 1) {
                        actionObj = actionObj[0];
                    }
                    if (actionObj)
                        id = actionObj.asset;
                }
                if (!id) {
                    id = plugin._type || 'none';
                }
                if (id) {
                    var stageId = Renderer.theme ? Renderer.theme._currentStage : ""
                    if (data)
                        data.stageId = stageId;
                    TelemetryService.interact(type, id, type, data ? data : {
                        stageId: stageId
                    });
                }
            }
        }
    }
}