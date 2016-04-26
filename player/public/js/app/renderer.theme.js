angular.module('genie-canvas.theme',[])
.directive('menu', function() {
      return {
        restrict: 'E',
        templateUrl: 'templates/menu.html'
    }
})
.directive('navigationButtons', function() {
    return {
        restrict: 'E',
        templateUrl: 'templates/navigation-buttons.html'
    }
})
.directive('creditsPopup', function() {
    return {
        restrict: 'E',
        templateUrl: 'templates/credits.html'
    }
})
.directive('assess', function($rootScope) {
    return {
        restrict: 'E',
        scope: {},
        template: '<div style="position:absolute;width: 7%;bottom: 1%;left: 46%;"><a href="javascript:void(0);"> <!-- enabled --><img src="img/icons/next-circle-icon.png" style="width:100%;" /></a></div>',
        link: function(scope, element) {
            element.on("click", function() {
                var action = {"type":"command","command":"eval","asset":Renderer.theme._currentStage};
                action.success = "correct_answer";
                action.failure = "wrong_answer";
                CommandManager.handle(action);
            });
        }
    }
})
.controller('OverlayCtrl', function($scope, $rootScope){
    $rootScope.hasPrevious = false;
    $rootScope.hasNext = false;
    $rootScope.isItemScene = false;
    $scope.showCreditPopup = false;

    $scope.openMenu = function(){
        //display a layer to disable clicking and scrolling on the gameArea while menu is shown
        
        if(jQuery('.menu-overlay').css('display') == "block"){
            $scope.hideMenu();
            return;
        }

        jQuery('.menu-overlay').css('display', 'block');
        jQuery(".gc-menu").show();
        jQuery(".gc-menu").animate({"marginLeft": ["0%", 'easeOutExpo']}, 700, function(){
        });

        console.log("Open Menu..");
        jQuery('.menu-overlay').click(function(){
            jQuery(".gc-menu").animate({"marginLeft": ["-30%", 'easeOutExpo']}, 700, function(){

            });
            jQuery('.menu-overlay').css('display', 'none');
        });
    }

    $scope.hideMenu = function(){
        jQuery('.menu-overlay').css('display', 'none');
        jQuery(".gc-menu").animate({"marginLeft": ["-30%", 'easeOutExpo']}, 700, function(){
        });
        jQuery('.menu-overlay').css('display', 'none');
    }

    $scope.showCreditPop = function(){
        $scope.showCreditPopup = true;
    }

    $scope.hideCreditPop = function(){
       $scope.showCreditPopup = false;
    }

    $scope.navigate = function(to) {
        var navigation = [];
        TelemetryService.interact("TOUCH", to, null, {stageId : Renderer.theme._currentStage});
        if (!_.isEmpty(Renderer.theme._currentScene._data.param)) {
            navigation = (_.isArray(Renderer.theme._currentScene._data.param)) ? Renderer.theme._currentScene._data.param : [Renderer.theme._currentScene._data.param];
            var direction = _.findWhere(navigation, {name: to});
            var action = {
                    "asset": Renderer.theme._id,
                    "command": "transitionTo",
                    "duration": "100",
                    "ease": "linear",
                    "effect": "fadeIn",
                    "type": "command",
                    "value": direction.value
                };
            if ("previous" == to) {
                action.transitionType = "previous";
            }
            Renderer.theme.transitionTo(action);
            $rootScope.hasPrevious = false;
            $rootScope.hasNext = false;
            $rootScope.isItemScene = false;
        }
    };
});