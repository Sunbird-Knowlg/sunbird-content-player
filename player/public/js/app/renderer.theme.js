angular.module('genie-canvas.theme', [])
    .run(function($rootScope) {
        $rootScope.isPreview = true;
        $rootScope.imageBasePath = "";

        $rootScope.languageSupport = {
            "languageCode": "en",
            "home": "HOME",
            "genie": "GENIE",
            "title": "TITLE",
            "submit": "SUBMIT",
            "goodJob": "Good Job!",
            "tryAgain": "Aww,  Seems you goofed it!",
            "whatWeDoNext": "What we do next",
            "image": "Image",
            "voice": "Voice",
            "audio": "Audio",
            "author": "Author",
            "mute": "MUTE"
        }
    })
    .directive('preview', function($rootScope) {
        return {
            restrict: 'A',
            scope: {
                'preview': "="
            },
            link: function(scope, element, attr) {
                $rootScope.isPreview = scope.preview;
                console.log("scope isPreview: ", $rootScope.isPreview);
                if (!scope.preview) {
                    $rootScope.imageBasePath = "img/icons/";
                } else {
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
            template: '<a ng-click="goToHome();" href="javascript:void(0);"><img ng-src="{{imageBasePath}}{{imgSrc}}" style="width:30%;" /></a>',
            link: function(scope, state) {

                var isCollection = false;
                if ($rootScope.collection && $rootScope.collection.children) {
                    isCollection = $rootScope.collection.children.length > 0 ? true : false;
                }
                scope.imgSrc = (isCollection == true) ? "home_icon.png" : "home_icon_disabled.png";
                var pageId = $rootScope.pageId;
                scope.goToHome = function() {
                    if (isCollection) {
                        goToHome($state, isCollection, GlobalContext.previousContentId, pageId);
                    }

                }

            }
        }
    })
    .directive('genie', function($rootScope) {
        return {
            restrict: 'E',
            template: '<a href="javascript:void(0)" ng-click="goToGenie()"><img ng-src="{{imageBasePath}}genie_icon.png" style="width:30%;" /></a>',
            link: function(scope) {
                var pageId = $rootScope.pageId;
                scope.goToGenie = function() {
                    exitApp(pageId);
                }
            }
        }
    })
    .directive('mute', function($rootScope) {
        return {
            restrict: 'E',
            template: '<a href="javascript:void(0)" ng-click="mute()"><img ng-src="{{imageBasePath}}{{mutestatus}}" style="width:30%;" /></a>',
            link: function(scope, url) {
                scope.mutestatus = "speaker_icon.png";
                scope.textstatus = "Mute";

                scope.mute = function() {
                    //mute function goes here

                    console.log("cstate", createjs.Sound.muted);
                    createjs.Sound.muted = !createjs.Sound.muted;

                    scope.mutestatus = (createjs.Sound.muted == true) ? "speaker_icon.png" : "speaker_icon.png";
                    scope.textstatus = (createjs.Sound.muted == true) ? "Unmute" : "Mute";
                }
            }
        }
    })
    .directive('restart', function($rootScope) {
        return {
            restrict: 'E',
            template: '<a href="javascript:void(0)" ng-click="restartContent()"><img src="{{imageBasePath}}retry_icon.png" style="width:100%;" /></a>'
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
            template: '<a ng-show="!show" href="javascript:void(0);"><img ng-src="{{disableImage}}" style="width:90%;" /></a><a ng-show="show" ng-click="onNavigate();" href="javascript:void(0);"><img ng-src="{{enableImage}}" style="width:90%;" /></a>',
            link: function(scope, element) {
                var to = scope.type;
                element.bind("navigateUpdate", function(event, data){
                    if (data) {
                        for(key in data) {
                            scope[key] = data[key];
                        };
                    }
                });
                
                scope.onNavigate = function() {
                    TelemetryService.interact("TOUCH", to, null, {stageId : Renderer.theme._currentStage});
                    $rootScope.isItemScene = false;
                    navigate(to);
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
                scope.languageSupport = $rootScope.languageSupport;
                element.bind("popupUpdate", function(event, data) {
                    if (data) {
                        for (key in data) {
                            scope[key] = data[key];
                        };
                    }
                });
                var body = $compile(scope.popupBody)(scope);
                element.find("div.popup-full-body").html();
                element.find("div.popup-full-body").append(body);
                element.hide();
                scope.hidePopup = function(id) {
                    element.hide();
                    TelemetryService.interact("TOUCH", id ? id : "gc_popupclose", "TOUCH", {
                        stageId: ($rootScope.pageId == "endpage" ? "endpage" : Renderer.theme._currentStage)
                    });
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
            template: '<a class="assess" href="javascript:void(0);"> <!-- enabled --><img ng-src="{{image}}"/><p>{{labelSubmit}}</p></a>',
            link: function(scope, element) {
                scope.labelSubmit = $rootScope.languageSupport.submit;
                element.on("click", function() {
                    var action = {
                        "type": "command",
                        "command": "eval",
                        "asset": Renderer.theme._currentStage
                    };
                    action.success = "correct_answer";
                    action.failure = "wrong_answer";
                    action.htmlEval = "true";
                    CommandManager.handle(action);
                });
            }
        }
    })
    .controller('OverlayCtrl', function($scope, $rootScope) {
        $rootScope.isItemScene = false;
        $rootScope.menuOpened = false;

        $scope.init = function() {
            if (GlobalContext.config.language_info) {
                console.log("Lanugae updated", GlobalContext.config.language_info)
                $rootScope.languageSupport = JSON.parse(GlobalContext.config.language_info);
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
            body: '<div class="credit-popup"><img ng-src="{{icons.goodJob.background}}" style="width:100%;" /><div class="popup-body"><p class="icon-font label-white-stoke gc-popup-title" style="font-size: 10vh; top: 20%;" ng-bind="languageSupport.goodJob"></p><navigate type="\'next\'" enable-image="icons.next.enable" disable-image="icons.next.disable" style="position: absolute;width: 18%;top: 45%;right: 20%;font-size: 3em;"></navigate></div><a style="position: inherit;width: 8%;right: 41.5%;top: 4%;" href="javascript:void(0)" ng-click="hidePopup()"><img ng-src="{{icons.popup.close}}" style="width:100%;"/></a></div>'
        };

        $scope.tryAgain = {
            body: '<div class="credit-popup"><img ng-src="{{icons.tryAgain.background}}" style="width:100%;" /><div class="popup-body"><p class="icon-font label-white-stoke gc-popup-title" ng-bind="languageSupport.tryAgain"></p><a ng-click="hidePopup(\'gc_retry\')" href="javascript:void(0);" style="position: absolute;width: 18%;top: 45%;right: 30%;"><img ng-src="{{icons.tryAgain.retry}}" style="width:90%;" /></a><navigate type="\'next\'" enable-image="icons.next.enable" disable-image="icons.next.disable" style="position: absolute;width: 18%;top: 45%;right: 10%;"></navigate></div><a style="position: inherit;width: 8%;right: 40%;top: 4%;" href="javascript:void(0)" ng-click="hidePopup(\'gc_popupclose\')"><img ng-src="{{icons.popup.close}}" style="width:100%;"/></a></div>'
        };

        $scope.openMenu = function() {
            //display a layer to disable clicking and scrolling on the gameArea while menu is shown

            if (jQuery('.menu-overlay').css('display') == "block") {
                $scope.hideMenu();
                return;
            }

            $scope.menuOpened = true;
            TelemetryService.interact("TOUCH", "gc_menuopen", "TOUCH", {
                stageId: Renderer.theme._currentStage
            });
            jQuery('.menu-overlay').css('display', 'block');
            jQuery(".gc-menu").show();
            jQuery(".gc-menu").animate({
                "marginLeft": ["0%", 'easeOutExpo']
            }, 700, function() {});
        }

        $scope.hideMenu = function() {
            $scope.menuOpened = false;
            TelemetryService.interact("TOUCH", "gc_menuclose", "TOUCH", {
                stageId: Renderer.theme._currentStage
            });
            jQuery('.menu-overlay').css('display', 'none');
            jQuery(".gc-menu").animate({
                "marginLeft": ["-31%", 'easeOutExpo']
            }, 700, function() {});
            jQuery('.menu-overlay').css('display', 'none');
        }

        $scope.init();

    });