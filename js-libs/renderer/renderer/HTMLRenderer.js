HTMLRenderer = {
	running: false,
	start: function(gameRelPath, canvasId, game, cb) {
        if(HTMLRenderer.running) {
            HTMLRenderer.cleanUp();
        }
        HTMLRenderer.running = true;
        (game && game.identifier && game.pkgVersion) ? TelemetryService.start(game.identifier, game.pkgVersion): TelemetryService.start();
        HTMLRenderer.resizeFrame();
        cb();
        
	},
	resizeFrame: function() {
        var gameArea = document.getElementById('htmlFrame');
        var widthToHeight = 16 / 9;
        var newWidth = window.innerWidth;
        var newHeight = window.innerHeight;
        var newWidthToHeight = newWidth / newHeight;
        if (newWidthToHeight > widthToHeight) {
            newWidth = newHeight * widthToHeight;
            gameArea.style.height = newHeight + 'px';
            gameArea.style.width = newWidth + 'px';
        } else {
            newHeight = newWidth / widthToHeight;
            gameArea.style.width = newWidth + 'px';
            gameArea.style.height = newHeight + 'px';
        }
    },
	cleanUp: function() {
		HTMLRenderer.running = false;
		TelemetryService.end();
		// window.location.hash = '#/content/list';
	}
}