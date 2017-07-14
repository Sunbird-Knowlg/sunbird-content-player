/**
 * User switcher controller 
 * @author Akash Gupta <akash.gupta@tarento.com>
 */
app.controllerProvider.register('UserSwitchController', ['$scope', '$rootScope', '$state', '$stateParams', function($scope, $rootScope, $state, $stateParams) {
    $scope.groupLength = undefined;
    $scope.selectedUser = {};
    $scope.showUserSwitchModal = false;
    $scope.imageBasePath = globalConfig.assetbase;

    $scope.getUserSwitcherTemplate = function() {
        var userSwitcherPluginInstance = EkstepRendererAPI.getPluginObjs("org.ekstep.userswitcher");
        return userSwitcherPluginInstance._templatePath;
    }

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
                    if (userSwitchHappened) {
                        var version = TelemetryService.getGameVer();;
                        var gameId = TelemetryService.getGameId();
                        TelemetryService.interrupt("SWITCH", EkstepRendererAPI.getCurrentStageId() ? EkstepRendererAPI.getCurrentStageId() : $rootScope.pageId);
                        TelemetryService.end(logContentProgress());
                        TelemetryService.setUser($rootScope.currentUser, EkstepRendererAPI.getCurrentStageId() ? EkstepRendererAPI.getCurrentStageId() : $rootScope.pageId);
                        var data = {};
                        data.stageid = EkstepRendererAPI.getCurrentStageId() ? EkstepRendererAPI.getCurrentStageId() : $rootScope.pageId;
                        data.mode = getPreviewMode();
                        TelemetryService.start(gameId, version, data);
                    }

                });
            }).catch(function(err) {
                console.log(err);
            })
        }
        if (replayContent == true) {
             var data = {
                'callback': $scope.replayCallback
            };
            TelemetryService.interrupt("SWITCH", EkstepRendererAPI.getCurrentStageId() ? EkstepRendererAPI.getCurrentStageId() : $rootScope.pageId);
            EkstepRendererAPI.dispatchEvent('renderer:content:close', undefined, data);
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
        var globalConfig = EkstepRendererAPI.getGlobalConfig();
        $rootScope.showUser = globalConfig.overlay.showUser;
        $rootScope.enableUserSwitcher = globalConfig.overlay.enableUserSwitcher;

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
            if (globalConfig.overlay.showUser)
                currentUser = $rootScope.currentUser;
        });

        EventBus.addEventListener("event:getuserlist", function() {
            if (globalConfig.overlay.showUser)
                userList = $rootScope.users;
        });

        EventBus.addEventListener("event:showuser", function(value) {
            globalConfig.overlay.showUser = value;
            $rootScope.safeApply = function() {
                $rootScope.showUser = value;
            }
        });

        EventBus.addEventListener("event:enableUserSwitcher", function(value) {
            globalConfig.overlay.enableUserSwitcher = value;
            $rootScope.safeApply = function() {
                $rootScope.enableUserSwitcher = value;
            }
        });

        if (_.isUndefined($rootScope.currentUser)) {
            org.ekstep.service.content.getCurrentUser().then(function(data) {
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

