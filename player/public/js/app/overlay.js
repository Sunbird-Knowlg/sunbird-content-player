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
        var isItemStage = this.isItemScene();
        if (isItemStage) {
            jQuery('#assessButton').show();
            this._setRootScope("isItemScene", true);

            var currentScene = Renderer.theme._currentScene;
            currentScene.on("correct_answer", function(event) {
                console.log("listener for ", event);

                if (event.type === "correct_answer") {
                    AudioManager.play({asset: "goodjob_sound"});
                }
                jQuery("#goodJobPopup").show();
            });
            currentScene.on("wrong_answer", function(event) {
                console.info("listener for ", event);
                if (event.type === "wrong_answer") {
                    AudioManager.play({asset: "tryagain_sound"});
                }
                jQuery("#tryAgainPopup").show();
            });
        }
    },

    enablePrevious: function () {
        var navigateTo = this.getNavigateTo('previous');
        if (_.isUndefined(navigateTo)) {

            jQuery('#navPrev').hide();
            if (Overlay.isItemScene() && Renderer.theme._currentScene._stageController.hasPrevious()) {
                jQuery('#navPrev').show();
            }
        } else {
            jQuery('#navPrev').show();
        }
    },

    reloadStage: function() {
      reloadStage();
    },

    navigate: function(navType) {
      navigate(navType);
    },

    evalAndSubmit: function () {
      evalAndSubmit();
    },

    enableReload: function () {
        _reloadInProgress = false;
    },

    isItemScene: function() {
        var stageCtrl = Renderer.theme._currentScene ? Renderer.theme._currentScene._stageController : undefined;
        if (!_.isUndefined(stageCtrl) && ("items" == stageCtrl._type) && !_.isUndefined(stageCtrl._model)) {
            var modelItem = stageCtrl._model[stageCtrl._index];
            if(!_.isNull(this._rootScope)){
                var enableEval = false;
                if(modelItem && modelItem.type.toLowerCase() == 'ftb') {
                    // If FTB item, enable submit button directly
                    enableEval = true;
                } else {
                    var stage = Renderer.theme._currentScene;
                    if(!_.isUndefined(stage._currentState) && (!_.isUndefined(stage._currentState.isEvaluated))){
                        enableEval = !stage._currentState.isEvaluated;
                    }
                }
                this.isReadyToEvaluate(enableEval);
            }
            return true;
        } else {
            return false;
        }
        //return ("undefined" != typeof Renderer.theme._currentScene._stageController && "items" == Renderer.theme._currentScene._stageController._type)? true : false;
    }
};
