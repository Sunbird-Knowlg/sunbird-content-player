OverlayHtml = {
	showNext: function() {
		this._setRootScope("hasNext", true);
	},
	showPrevious: function() {
		this._setRootScope("hasPrevious", true);
	},
	_setRootScope: function(key, value) {
		var rootScope = this._getRootScope();
		if (rootScope) {
            rootScope[key] = value;
            rootScope.$apply();
        }
	},
	_getRootScope: function() {
        var rootScope = null;
        var overlayDOMElement = document.getElementById('overlayHTML');
        if ("undefined" != typeof angular && "undefined" != typeof overlayDOMElement) {
            rootScope = angular.element(overlayDOMElement).scope().$root;
        }
        return rootScope;
    },
    sceneEnter: function() {
        var isItemStage = this.isItemScene();
        if (isItemStage) {
            this._setRootScope("isItemScene", true);
            var currentScene = Renderer.theme._currentScene;
            currentScene.on("correct_answer", function(event) {
                // TODO: add show Good Job popup.
                console.info("listener for ", event);
            });
            currentScene.on("wrong_answer", function(event) {
                // TODO: add show Try Again popup.
                console.info("listener for ", event);
            });
        }
    },
    isItemScene: function() {
    	return ("undefined" != typeof Renderer.theme._currentScene._stageController && "items" == Renderer.theme._currentScene._stageController._type)? true : false;
    }
};