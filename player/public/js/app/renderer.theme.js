angular.module('genie-canvas.theme',[])
.run(function($rootScope){
    $rootScope.isPreview = true;
    $rootScope.imageBasePath = "";
})
.directive('preview', function($rootScope){
    return{
        restrict: 'A',
        scope:{
            'preview': "="
        },
        link: function(scope, element, attr){
            $rootScope.isPreview = scope.preview;
            console.log("scope isPreview: ", $rootScope.isPreview);
            if(!scope.preview){
                $rootScope.imageBasePath = "img/icons/";
            }
        }
    }
})
.directive('menu', function($rootScope) {
      return {
        restrict: 'E',        
        templateUrl: 'templates/menu.html'
    }
})
.directive('home', function($rootScope, $state) {
      return {
        restrict: 'E',
        template: '<a ng-show="!showHome" href="javascript:void(0);"><img ng-src="{{imageBasePath}}" style="width:90%;" /></a><a ng-show="showHome" ng-click="goToHome();" href="javascript:void(0);"><img ng-src="{{imageBasePath}}home_icon.png" style="width:90%;" /></a>',
        link: function(scope, state){
            $rootScope.imageBasePath = "img/icons/";
            $rootScope.goToHome = function() {
                goToHome($state, $rootScope, GlobalContext.previousContentId);
            }
            console.log($rootScope.isCollection);
            if($rootScope.isCollection) {
                console.log("inside into skdjbvliasjvnasjkfnv;iajknfv ;ajkdfv");
                $rootScope.showHome = true;
            } else {
                $rootScope.showHome = false;
            }
        }
    }
})
.directive('genie', function($rootScope) {
      return {
        restrict: 'E',
        template: '<a href="javascript:void(0)" ng-click="goToGenie()" ><img ng-src="{{imageBasePath}}genie_icon.png" style="width:100%;" /></a>',
        link: function(scope){
             $rootScope.imageBasePath = "img/icons/";
             $rootScope.goToGenie = function() {
                exitApp();
            };
        }
    }
})
.directive('restart', function($rootScope) {
      return {
        restrict: 'E',
        template: '<a href="javascript:void(0)" ng-click="restartContent()" ><img src="{{imageBasePath}}reload.png" style="width:100%;" /></a>',
        link: function(scope){
             $rootScope.imageBasePath = "img/icons/";
            //  $rootScope.restartContent = function() {
                
            // };
        }
    }
})
.directive('reload', function($rootScope) {
      return {
        restrict: 'E',
        template: '<a href="javascript:void(0)" ng-click="reloadStage()" ><img src="{{imageBasePath}}reload.png" style="width:100%;" /></a>',
        link: function(scope){
             $rootScope.imageBasePath = "img/icons/";
        }

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
        template: '<a ng-show="!show" href="javascript:void(0);"><img ng-src="{{disableImage}}" style="width:90%;" /></a><a ng-show="show" ng-click="navigate();" href="javascript:void(0);"><img ng-src="{{enableImage}}" style="width:90%;" /></a>',
        link: function(scope, element) {
            var to = scope.type;
            element.bind("navigateUpdate", function(event, data){
                if (data) {
                    for(key in data) {
                        scope[key] = data[key];
                    };
                }
            });
            var getNavigateTo = function() {
                var navigation = [];
                var getNavigateTo = undefined;
                if (!_.isEmpty(Renderer.theme._currentScene._data.param)) {
                    navigation = (_.isArray(Renderer.theme._currentScene._data.param)) ? Renderer.theme._currentScene._data.param : [Renderer.theme._currentScene._data.param];
                    var direction = _.findWhere(navigation, {name: to});
                    if (direction) getNavigateTo = direction.value;
                }
                return getNavigateTo;
            }
            var navigate = function(navigateTo) {
                 var action = {
                        "asset": Renderer.theme._id,
                        "command": "transitionTo",
                        "duration": "100",
                        "ease": "linear",
                        "effect": "fadeIn",
                        "type": "command",
                        "value": navigateTo
                    };
                action.transitionType = to;
                Renderer.theme.transitionTo(action);
                var navigate = angular.element("navigate");
                navigate.trigger("navigateUpdate", {'show': false});
                $rootScope.isItemScene = false;
                jQuery('popup').hide();
            }
            scope.navigate = function() {
                TelemetryService.interact("TOUCH", to, null, {stageId : Renderer.theme._currentStage});
                var navigateTo = getNavigateTo();
                if ("undefined" == typeof navigateTo && "next" == to) {
                    console.info("redirecting to endpage.");
                    window.location.hash = "/content/end/" + GlobalContext.currentContentId;
                } else {
                    navigate(navigateTo);
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
            scope.icons = $rootScope.icons;
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
        scope: {
            image: '='
        },
        template: '<a href="javascript:void(0);"> <!-- enabled --><img ng-src="{{image}}" style="width:100%;" /></a>',
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
    $rootScope.icons = {
        previous: {
            disable: $rootScope.imageBasePath + "back_icon_disabled.png",
            enable: $rootScope.imageBasePath + "back_icon.png",
        },
        next: {
            disable: $rootScope.imageBasePath + "next_icon_disabled.png",
            enable: $rootScope.imageBasePath + "next_icon.png",
        },
        assess: $rootScope.imageBasePath + "submit.png",
        retry: $rootScope.imageBasePath + "speaker_icon.png",
    };

    $scope.goodJob = {
        body: '<div><h2>Good Job!...</h2><navigate type="\'next\'" enable-image="icons.next.enable" disable-image="icons.next.disable" style="position:absolute;width: 15%;top: 45%;right: 43%;"></navigate></div>'
    };

    $scope.tryAgain = {
        body: '<div><h2>Try Again!...</h2><a ng-click="hidePopup()" href="javascript:void(0);" style="position:absolute;width: 15%;top: 45%;left: 30%;"><img ng-src="{{icons.retry}}" style="width:100%;" /></a><navigate type="\'next\'" enable-image="icons.next.enable" disable-image="icons.next.disable" style="position:absolute;width: 15%;top: 45%;right: 30%;"></navigate></div>'
    };



    $scope.openMenu = function(){
        //display a layer to disable clicking and scrolling on the gameArea while menu is shown
        
        jQuery('.menu-icon').attr('src', "img/icons/menu_close_icon.png");

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
        jQuery('.menu-icon').attr('src', "img/icons/menu_icon.png");
    }
    
});