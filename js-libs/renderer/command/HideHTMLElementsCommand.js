var HideHTMLElementsCommand = Command.extend({
	_name: 'HIDEHTMLELEMENTS',
	_isPluginAction: false,
	invoke: function(action) {
		CommandManager.displayAllHtmlElements(false);
	}
});
CommandManager.registerCommand('HIDEHTMLELEMENTS', HideHTMLElementsCommand);