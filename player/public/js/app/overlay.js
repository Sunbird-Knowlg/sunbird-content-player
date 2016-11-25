Overlay = {
    _rootScope: null,
    showNext: function() {
        jQuery('#navNext').show();
    },
    showPrevious: function() {
        jQuery('#navPrev').show();
    },
    _setRootScope: function(key, value) {
        var rootScope = this._getRootScope();
        if (rootScope) {
            rootScope[key] = value;
            //rootScope:inprogAction Already In Progress
            if (!rootScope.$$phase) {
                rootScope.$apply();
            }
        }
    },
    _getRootScope: function() {
        if (_.isNull(this._rootScope)) {
            var overlayDOMElement = document.getElementById('overlay');
            if ("undefined" != typeof angular && "undefined" != typeof overlayDOMElement) {
                var scope = angular.element(overlayDOMElement).scope();
                if (scope) this._rootScope = scope.$root;
            }
        }
        return this._rootScope;
    },
    isReadyToEvaluate: function(enableEval) {
        this._setRootScope("enableEval", enableEval);
    },
    resetStage: function() {
        this.isReadyToEvaluate(false);
        jQuery('#assessButton').hide();
    },
    getNavigateTo: function (navType) {
        var navigation = [];
        var navigateTo = undefined;
        if (!_.isUndefined(Renderer.theme._currentScene) && !_.isEmpty(Renderer.theme._currentScene._data.param)) {
            navigation = (_.isArray(Renderer.theme._currentScene._data.param)) ? Renderer.theme._currentScene._data.param : [Renderer.theme._currentScene._data.param];
            var direction = _.findWhere(navigation, {
                name: navType
            });
            if (direction) navigateTo = direction.value;
        }
        return navigateTo;
    },
    sceneEnter: function() {
        this.resetStage();
        this.enablePrevious();
        this.enableReload();
        // var isItemStage = this.isItemScene();
    },
    enablePrevious: function () {
        var navigateTo = this.getNavigateTo('previous');
        if (_.isUndefined(navigateTo)) {

            jQuery('#navPrev').hide();
            // if (Overlay.isItemScene() && Renderer.theme._currentScene._stageController.hasPrevious()) {
            //     jQuery('#navPrev').show();
            // }
        } else {
            jQuery('#navPrev').show();
        }
    },
    reloadStage: function() {
      reloadStage();
    },
    enableReload: function () {
        _reloadInProgress = false;
    }
};
