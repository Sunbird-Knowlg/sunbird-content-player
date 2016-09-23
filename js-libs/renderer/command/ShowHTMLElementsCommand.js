var ShowHTMLElementsCommand = Command.extend({
	_name: 'SHOWHTMLELEMENTS',
	_isPluginAction: false,
	invoke: function(action) {
		CommandManager.displayAllHtmlElements(true);
	}
});
CommandManager.registerCommand('SHOWHTMLELEMENTS', ShowHTMLElementsCommand);