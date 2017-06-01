CommandManager = {
    commandMap: {},
    registerCommand: function(id, command) {
        CommandManager.commandMap[id] = command;
    },
    handle: function(action) {
        try {
            action.stageInstanceId = _.clone(Renderer.theme._currentScene._stageInstanceId);
            if (action.delay) {
                TimerManager.start(action);
            } else {
                var c, cId = '';
                if (this._canHandle(action)) {
                    this._setAnimationAsCommand(action); // We can deprecate this in future.
                    this._setActionAsset(action);
                    if (_.isString(action.command)) cId = action.command.toUpperCase();
                    var command = CommandManager.commandMap[cId];
                    if (command) {
                        c = new command(action);
                    } else {
                        console.warn("No command registered with name: ", cId);
                    }
                } else {
                    console.info("action ev-if failed. So, it is not called.");
                }
            }
        } catch (e) {
           EkstepRendererAPI.logErrorEvent(e, {'type': 'asset', 'action': action.command, 'asset': action.asset, 'objectId': action.id }); 
            _.isUndefined(action) ? showToaster('error', 'Command failed') : showToaster('error', action.command + ': Command failed');
            console.warn(action + "Failed due to", e);
        }
    },
    // We can deprecate this in future. Once all the animation actions used as command we can remove this.
    _setAnimationAsCommand: function(action) {
        if (action.type === 'animation') {
            action.type = 'command';
            action.command = 'ANIMATE';
        }
    },
    _setDataAttributes: function(action) {
        var dataAttributes = {};
        var keys = _.keys(action);
        keys.forEach(function(key) {
            var lowerKey = key.toLowerCase();
            if (lowerKey.substring(0, 5) == "data-") {
                dataAttributes[lowerKey.replace("data-", "")] = action[key];
            }
        });
        action.dataAttributes = dataAttributes;
        action.stageId = Renderer.theme._currentStage;
    },
    _setActionAsset: function(action) {
        var plugin = PluginManager.getPluginObject(action.pluginId);
        var stage = plugin._stage;
        if (!stage || stage == null) {
            stage = plugin;
        }
        if (stage && stage._type === 'stage') {
            if (action.param) {
                action.value = stage.getParam(action.param) || '';
            }
            if (action.asset || action.asset_param || action.asset_model) {
                if (action.asset_param) {
                    action.asset = stage.getParam(action.asset_param) || '';
                } else if (action.asset_model) {
                    action.asset = stage.getModelValue(action.asset_model) || '';
                }
            } else {
                action.asset = plugin._id;
            }
        }
    },
    _canHandle: function(action) {
        var handle = true;
        var plugin = PluginManager.getPluginObject(action.pluginId);
        // Conditional evaluation for handle action.
        if (action['ev-if']) {
            var expr = action['ev-if'].trim();
            if (!(expr.substring(0, 2) == "${")) expr = "${" + expr;
            if (!(expr.substring(expr.length - 1, expr.length) == "}")) expr = expr + "}"
            handle = plugin.evaluateExpr(expr);
        }
        return handle;
    },
    displayAllHtmlElements: function(visibility) {
        var elements = jQuery('#' + Renderer.divIds.gameArea).children();
        elements.each(function() {
            //If child element is not canvas item, then hide it
            if (!(jQuery(this).is("canvas"))) {
                if (visibility) {
                    jQuery(this).show();
                } else {
                    jQuery(this).hide();
                }

            }
        });
    }
}