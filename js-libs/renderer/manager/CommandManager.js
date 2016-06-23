CommandManager = {
    commandMap: {},
    registerCommand: function(id, command) {
        CommandManager.commandMap[id] = command;
    },
    handle: function(action) {
        var c, cId = '';
        if (_.isString(action.command)) cId = (action.command).toUpperCase();
        var command = CommandManager.commandMap[cId];
        c = new command(action);
        return c;
    },
    _setDataAttributes: function(action) {
        var dataAttributes = {};
        var keys = _.keys(action);
        keys.forEach(function(key) {
            var lowerKey = key.toLowerCase();
            if (lowerKey.substring(0,5) == "data-") {
                dataAttributes[lowerKey.replace("data-","")] = action[key];
            }
        });
        action.dataAttributes = dataAttributes;
        action.stageId = Renderer.theme._currentStage;
    },
    displayAllHtmlElements: function(visibility) {
       var elements = jQuery('#'+Renderer.divIds.gameArea).children();
       elements.each(function(){
           //If child element is not canvas item, then hide it
           if(!(jQuery(this).is("canvas"))){
                if (visibility) {
                    jQuery(this).show();     
                } else {
                    jQuery(this).hide();
                }
               
           }
       });
   }
}
