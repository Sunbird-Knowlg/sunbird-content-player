var WindowEventCommand = Command.extend({
	_name: 'WINDOWEVENT',
	_isPluginAction: false,
	invoke: function(action) {
		// remove the dependency on GlobalContext for this command.
        var mimeType = GlobalContext.previousContentMimeType ? GlobalContext.previousContentMimeType : GlobalContext.currentContentMimeType;
        if (GlobalContext.previousContentMimeType || COLLECTION_MIMETYPE == mimeType) {
            window.location.hash = "#/content/list/"+ GlobalContext.previousContentId;
        } else if (CONTENT_MIMETYPES.indexOf(mimeType) > -1) {
            window.location.hash = "#/show/content/" + GlobalContext.currentContentId;
        } else {
            console.warn("Invalid mimeType to handle WINDOWEVENT:", mimeType);
        }
	}

});
CommandManager.registerCommand('WINDOWEVENT', WindowEventCommand);
