angular.module('genie-canvas.theme', [])
    .run(function($rootScope) {
        $rootScope.enableEval = false;
    })
    .directive('menu', function($rootScope, $sce) {
        return {
            restrict: 'E',
            templateUrl: ("undefined" != typeof localPreview && localPreview == "local") ? $sce.trustAsResourceUrl(serverPath + 'templates/menu.html') : 'templates/menu.html'
        }
    })
    .directive('home', function($rootScope, $state) {
        return {
            restrict: 'E',
             scope: {
                disableHome: '=info'

            },
            template: '<a ng-click="goToHome();" href="javascript:void(0);"><img ng-src="{{imgSrc}}" style="width:32%;" /></a>',
            link: function(scope, state) {
                var isCollection = false;
                if ($rootScope.collection && $rootScope.collection.children) {
                    isCollection = $rootScope.collection.children.length > 0 ? true : false;
                }

            console.info("scope.disableHome", scope.disableHome);
            ;
            var homeSrc = "home_icon.png";
            if (!isCollection) {
                if (scope.disableHome == true) {
                    homeSrc = "home_icon_disabled.png";
                }
            }
            scope.imgSrc = $rootScope.imageBasePath + homeSrc;

               var pageId = $rootScope.pageId;
                scope.goToHome = function() {
                   isCollection ? goToHome($state, isCollection, GlobalContext.previousContentId, pageId): window.location.hash = "/show/content/" + GlobalContext.currentContentId;
                }

            }
        }
    })
    .directive('genie', function($rootScope) {
        return {
            restrict: 'E',
            template: '<a href="javascript:void(0)" ng-click="goToGenie()"><img ng-src="{{imageBasePath}}genie_icon.png" style="width:32%;" /></a>',
            link: function(scope) {
                var pageId = $rootScope.pageId;
                scope.goToGenie = function() {
                    exitApp(pageId);
                }
            }
        }
    })
    .directive('stageInstructions', function($rootScope) {
        return {
            restrict: 'E',
            template: '<a href="javascript:void(0)" ng-click="showInstructions()"><img ng-src="{{imageBasePath}}teacher_instructions.png" style="z-index:2; max-width:32%;"/></a>',
            controller: function($scope, $rootScope) {
                $scope.stageInstMessage = "";
                $scope.showInst = false;

                /*<a href="javascript:void(0)" ng-click="showInstructions()"><img ng-src="{{imageBasePath}}genie_icon.png" style="width:30%;"/></a>*/
                $scope.showInstructions = function() {
                    if (Renderer.theme._currentScene.params && Renderer.theme._currentScene.params.instructions) {
                        $scope.showInst = true;

                        //Getting stage instructions from CurrentStage(StagePlugin)
                        var inst = Renderer.theme._currentScene.params.instructions;
                        $scope.stageInstMessage = inst;
                    }
                }

                $scope.closeInstructions = function() {
                    $scope.showInst = false;
                }

                /*
                 * If meny is getting hide, then hide teacher instructions as well
                 */
                $scope.$watch("menuOpened", function() {
                    if (!$rootScope.menuOpened) {

                        $scope.showInst = false;
                    }
                });
            }
        }
    })
    .directive('mute', function($rootScope) {
        return {
            restrict: 'E',
            template: '<a href="javascript:void(0)" ng-click="mute()"><img id="mute_id" ng-src="{{imageBasePath}}mute.png" style="position:absolute;bottom:12%; width:10%;  margin-left:41%; z-index:1; " /><img id="unmute_id"  style="position:absolute;  bottom:12%; width:11.7%; margin-left:40%; z-index: 2; visibility:"hidden" "/> </a>',
            link: function(scope, url) {
                scope.mutestatus = "mute.png";

                scope.mute = function() {
                    //mute function goes here
                    if (AudioManager.muted) {
                        AudioManager.unmute();
                        document.getElementById("unmute_id").style.visibility = "hidden"
                    } else {
                        AudioManager.mute();
                        document.getElementById("unmute_id").src = "img/icons/unmute.png";
                        document.getElementById("unmute_id").style.visibility = "visible"
                    }


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
            template: '<a href="javascript:void(0)" onclick="reloadStage()"><img id="reload_id" src="{{imageBasePath}}speaker_icon.png" style="width:100%;"/></a>'
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
                element.bind("navigateUpdate", function(event, data) {
                    if (data) {
                        for (key in data) {
                            scope[key] = data[key];
                        };
                    }
                });
                scope.onNavigate = function() {
                    TelemetryService.interact("TOUCH", to, null, {
                        stageId: Renderer.theme._currentStage
                    });
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
                scope.content = $rootScope.content;
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
                scope.retryAssessment = function(id){
                    submitOnNextClick = true;
                    scope.hidePopup(id);
                }

                scope.hidePopup = function(id) {
                    element.hide();
                    TelemetryService.interact("TOUCH", id ? id : "gc_popupclose", "TOUCH", {
                        stageId: ($rootScope.pageId == "endpage" ? "endpage" : Renderer.theme._currentStage)
                    });
                };

                scope.moveToNextStage = function(navType){
                    submitOnNextClick = false;
                    navigate(navType);
                }
            }
        }
    })
    .directive('assess', function($rootScope) {
        return {
            restrict: 'E',
            scope: {
                image: '='
            },
            template: '<a class="assess" id="assessButton" ng-class="assessStyle" href="javascript:void(0);" ng-click="onSubmit()"> <!-- enabled --><img ng-src="{{image}}"/><p>{{labelSubmit}}</p></a>',
            link: function(scope, element) {
                scope.labelSubmit = $rootScope.languageSupport.submit;
            },
            controller: function($scope, $rootScope, $timeout) {
                $scope.isEnabled = false;
                $scope.assessStyle = 'assess-disable';

                $rootScope.$watch('enableEval', function() {
                    //Submit buttion style changing(enable/disable) button
                    $scope.isEnabled = $rootScope.enableEval;
                    if ($scope.isEnabled) {
                        //Enable state
                        $timeout(function(){
                            // This timeout is required to apply the changes(because it is calling by JS)
                            $scope.assessStyle = 'assess-enable';
                            $scope.image = $rootScope.imageBasePath + "submit.png";
                        }, 100);
                    } else {
                        //Disable state
                        $scope.assessStyle = 'assess-disable';
                        $scope.image = $rootScope.imageBasePath + "submit_disabled.png";
                    }
                });

                 $scope.onSubmit = function() {
                    if ($scope.isEnabled) {
                        evalAndSubmit();
                    }
                }
            }
        }
    })
    .controller('OverlayCtrl', function($scope, $rootScope) {
        $rootScope.isItemScene = false;
        $rootScope.menuOpened = false;

        $scope.init = function() {
            if (GlobalContext.config.language_info) {
                console.log("Language updated", GlobalContext.config.language_info);
                var languageInfo = JSON.parse(GlobalContext.config.language_info);
                for(key in languageInfo) {
                    $rootScope.languageSupport[key] = languageInfo[key];
                }
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
            assess: {
                enable: $rootScope.imageBasePath + "submit.png",
                disable: $rootScope.imageBasePath + "submit_disabled.png"
            },
            retry: $rootScope.imageBasePath + "speaker_icon.png",
            /* popup: {
            background: $rootScope.imageBasePath + "popup_BG.png",
            close: $rootScope.imageBasePath + "cross_button.png"
            },*/
            goodJob: {
                background: $rootScope.imageBasePath + "good_job_bg.png"
            },
            tryAgain: {
                background: $rootScope.imageBasePath + "try_again_bg.png",
                retry: $rootScope.imageBasePath + "retry_icon.png"
            },
            end: {
                background: $rootScope.imageBasePath + "background.png"
            },
            popup: {
                next: $rootScope.imageBasePath + "next_Green.png",
                retry: $rootScope.imageBasePath + "retry_green.png",
                skip: $rootScope.imageBasePath + "skip.png",
                star: $rootScope.imageBasePath + "star.png",
                credit_popup: $rootScope.imageBasePath + "popup.png"


            },
            popup_kid: {
                good_job: $rootScope.imageBasePath + "LEFT.png",
                retry: $rootScope.imageBasePath + "Genie_ RETRY.png"
            },
            popup_close: {
                close_icon: $rootScope.imageBasePath + "close_popup.png",
            }
        };

        $scope.goodJob = {
            body: '<div class="credit-popup"><img ng-src="{{icons.goodJob.background}}" style="width:100%; position: absolute;right:4%;top:6%"/><div class="popup-body"><a href="javascript:void(0);" ng-click="hidePopup()"><img class="popup-goodjob-next" ng-src="{{ icons.popup.next }}" ng-click="moveToNextStage(\'next\')"/></a></div></div>'
        };

        $scope.tryAgain = {
            body: '<div class="credit-popup"><img ng-src="{{icons.tryAgain.background}}" style="width:100%;" /><div class="popup-body"><a ng-click="retryAssessment(\'gc_retry\')" href="javascript:void(0);" ><img class="popup-retry" ng-src="{{icons.popup.retry}}" /></a><a href="javascript:void(0);" ng-click="hidePopup()"><img class="popup-retry-next" ng-src="{{ icons.popup.skip }}" ng-click="moveToNextStage(\'next\')"/></a></div></div>'
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
