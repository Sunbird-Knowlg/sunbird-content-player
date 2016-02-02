HTMLRenderer = {
	running: false,
	start: function(gameRelPath, canvasId, gameId, $scope) {
		if(HTMLRenderer.running) {
            HTMLRenderer.cleanUp();
        } else {
        	HTMLRenderer.running = true;
	        TelemetryService.start(gameId, GlobalContext.game.ver);
	        $('#gameAreaLoad').hide();
	        $('#gameArea').hide();
	        var path = gameRelPath + '/index.html';
	        HTMLRenderer.resizeFrame();
	        $scope.currentProjectUrl = path;
	        $("#htmlFrame").show();
        }
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
		window.location.hash = '#/content/list';
	}
}