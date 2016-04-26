angular.module('genie-canvas.theme',[])
.directive('menu', function() {
      return {
        restrict: 'E',
        templateUrl: 'templates/menu.html'
    }
})
.directive('navigate', function($rootScope) {
    return {
        restrict: 'E',
        scope: {
            image: '=image',
            type: '=type'
        },
        template: '<a href="javascript:void(0);"><img ng-src="{{image}}" style="width:100%;" /></a>',
        link: function(scope, element) {
            var to = scope.type;
            element.on("click", function() {
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
                    jQuery('popup').hide();
                    $rootScope.$apply();
                }
            });
        }
    }
})
.directive('popup', function($rootScope, $compile) {
    return {
        restrict: 'E',
        scope: {
            popupBody: '=popupBody'
        },
        template: '<div class="popup"><div class="popup-overlay" ng-click="hidePopup()"></div><div class="credit-popup"><a class="popup-close" href="javascript:void(0)" ng-click="hidePopup()"><img src="img/icons/close-circle-icon.png" style="width:100%;" /></a><h2 style="padding-left: 20px;">The Moon And The Cap</h2><div class="popup-body"></div></div></div>',
        link: function(scope, element) {
            var body = $compile(scope.popupBody)(scope);
            element.find("div.popup-body").html();
            element.find("div.popup-body").append(body);
            element.hide();
            scope.hidePopup = function() {
                element.hide();
            };
        }
    }
})
.directive('assess', function($rootScope) {
    return {
        restrict: 'E',
        scope: {},
        template: '<a href="javascript:void(0);"> <!-- enabled --><img src="img/icons/next-circle-icon.png" style="width:100%;" /></a>',
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

    $scope.goodJob = {
        body: '<div><h2>Good Job!...</h2><navigate type="\'next\'" image="\'img/icons/next-circle-icon.png\'" style="position:absolute;width: 15%;top: 45%;right: 25%;"></navigate></div>'
    };

    $scope.tryAgain = {
        body: '<div><h2>Try Again!...</h2><navigate type="\'next\'" image="\'img/icons/next-circle-icon.png\'" style="position:absolute;width: 15%;top: 45%;right: 25%;"></navigate></div>'
    };



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
    
});