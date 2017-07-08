'use strict';

app.controllerProvider.register("OverlayController", function($scope, $rootScope, $compile, $stateParams) {
    $rootScope.isItemScene = false;
    $rootScope.menuOpened = false;
    $rootScope.stageId = undefined;
    $scope.state_off = "off";
    $scope.state_on = "on";
    $scope.state_disable = "disable";
    $scope.showOverlayGoodJob = true;
    $scope.showOverlayTryAgain = true;
    $scope.overlayEvents = ["overlaySubmit", "overlayMenu", "overlayReload", "overlayGoodJob", "overlayTryAgain"];
    $scope.showOverlay = true;
    $scope.pluginInstance = undefined;
    $scope.imageBasePath = AppConfig.assetbase;
    $scope.showTeacherIns = true;
    $scope.showReload = true;
    $scope.init = function() {
    	console.log("OVERLAY - controller loaded");
    	$scope.pluginInstance = EkstepRendererAPI.getPluginObjs("org.ekstep.overlay");
        if (GlobalContext.config.language_info) {
            var languageInfo = JSON.parse(GlobalContext.config.language_info);
            for (key in languageInfo) {
                AppLables[key] = languageInfo[key];
            }
        }
        $scope.AppLables = AppLables;
        if (!_.isUndefined(AppConfig.overlay.menu) && !AppConfig.overlay.menu.showTeachersInstruction)
            $scope.showTeacherIns = AppConfig.overlay.menu.showTeachersInstruction;
        if (!AppConfig.overlay.showReload)
            $scope.showReload = AppConfig.overlay.showReload;
        var evtLenth = $scope.overlayEvents.length;
        for (var i = 0; i < evtLenth; i++) {
            var eventName = $scope.overlayEvents[i];
            EventBus.addEventListener(eventName, $scope.overlayEventHandler, $scope);
        }
		EventBus.addEventListener("sceneEnter", function(data) {
			$rootScope.stageData = data.target;
			//TODO: Remove this currentStage parameter and use directly stageData._currentStage
			$rootScope.stageId = !_.isUndefined($rootScope.stageData) ? $rootScope.stageData._id : undefined;
		});
        EkstepRendererAPI.addEventListener("renderer:init:overlay", $scope.loadOverlay);
        EkstepRendererAPI.addEventListener("renderer:show:overlay", $scope.showOverlay);
        EkstepRendererAPI.addEventListener("renderer:overlay:hide", $scope.hideOverlay);
        EkstepRendererAPI.addEventListener("renderer:content:start", $scope.showOverlay);
        EkstepRendererAPI.addEventListener("renderer:content:end", $scope.hideOverlay);
    }

    $scope.showOverlay = function() {
        $scope.showOverlay = !_.isUndefined(AppConfig.overlay.showOverlay) && AppConfig.overlay.showOverlay ? AppConfig.overlay.showOverlay : console.warn('Overlay is disabled');
        $scope.safeApply();
    }

    $scope.hideOverlay = function() {
        $scope.showOverlay = false;
        $scope.safeApply();
    }

	$scope.navigate = function(navType) {
		console.log("navType: ", navType);
        if (!$rootScope.content) {
            // if $rootScope.content is not available get it from the base controller
            org.ekstep.contentrenderer.getContentMetadata($stateParams.itemId);
        }
        GlobalContext.currentContentId = $rootScope.content.identifier;
        GlobalContext.currentContentMimeType = $rootScope.content.mimeType;
        if (navType === "next") {
            EventBus.dispatch("actionNavigateNext", navType);
            EventBus.dispatch("nextClick");

        } else if (navType === "previous") {
            EventBus.dispatch("actionNavigatePrevious", navType);
            EventBus.dispatch("previousClick");
        }
    }

    $scope.loadOverlay = function() {
        var gameArea = angular.element('#gameArea');
    }

    $rootScope.defaultSubmit = function() {
        EventBus.dispatch("actionDefaultSubmit");
    }

    $scope.openUserSwitchingModal = function() {
        TelemetryService.interact("TOUCH", "gc_open_userswitch", "TOUCH", {
            stageId: EkstepRendererAPI.getCurrentStageId() ? EkstepRendererAPI.getCurrentStageId() : $rootScope.pageId
        });
        EventBus.dispatch("event:openUserSwitchingModal");
        $scope.hideMenu();
    }

    $scope.overlayEventHandler = function(event) {
        //Switch case to handle HTML elements(Next, Previous, Submit, etc..)
        switch (event.type) {
            case "overlaySubmit":
                if (event.target === "off") {
                    $scope.showOverlaySubmit = false;
                } else {
                    $scope.showOverlaySubmit = true;
                    (event.target === "disable") ? $rootScope.enableEval = false: $rootScope.enableEval = true;
                }
                break;
            case "overlayMenu":
                break;
            case "overlayReload":
                break;
            case "overlayGoodJob":
                $scope.showOverlayGoodJob = event.target;
                break;
            case "overlayTryAgain":
                $scope.showOverlayTryAgain = event.target;
                break;
            default:
                console.log("Default case got called..");
                break;
        }
        $rootScope.safeApply();
    }

    $scope.openMenu = function() {
        //display a layer to disable clicking and scrolling on the gameArea while menu is shown
        if (jQuery('.menu-overlay').css('display') == "block") {
            $scope.hideMenu();
            return;
        }
        $scope.menuOpened = true;
        TelemetryService.interact("TOUCH", "gc_menuopen", "TOUCH", {
            stageId: $rootScope.stageId
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
            stageId: $rootScope.stageId
        });
        jQuery('.menu-overlay').css('display', 'none');
        jQuery(".gc-menu").animate({
            "marginLeft": ["-31%", 'easeOutExpo']
        }, 700, function() {});
    }

    $scope.replayContent = function(){
        var data = {
            'interactId' : 'ge_replay',
            'callback': $scope.replayCallback
        };
        EkstepRendererAPI.dispatchEvent('renderer:content:close', undefined, data);
    }

    $scope.replayCallback = function(){
        $scope.hideMenu();
        EkstepRendererAPI.dispatchEvent('renderer:content:replay');
    }

    $scope.init();
});

app.controllerProvider.register('UserSwitchController', ['$scope', '$rootScope', '$state', '$stateParams', function($scope, $rootScope, $state, $stateParams) {
    $scope.groupLength = undefined;
    $scope.selectedUser = {};
    $scope.showUserSwitchModal = false;
    $scope.imageBasePath = AppConfig.assetbase;

    $scope.hideUserSwitchingModal = function() {
        $rootScope.safeApply(function() {
            $scope.showUserSwitchModal = false;
        });
    }

    $scope.showUserSwitchingModal = function() {
        if ($rootScope.enableUserSwitcher) {
            TelemetryService.interact("TOUCH", "gc_userswitch_popup_open", "TOUCH", {
                stageId: EkstepRendererAPI.getCurrentStageId() ? EkstepRendererAPI.getCurrentStageId() : $rootScope.pageId
            });

            _.each($rootScope.users, function(user) {
                if (user.selected === true) user.selected = false;
                if (user.uid === $rootScope.currentUser.uid) user.selected = true;
            });
            $scope.sortUserlist();
            $rootScope.safeApply(function() {
                $scope.showUserSwitchModal = true;
            });
        } else {
            showToaster('info', "Change of users is disabled");
        }
    }
    $scope.getUsersList = function() {
        org.ekstep.service.content.getAllUserProfile().then(function(usersData) {
            console.log("getAllUserProfile()", usersData);
            $rootScope.users = usersData;
            $scope.groupLength = (_.where($rootScope.users, {
                "isGroupUser": true
            })).length;
            if ($rootScope.users.length == 0) $rootScope.users.push($rootScope.currentUser);
            $scope.sortUserlist();
        }).catch(function(err) {
            console.error(err);
        });
    }
    $scope.sortUserlist = function() {
        $rootScope.users = _.sortBy(_.sortBy($rootScope.users, 'handle'), 'userIndex');
    }

    // this function changes the selected user
    $scope.selectUser = function(selectedUser) {
        // here the user Selection happens

        _.each($rootScope.users, function(user) {
            if (user.selected === true) user.selected = false;
        });
        TelemetryService.interact("TOUCH", selectedUser.uid, "TOUCH", {
            stageId: EkstepRendererAPI.getCurrentStageId() ? EkstepRendererAPI.getCurrentStageId() : $rootScope.pageId
        });
        selectedUser.selected = true;
        $scope.selectedUser = selectedUser;
    }

    // When the user clicks on replayContent, replayContent the content
    $scope.replayContent = function() {
        var replayContent = true;
        TelemetryService.interact("TOUCH", 'gc_userswitch_replayContent', "TOUCH", {
             stageId: EkstepRendererAPI.getCurrentStageId() ? EkstepRendererAPI.getCurrentStageId() : $rootScope.pageId
         });
        $scope.switchUser(replayContent);
    }

    // When the user clicks on Continue, Continue the content from there
    $scope.continueContent = function() {
        // here the user Selection happens
        var replayContent = false;
        TelemetryService.interact("TOUCH", 'gc_userswitch_continue', "TOUCH", {
             stageId: EkstepRendererAPI.getCurrentStageId() ? EkstepRendererAPI.getCurrentStageId() : $rootScope.pageId
         });
        $scope.switchUser(replayContent);
    }

    $scope.switchUser = function(replayContent) {
        var userSwitchHappened;
        if (!_.isEmpty($scope.selectedUser)) {
            userSwitchHappened = true;
            org.ekstep.service.content.setUser($scope.selectedUser.uid).then(function(data) {
                $rootScope.$apply(function() {
                    $rootScope.currentUser = $scope.selectedUser;
                    $rootScope.currentUser.userIndex = $rootScope.sortingIndex -= 1;
                    $scope.selectedUser = {};

                    if (replayContent == true) {
                         var data = {
                            'callback': $scope.replayCallback
                        };
                        TelemetryService.interrupt("SWITCH", EkstepRendererAPI.getCurrentStageId() ? EkstepRendererAPI.getCurrentStageId() : $rootScope.pageId);
                        EkstepRendererAPI.dispatchEvent('renderer:content:end', undefined, data);
                    } else {
                        if (userSwitchHappened) {
                            var version = TelemetryService.getGameVer();;
                            var gameId = TelemetryService.getGameId();
                            TelemetryService.interrupt("SWITCH", EkstepRendererAPI.getCurrentStageId() ? EkstepRendererAPI.getCurrentStageId() : $rootScope.pageId);
                            TelemetryService.end();
                            TelemetryService.setUser($rootScope.currentUser, EkstepRendererAPI.getCurrentStageId() ? EkstepRendererAPI.getCurrentStageId() : $rootScope.pageId);
                            var data = {};
                            data.stageid = EkstepRendererAPI.getCurrentStageId() ? EkstepRendererAPI.getCurrentStageId() : $rootScope.pageId;
                            data.mode = getPreviewMode();
                            TelemetryService.start(gameId, version, data);
                        }
                    }

                });
            }).catch(function(err) {
                console.log(err);
            })
        }
        $scope.closeUserSwitchingModal(false);
    }

    $scope.replayCallback = function() {
        TelemetryService.setUser($rootScope.currentUser, EkstepRendererAPI.getCurrentStageId() ? EkstepRendererAPI.getCurrentStageId() : $rootScope.pageId);
        EkstepRendererAPI.dispatchEvent('event:closeUserSwitchingModal')
        EkstepRendererAPI.hideEndPage();
        EkstepRendererAPI.dispatchEvent('renderer:content:replay');
    }

    $scope.closeUserSwitchingModal = function(logTelemetry) {
        if (logTelemetry) {
          TelemetryService.interact("TOUCH", "gc_userswitch_popup_close", "TOUCH", {
            stageId: EkstepRendererAPI.getCurrentStageId() ? EkstepRendererAPI.getCurrentStageId() : $rootScope.pageId
          });
        }
        EkstepRendererAPI.dispatchEvent('event:closeUserSwitchingModal');
    }

    $scope.initializeCtrl = function() {
        $rootScope.showUser = GlobalContext.config.overlay.showUser;
        $rootScope.enableUserSwitcher = GlobalContext.config.overlay.enableUserSwitcher;

        EventBus.addEventListener("event:enableUserSwitcher", function(value) {
            $rootScope.enableUserSwitcher = value.target;
        });

        EventBus.addEventListener("event:showUser", function(value) {
            $rootScope.showUser = value.target;
        });

        EventBus.addEventListener("event:openUserSwitchingModal", function() {
            $scope.showUserSwitchingModal();
        });

        EventBus.addEventListener("event:closeUserSwitchingModal", function() {
            $scope.hideUserSwitchingModal();
        });

        EventBus.addEventListener("event:getcurrentuser", function() {
            if (GlobalContext.config.overlay.showUser)
                currentUser = $rootScope.currentUser;
        });

        EventBus.addEventListener("event:getuserlist", function() {
            if (GlobalContext.config.overlay.showUser)
                userList = $rootScope.users;
        });

        EventBus.addEventListener("event:showuser", function(value) {
            GlobalContext.config.overlay.showUser = value;
            $rootScope.safeApply = function() {
                $rootScope.showUser = value;
            }
        });

        EventBus.addEventListener("event:enableUserSwitcher", function(value) {
            GlobalContext.config.overlay.enableUserSwitcher = value;
            $rootScope.safeApply = function() {
                $rootScope.enableUserSwitcher = value;
            }
        });

        if (_.isUndefined($rootScope.currentUser)) {
            org.ekstep.service.content.getCurrentUser().then(function(data) {
                console.log("getCurrentUser()", data);

                if (_.isEmpty(data.handle)) {
                    data.handle = "Anonymous";
                    data.profileImage = "assets/icons/avatar_anonymous.png";
                }
                $rootScope.currentUser = data;
                $rootScope.currentUser.selected = true;
                $scope.getUsersList();
            }).catch(function(err) {
                console.log(err);
            })
        } else {
            $scope.getUsersList();
        }
    }
}]);

app.compileProvider.directive('mute', function($rootScope) {
    return {
        restrict: 'E',
        template: '<div ng-click="toggleMute()"><img src="{{muteImg}}"/><span>Sound {{AppLables.mute}} </span></div>',
        link: function(scope, url) {
            $rootScope.$on('renderer:overlay:unmute', function() {
                scope.muteImg = scope.imageBasePath + "audio_icon.png";
                AppLables.mute = "on";
                AudioManager.unmute();
            });
            $rootScope.$broadcast('renderer:overlay:unmute');
            scope.toggleMute = function() {
                if (AudioManager.muted) {
                    AudioManager.unmute();
                    scope.muteImg = scope.imageBasePath + "audio_icon.png";
                    AppLables.mute = "on";
                } else {
                    AudioManager.mute();
                    scope.muteImg = scope.imageBasePath + "audio_mute_icon.png";
                    AppLables.mute = "off";
                }
                TelemetryService.interact("TOUCH", AudioManager.muted ? "gc_mute" : "gc_unmute", "TOUCH", {
                    stageId: Renderer.theme._currentStage
                });
            }
        }
    }
});

app.compileProvider.directive('reloadStage', function($rootScope) {
    return {
        restrict: 'E',
        template: '<span class="reload-stage" onclick="EventBus.dispatch(\'actionReload\')"><img id="reload_id" src="{{imageBasePath}}icn_replayaudio.png" style="width:100%;"/></span>'
    }
});

app.compileProvider.directive('menu', function($rootScope, $sce) {
    return {
        restrict: 'E',
        scope: false,
        link: function(scope) {
	        scope.getTemplate = function() {
                return scope.pluginInstance._menuTP;
			}
		},
	    template: "<div ng-include=getTemplate()></div>"
    }
});

app.compileProvider.directive('stageInstructions', function($rootScope) {
    return {
        restrict: 'E',
        template: '<div ng-class="{\'icon-opacity\' : !stageData.params.instructions}" ng-click="showInstructions()"><img ng-src="{{imageBasePath}}icn_teacher.png" style="z-index:2;" alt="note img"/><span> {{AppLables.instructions}} </span></div>',
        controller: function($scope, $rootScope) {
            $scope.stageInstMessage = "";
            $scope.showInst = false;

            $scope.showInstructions = function() {
                $scope.stageInstMessage = ($rootScope.stageData && $rootScope.stageData.params && $rootScope.stageData.params.instructions) ? $rootScope.stageData.params.instructions : null;

                $scope.showInst = ($scope.stageInstMessage != null) ? true : false;
                $scope.logIntract("gc_showInst");
            }

            $scope.closeInstructions = function() {
                $scope.showInst = false;
                $scope.logIntract("gc_closeInst");
            }

            $scope.logIntract = function(eleId) {
                TelemetryService.interact("TOUCH", eleId, "TOUCH", {
                    stageId: Renderer.theme._currentStage
                });
            }

            /*
             * If menu is getting hide, then hide teacher instructions as well
             */
            $scope.$watch("menuOpened", function() {
                if (!$rootScope.menuOpened) {

                    $scope.showInst = false;
                }
            });
        }
    }
});

app.compileProvider.directive('assess', function($rootScope) {
    return {
        restrict: 'E',
        scope: {
            image: '=',
            show: '='
        },
        template: '<a class="assess" ng-class="assessStyle" href="javascript:void(0);" ng-click="onSubmit()">{{showOverlaySubmit}} <!-- enabled --><img ng-src="{{image}}"/></a>',
        link: function(scope, element) {
            scope.labelSubmit = AppLables.submit;
        },
        controller: function($scope, $rootScope, $timeout) {
            $scope.isEnabled = false;
            $scope.assessStyle = 'assess-disable';

            $rootScope.$watch('enableEval', function() {
                $scope.isEnabled = $rootScope.enableEval;
                if ($scope.isEnabled) {
                    $timeout(function() {
                        // This timeout is required to apply the changes(because it is calling by JS)
                        $scope.assessStyle = 'assess-enable';
                        $scope.image = AppConfig.assetbase + "submit_enable.png";
                    }, 100);
                } else {
                    //Disable state
                    $scope.assessStyle = 'assess-disable';
                    $scope.image = AppConfig.assetbase + "submit_disable.png";
                }
            });

            $scope.onSubmit = function() {
                if ($scope.isEnabled) {
                    $rootScope.defaultSubmit();
                    EventBus.dispatch("submitClick");
                }
            }
        }
    }
});

app.compileProvider.directive('goodJob', function($rootScope) {
    return {
        restrict: 'E',
        template: '<div class="popup"><div class="popup-overlay" ng-click="hidePopup()"></div><div class="popup-full-body"><div class="font-lato assess-popup assess-goodjob-popup"><img class="popup-bg-img" ng-src="{{imageBasePath}}goodJobpop.png"/><div class="goodjob_next_div gc-popup-icons-div"><a href="javascript:void(0);" ng-click="hidePopup()"><img class="popup-goodjob-next " ng-src="{{ imageBasePath }}icon_popup_next_big.png" ng-click="moveToNextStage(\'next\')" /></a><p>{{AppLables.next}}</p></div></div></div></div>',
        controller: function($scope, $rootScope, $timeout) {
            $scope.retryAssessment = function(id, e) {
                $scope.hidePopup(id);
                EventBus.dispatch("retryClick");
            }

            $scope.hidePopup = function(id) {
                TelemetryService.interact("TOUCH", id ? id : "gc_popupclose", "TOUCH", {
                    stageId: ($rootScope.pageId == "endpage" ? "endpage" : $rootScope.stageId)
                });
                $scope.showOverlayGoodJob = false;
                $scope.showOverlayTryAgain = false;
            }

            $scope.moveToNextStage = function(navType) {
                EventBus.dispatch("actionNavigateSkip", navType);
                EventBus.dispatch("skipClick");
            }
        }
    }
});

app.compileProvider.directive('tryAgain', function($rootScope) {
    return {
        restrict: 'E',
        template: '<div class="popup"><div class="popup-overlay" ng-click="hidePopup()"></div><div class="popup-full-body"><div class="font-lato assess-popup assess-tryagain-popup"><img class="popup-bg-img" ng-src="{{imageBasePath}}tryagain_popup.png"/><div class="tryagain-retry-div gc-popup-icons-div"><a ng-click="retryAssessment(\'gc_retry\', $event);" href="javascript:void(0);"><img class="popup-retry" ng-src="{{imageBasePath}}icn_popup_replay.png" /></a><p class="gc-popup-retry-replay">{{AppLables.replay}}</p></div><div class="tryagian-next-div gc-popup-icons-div"><a href="javascript:void(0);" ng-click="hidePopup()"><img class="popup-retry-next" ng-src="{{ imageBasePath }}icn_popup_next_small.png" ng-click="moveToNextStage(\'skip\')" /></a><p>{{AppLables.next}}</p></div></div></div></div></div></div>'
    }
});

app.compileProvider.directive('userSwitcher', function($rootScope, $compile) {
	return {
		restrict: 'E',
		scope: {
			popupBody: '=popupBody'
		},
		controller: 'UserSwitchController',
		link: function(scope, element, attrs, controller) {
			// Get the modal
			var userSwitchingModal = element.find("#userSwitchingModal")[0];
			// userSwitchingModal.style.display = "block";

			// get the user selection div
			var userSlider = element.find("#userSlider");
			var groupSlider = element.find("#groupSlider");
			scope.render = function() {
				userSlider.mCustomScrollbar({
					axis: "x",
					theme: "dark-3",
					advanced: {
						autoExpandHorizontalScroll: true
					}
				});
				groupSlider.mCustomScrollbar({
					axis: "x",
					theme: "dark-3",
					advanced: {
						autoExpandHorizontalScroll: true
					}
				});
			}
			scope.getTemplate = function() {
                var pluginsObjs = EkstepRendererAPI.getPluginObjs("org.ekstep.overlay");
                return pluginsObjs._userSwitcherTP;
            }
			scope.init = function() {
				if (GlobalContext.config.overlay.showUser === true) {
					userSlider.mCustomScrollbar('destroy');
					groupSlider.mCustomScrollbar('destroy');
					scope.initializeCtrl();
					scope.render();
				}
			}();
		},
        template: "<div ng-include=getTemplate()></div>"
	}
});

//#sourceURL=overlay.js
