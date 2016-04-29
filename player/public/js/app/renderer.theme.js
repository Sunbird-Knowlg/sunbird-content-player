angular.module('genie-canvas.theme',[])
.run(function($rootScope){
    $rootScope.isPreview = true;
    $rootScope.imageBasePath = "";
    $rootScope.languageSupport = {
        "languageCode": "en",
        "home": "HOME",
        "genie": "GENIE",
        "title": "TITLE",
        "submit": "SUBMIT",
        "goodJob": "Good Job",
        "whatWeDoNext": "What we do next",
        "image": "Image",
        "voice": "Voice",
        "audio": "Audio"
    }
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
            }else{
                $rootScope.imageBasePath = "https://s3-ap-southeast-1.amazonaws.com/ekstep-public/content_app/images/icons"
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
        template: '<a ng-show="!showHome" href="javascript:void(0);"><img ng-src="{{imageBasePath}}home_icon.png" style="width:27%;" /></a><a ng-show="showHome" ng-click="goToHome();" href="javascript:void(0);"><img ng-src="{{imageBasePath}}home_icon.png" style="width:27%;" /></a>',
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
        template: '<a href="javascript:void(0)" ng-click="goToGenie()"><img ng-src="{{imageBasePath}}genie_icon.png" style="width:30%;" /></a>'
    }
})
.directive('restart', function($rootScope) {
      return {
        restrict: 'E',
        template: '<a href="javascript:void(0)" ng-click="restartContent()"><img src="{{imageBasePath}}speaker_icon.png" style="width:100%;" /></a>'
    }
})
.directive('reloadStage', function($rootScope) {
      return {
        restrict: 'E',
        template: '<a href="javascript:void(0)" ng-click="reloadStage()"><img src="{{imageBasePath}}speaker_icon.png" style="width:100%;" /></a>'
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
        template: '<div class="popup"><div class="popup-overlay" ng-click="hidePopup()"></div><div class="popup-full-body"></div></div>',
        link: function(scope, element) {
            scope.icons = $rootScope.icons;
            element.bind("popupUpdate", function(event, data){
                if (data) {
                    for(key in data) {
                        scope[key] = data[key];
                    };
                }
            });
            var body = $compile(scope.popupBody)(scope);
            element.find("div.popup-full-body").html();
            element.find("div.popup-full-body").append(body);
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
        template: '<a class="assess" href="javascript:void(0);"> <!-- enabled --><img ng-src="{{image}}"/><p>'+ $rootScope.languageSupport.submit +'</p></a>',
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
    $rootScope.menuOpened = false;

    $scope.init = function(){
        if(GlobalContext.config.lanugage_info){
            $rootScope.languageSupport = GlobalContext.config.lanugage_info;            
        }        
    }

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
        popup: {
            background: $rootScope.imageBasePath + "popup_background.png",
            close: $rootScope.imageBasePath + "cross_button.png"
        },
        goodJob: {
            background: $rootScope.imageBasePath + "goodjob_popup.png"
        },
        tryAgain: {
            background: $rootScope.imageBasePath + "retry_popup.png",
            retry: $rootScope.imageBasePath + "retry_icon.png"
        },
        end: {
            background: $rootScope.imageBasePath + "end_background.png"
        }
    };

    $scope.goodJob = {
        body: '<div class="credit-popup"><img ng-src="{{icons.goodJob.background}}" style="width:100%;" /><div class="popup-body"><h2 style="font-family: SkaterGirlsRock;color: #FC5B20;top: 20%;position: absolute;left: 45%;font-size: 2em;width:50%;font-weight: bold;">Good Job!</h2><navigate type="\'next\'" enable-image="icons.next.enable" disable-image="icons.next.disable" style="position: absolute;width: 18%;top: 38%;right: 30%;font-size: 3em;"></navigate></div><a style="position: inherit;width: 8%;right: 41.5%;top: 4%;" href="javascript:void(0)" ng-click="hidePopup()"><img ng-src="{{icons.popup.close}}" style="width:100%;"/></a></div>'
    };

    $scope.tryAgain = {
        body: '<div class="credit-popup"><img ng-src="{{icons.tryAgain.background}}" style="width:100%;" /><div class="popup-body"><h2 style="font-family: SkaterGirlsRock;color: #FC5B20;top: 20%;position: absolute;left: 45%;font-size: 2em;width:50%;font-weight: bold;">Try Again!</h2><a ng-click="hidePopup()" href="javascript:void(0);" style="position: absolute;width: 18%;top: 35%;right: 38%;"><img ng-src="{{icons.tryAgain.retry}}" style="width:90%;" /></a><navigate type="\'next\'" enable-image="icons.next.enable" disable-image="icons.next.disable" style="position: absolute;width: 18%;top: 35%;right: 15%;"></navigate></div><a style="position: inherit;width: 8%;right: 40%;top: 4%;" href="javascript:void(0)" ng-click="hidePopup()"><img ng-src="{{icons.popup.close}}" style="width:100%;"/></a></div>'
    };


    $scope.openMenu = function(){
        //display a layer to disable clicking and scrolling on the gameArea while menu is shown

        if(jQuery('.menu-overlay').css('display') == "block"){
            $scope.hideMenu();
            return;
        }

        $scope.menuOpened = true;
        jQuery('.gc-menu-btn').css('margin-right', '0');
        //jQuery('.menu-icon').attr('src', "img/icons/menu_close_icon.png");
        jQuery('.menu-overlay').css('display', 'block');
        jQuery(".gc-menu").show();
        jQuery(".gc-menu").animate({"marginLeft": ["0%", 'easeOutExpo']}, 700, function(){
        });

        console.log("Open Menu..");
        /*jQuery('.menu-overlay').click(function(){
            $scope.menuOpened = flase;
            jQuery(".gc-menu").animate({"marginLeft": ["-31%", 'easeOutExpo']}, 700, function(){

            });
            jQuery('.menu-overlay').css('display', 'none');
        });*/
    }



    $scope.hideMenu = function(){
        $scope.menuOpened = false;
        jQuery('.menu-overlay').css('display', 'none');
        jQuery(".gc-menu").animate({"marginLeft": ["-31%", 'easeOutExpo']}, 700, function(){
        });
        jQuery('.menu-overlay').css('display', 'none');
        jQuery('.menu-icon').attr('src', "img/icons/menu_icon.png").attr("");
        jQuery('.gc-menu-btn').css('margin-right', '-22%');
    }

    $scope.init();
    
});