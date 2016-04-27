angular.module('genie-canvas.theme',[])
.directive('menu', function() {
      return {
        restrict: 'E',
        templateUrl: 'templates/menu.html'
    }
})
.directive('home', function() {
      return {
        restrict: 'E',
        template: '<a href="javascript:void(0)" ng-click="goToHome()" style="position: absolute; width:5%; top:3%; left:8%;"><img src="img/icons/home-circle-icon.png" style="width:100%;"/></a>'
    }
})
.directive('genie', function() {
      return {
        restrict: 'E',
        template: '<a href="javascript:void(0)" ng-click="goToGenie()" style="position:absolute;width: 5%; top: 3%; right: 3%;"><img src="img/icons/genie-circle-icon.png" style="width:100%;" /></a>'
    }
})
.directive('reload', function() {
      return {
        restrict: 'E',
        template: '<a href="javascript:void(0)" ng-click="reloadStage()" style="position: absolute; width:7%; bottom: 1%; left:8%;"><img src="img/icons/reload.png" style="width:100%;" /></a>'
    }
})
.directive('navigate', function($rootScope) {
    return {
        restrict: 'E',
        scope: {
            disableImage: '=',
            enableImage: '=',
            type: '=type'
        },
        template: '<a ng-show="!show" href="javascript:void(0);"><img ng-src="{{disableImage}}" style="width:100%;" /></a><a ng-show="show" ng-click="navigate();" href="javascript:void(0);"><img ng-src="{{enableImage}}" style="width:100%;" /></a>',
        link: function(scope, element) {
            var to = scope.type;
            element.bind("navigateUpdate", function(event, data){
                if (data) {
                    for(key in data) {
                        scope[key] = data[key];
                    };
                }
            });
            scope.navigate = function() {
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
                    var navigate = angular.element("navigate");
                    navigate.trigger("navigateUpdate", {'show': false});
                    $rootScope.isItemScene = false;
                    jQuery('popup').hide();
                }
            };
        }
    }
})
.directive('popup', function($rootScope, $compile) {
    return {
        restrict: 'E',
        scope: {
            popupBody: '=popupBody'
        },
        template: '<div class="popup"><div class="popup-overlay" ng-click="hidePopup()"></div><div class="credit-popup"><a class="popup-close" href="javascript:void(0)" ng-click="hidePopup()"><img src="img/icons/close-circle-icon.png" style="width:100%;" /></a><h2 style="padding-left: 20px;"></h2><div class="popup-body"></div></div></div>',
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
        template: '<a href="javascript:void(0);"> <!-- enabled --><img src="img/icons/submit.png" style="width:100%;" /></a>',
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
    $rootScope.isItemScene = false;

    $scope.goodJob = {
        body: '<div><h2>Good Job!...</h2><navigate type="\'next\'" enable-image="\'img/icons/next.png\'" disable-image="\'img/icons/next_disabled.png\'" style="position:absolute;width: 15%;top: 45%;right: 25%;"></navigate></div>'
    };

    $scope.tryAgain = {
        body: '<div><h2>Try Again!...</h2><navigate type="\'next\'" enable-image="\'img/icons/next.png\'" disable-image="\'img/icons/next_disabled.png\'" style="position:absolute;width: 15%;top: 45%;right: 25%;"></navigate></div>'
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