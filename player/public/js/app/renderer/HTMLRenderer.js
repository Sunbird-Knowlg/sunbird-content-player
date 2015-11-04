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
	        console.info("Path:", path);
	        // window.location = path;
	        $scope.currentProjectUrl = path;
	        $("#htmlFrame").show();
        }
	},
	cleanUp: function() {
		HTMLRenderer.running = false;
		TelemetryService.end();
		window.location.hash = '#/content/list';
	}
}