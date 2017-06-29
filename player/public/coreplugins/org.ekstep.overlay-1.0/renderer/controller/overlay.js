'use strict';

//var test1 = org.ekstep.pluginframework.pluginManager.resolvePluginResource(this._manifest.id, this._manifest.ver, "renderer/templates/user-switch-popup.html");

// var test1 = "templates/user-switch-popup.html";

app.controllerProvider.register("OverlayController", function($scope, $rootScope, $compile, $stateParams) {
    $rootScope.isItemScene = false;
    $rootScope.menuOpened = false;
    $rootScope.stageId = undefined;
    $scope.state_off = "off";
    $scope.state_on = "on";
    $scope.state_disable = "disable";
    $scope.showOverlayNext = true;
    $scope.showOverlayPrevious = true;
    $scope.showOverlaySubmit = false;
    $scope.showOverlayGoodJob = false;
    $scope.showOverlayTryAgain = false;
    $scope.overlayEvents = ["overlayNext", "overlayPrevious", "overlaySubmit", "overlayMenu", "overlayReload", "overlayGoodJob", "overlayTryAgain"];
    $scope.showOverlay = false;

    $scope.init = function() {
        if (GlobalContext.config.language_info) {
            var languageInfo = JSON.parse(GlobalContext.config.language_info);
            for (key in languageInfo) {
                $rootScope.languageSupport[key] = languageInfo[key];
            }
        }
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
        EkstepRendererAPI.addEventListener("renderer:show:overlay", function(event) {
            $scope.showOverlay = true;
            $scope.safeApply();
        });
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
        /*gameArea.append("<div ng-include="+ this.templatePath+">");
        $compile(gameArea)($scope);*/
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
            case "overlayNext":
                $scope.showOverlayNext = event.target;
                break;
            case "overlayPrevious":
                $scope.showOverlayPrevious = event.target;
                break;
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
    $scope.init();
});

app.controllerProvider.register('UserSwitchController', ['$scope', '$rootScope', '$state', '$stateParams', function($scope, $rootScope, $state, $stateParams) {
    $scope.groupLength = undefined;
    $scope.selectedUser = {};
    $scope.showUserSwitchModal = false;

    $scope.hideUserSwitchingModal = function() {
        TelemetryService.interact("TOUCH", "gc_userswitch_popup_close", "TOUCH", {
            stageId: EkstepRendererAPI.getCurrentStageId() ? EkstepRendererAPI.getCurrentStageId() : $rootScope.pageId
        });
        $rootScope.safeApply(function() {
            $scope.showUserSwitchModal = false;
        });
    }

    $scope.showUserSwitchingModal = function() {
        if ($rootScope.userSwitcherEnabled) {
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
        $scope.switchUser(replayContent);
    }

    // When the user clicks on Continue, Continue the content from there
    $scope.continueContent = function() {
        // here the user Selection happens
        var replayContent = false;
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
                });
            }).catch(function(err) {
                console.log(err);
            })
        }
        $scope.hideUserSwitchingModal();
        replayContent == true ? $rootScope.us_replayContent() : $rootScope.us_continueContent(userSwitchHappened);
    }

    $scope.initializeCtrl = function() {
        $rootScope.showUser = GlobalContext.config.showUser;
        $rootScope.userSwitcherEnabled = GlobalContext.config.userSwitcherEnabled;

        EventBus.addEventListener("event:userSwitcherEnabled", function(value) {
            $rootScope.userSwitcherEnabled = value.target;
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
            if (GlobalContext.config.showUser)
                currentUser = $rootScope.currentUser;
        });

        EventBus.addEventListener("event:getuserlist", function() {
            if (GlobalContext.config.showUser)
                userList = $rootScope.users;
        });

        EventBus.addEventListener("event:showuser", function(value) {
            GlobalContext.config.showUser = value;
            $rootScope.safeApply = function() {
                $rootScope.showUser = value;
            }
        });

        EventBus.addEventListener("event:userswitcherenabled", function(value) {
            GlobalContext.config.userSwitcherEnabled = value;
            $rootScope.safeApply = function() {
                $rootScope.userSwitcherEnabled = value;
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

app.compileProvider.directive('userSwitcher', function($rootScope, $compile) {
	return {
		restrict: 'E',
		scope: {
			popupBody: '=popupBody'
		},
		controller: 'UserSwitchController',
		// templateUrl: org.ekstep.pluginframework.pluginManager.resolvePluginResource("org.ekstep.overlay", "1.0", "renderer/templates/user-switch-popup.html"),
		// templateUrl: 'templates/user-switch-popup.html',
		link: function(scope, element, attrs, controller) {
			// Get the modal
			var userSwitchingModal = element.find("#userSwitchingModal")[0];
			// userSwitchingModal.style.display = "block";

			// get the user selection div0
            // _templateUrl = org.ekstep.pluginframework.pluginManager.resolvePluginResource("org.ekstep.overlay", "1.0", "renderer/templates/user-switch-popup.html");

            // var qw = org.ekstep.pluginframework.pluginManager.resolvePluginResource("org.eskstep.overlay", "1.0", "renderer/templates/user-switch-popup.html");
            // console.log("_templateUrl: ", _templateUrl);
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

            scope.getTemplateUrl = function() {
                // var _templateUrl = org.ekstep.pluginframework.pluginManager.resolvePluginResource("org.ekstep.overlay", "1.0", "renderer/templates/user-switch-popup.html");
                // console.log("_templateUrl: ", _templateUrl);
                // return _templateUrl;
            }

			scope.init = function() {
				if (GlobalContext.config.showUser === true) {
					userSlider.mCustomScrollbar('destroy');
					groupSlider.mCustomScrollbar('destroy');
					scope.initializeCtrl();
					scope.render();
				}
			}();
		},
        template: "<div ng-include=getTemplateUrl()></div>"

	}
});
//#sourceURL=overlay.js
