
/**
 * User switcher controller
 * @author Gourav More <gourav_m@tekditechnologies.com> Akash Gupta <akash.gupta@tarento.com>
 */

app.controllerProvider.register('SunbirdUserSwitchController', ['$scope','$rootScope','$state','$stateParams',function($scope, $rootScope, $state, $stateParams) {
        $scope.selectedUser = {};
        $scope.json = {};
        $scope.playButton = 'Replay';
        $scope.showSunbirdUserSwitchModal = false;
        $scope.hideUserSwitchingModal = function() {
            $rootScope.safeApply(function() {
                EkstepRendererAPI.removeEventListener(EkstepRendererEvents['renderer:device:back'], $scope.hideUserSwitchingModal, $scope);
                $scope.showSunbirdUserSwitchModal = false;
            });
        }

        $scope.showUserSwitchingModal = function() {
            if ($scope.showSunbirdUserSwitchModal)
                return;
            TelemetryService.interact("TOUCH", "gc_userswitch_popup_open", "TOUCH", {
                stageId: EkstepRendererAPI.getCurrentStageId()? EkstepRendererAPI.getCurrentStageId() : $rootScope.pageId 
            },$scope.TelemetryEvent.interact);
            EkstepRendererAPI.addEventListener(EkstepRendererEvents['renderer:device:back'], $scope.hideUserSwitchingModal, $scope);
            _.each($rootScope.users, function(user) {
                if (user.selected === true)
                    user.selected = false;
                if (user.uid === $rootScope.currentUser.uid)
                    user.selected = true;
                }
            );
            $scope.playButton = 'Replay';
            $scope.sortUserlist();
            $rootScope.safeApply(function() {
                $scope.showSunbirdUserSwitchModal = true;
            });
        }

        $scope.getUsersList = function() {
            if(Object.keys(globalConfig.context).length == 0){
                $.getJSON("assets/sb_user_list/sb_user_list.json",function(data){
                    $rootScope.users = data;
                });
            }else{
                $rootScope.users = getGlobalConfig.context;
            }
            $scope.sortUserlist();
        }

        $scope.sortUserlist = function() {
            $rootScope.users = _.sortBy(_.sortBy($rootScope.users, 'handle'), 'userIndex');
        }

        // this function changes the selected user
        $scope.selectUser = function(selectedUser) {
            // here the user Selection is happening
            _.each($rootScope.users, function(user) {
                if (user.selected === true)
                    user.selected = false;
                }
            );
            TelemetryService.interact("TOUCH", selectedUser.uid, "TOUCH", {
                stageId: EkstepRendererAPI.getCurrentStageId() ? EkstepRendererAPI.getCurrentStageId() : $rootScope.pageId
            }, $scope.TelemetryEvent.interact);
            selectedUser.selected = true;
            $scope.selectedUser = selectedUser;
            $scope.playButton = 'Play';

        }

        // When the user clicks on replayContent, replayContent the content
        $scope.replayContent = function() {
            var replayContent = true;
            TelemetryService.interact("TOUCH", 'gc_userswitch_replayContent', "TOUCH", {
                stageId: EkstepRendererAPI.getCurrentStageId() ? EkstepRendererAPI.getCurrentStageId() : $rootScope.pageId
            }, $scope.TelemetryEvent.interact);
            if (_.isEmpty($scope.selectedUser)) {
                EkstepRendererAPI.dispatchEvent('renderer:content:close');
                EkstepRendererAPI.dispatchEvent('renderer:content:replay');
                $scope.closeUserSwitchingModal(false);
                EkstepRendererAPI.hideEndPage();
            } else {
                $scope.switchUser(replayContent);
            }
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
                            var version = TelemetryService.getGameVer();
                            var gameId = TelemetryService.getGameId();
                            if (replayContent == true) {
                                var data = {
                                    'callback': $scope.replayCallback
                                };
                                if (_.isUndefined($scope.TelemetryEvent.logGEEvent)) {
                                    TelemetryService.interrupt("SWITCH", EkstepRendererAPI.getCurrentStageId()
                                        ? EkstepRendererAPI.getCurrentStageId()
                                        : $rootScope.pageId);
                                }
                                EkstepRendererAPI.dispatchEvent('renderer:content:close', undefined, data);
                            } else {
                                if (_.isUndefined($scope.TelemetryEvent.logGEEvent)) {
                                    TelemetryService.interrupt("SWITCH", EkstepRendererAPI.getCurrentStageId()
                                        ? EkstepRendererAPI.getCurrentStageId()
                                        : $rootScope.pageId);
                                }
                                EkstepRendererAPI.dispatchEvent('renderer:telemetry:end');
                                TelemetryService.setUser($rootScope.currentUser, EkstepRendererAPI.getCurrentStageId()
                                    ? EkstepRendererAPI.getCurrentStageId()
                                    : $rootScope.pageId, $scope.TelemetryEvent.interact);
                                if (EkstepRendererAPI.getCurrentStageId()) { // If stage id is not available that means user is on Endpage.
                                    var data = {};
                                    data.stageid = EkstepRendererAPI.getCurrentStageId()
                                        ? EkstepRendererAPI.getCurrentStageId()
                                        : $rootScope.pageId;
                                    data.mode = getPreviewMode();
                                    TelemetryService.start(gameId, version, data);
                                }
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
            TelemetryService.setUser($rootScope.currentUser, EkstepRendererAPI.getCurrentStageId()
                ? EkstepRendererAPI.getCurrentStageId()
                : $rootScope.pageId, $scope.TelemetryEvent.interact);
            $scope.hideUserSwitchingModal();
            EkstepRendererAPI.dispatchEvent('renderer:endpage:hide');
            EkstepRendererAPI.dispatchEvent('renderer:content:replay');
        }

        $scope.closeUserSwitchingModal = function(logTelemetry) {
            if (logTelemetry) {
                TelemetryService.interact("TOUCH", "gc_userswitch_popup_close", "TOUCH", {
                    stageId: EkstepRendererAPI.getCurrentStageId()
                        ? EkstepRendererAPI.getCurrentStageId()
                        : $rootScope.pageId
                }, $scope.TelemetryEvent.interact);
            }
            $scope.hideUserSwitchingModal();
        }

        $scope.initializeCtrl = function() {
            var globalConfig = EkstepRendererAPI.getGlobalConfig();
            $rootScope.showUser = globalConfig.overlay.showUser;
            $rootScope.enableUserSwitcher = globalConfig.overlay.enableUserSwitcher;

            EventBus.addEventListener("event:showUser", function(value) {
                $rootScope.showUser = value.target;
            });

            EventBus.addEventListener("event:openUserSwitchingModal", function(data) {
                $scope.TelemetryEvent = {};
                if (data && data.target && data.target.logGEEvent) {
                    $scope.TelemetryEvent = {
                        'interact': 'GE_INTERACT',
                        'logGEEvent': true
                    };
                }
                $scope.showUserSwitchingModal();
            });

            /**
             * event:getcurrentuser Event to get the current user being playing the content.
             * @event event:getcurrentuser
             * @listen event:getcurrentuser
             * @memberOf EkstepRendererEvents
             */
            EventBus.addEventListener("event:getcurrentuser", function() {
                currentUser = $rootScope.currentUser;
            });

            /**
             * event:getuserlist Event to get the user list.
             * @event event:getuserlist
             * @listen event:getuserlist
             * @memberOf EkstepRendererEvents
             */
            EventBus.addEventListener("event:getuserlist", function() {
                userList = $rootScope.users;
            });

            /**
             * event:showuser Event to show the user icon.
             * @event event:showuser
             * @listen event:showuser
             * @memberOf EkstepRendererEvents
             */
            EventBus.addEventListener("event:showuser", function(value) {
                $rootScope.safeApply = function() {
                    $rootScope.showUser = value;
                }
            });

            /**
             * event:enableUserSwitcher Event to enable the userswitcher.
             * @event event:enableUserSwitcher
             * @listen event:enableUserSwitcher
             * @memberOf EkstepRendererEvents
             */
            EventBus.addEventListener("event:enableUserSwitcher", function(value) {
                $rootScope.safeApply = function() {
                    $rootScope.enableUserSwitcher = value.target;
                }
            });

            if (_.isUndefined($rootScope.currentUser)) {
                org.ekstep.service.content.getCurrentUser().then(function(data) {
                    if (_.isEmpty(data.handle)) {
                        data.handle = "Anonymous";
                        data.profileImage = "assets/icons/avatar_1anonymous.png";
                    }
                    /*
                 * Have an empty check for image validation
                 * If image is not available at the given path, replace the image with "avatar_anonymous" image
                 */
                    var imageUrl = data.profileImage;
                    imageExists(imageUrl, function(exists) {
                        if (exists === false)
                            data.profileImage = "assets/icons/avatar_anonymous.png"
                        console.log('RESULT: url=' + imageUrl + ', exists=' + exists);
                    });

                    $rootScope.currentUser = data;
                    $rootScope.currentUser.selected = true;
                    $scope.getUsersList();
                    $rootScope.safeApply();
                }).catch(function(err) {
                    console.log(err);
                })
            } else {
                $scope.getUsersList();
                $rootScope.safeApply();
            }
        }
    }
]);

app.compileProvider.directive('sunbirdUserswitcher', function($rootScope, $compile) {
    return {
        restrict: 'E',
        controller: 'SunbirdUserSwitchController',
        template: "<div ng-include='getUserSwitcherTemplate()' ></div>",
        link: function(scope, element, attrs, controller) {
            scope.initializeUser = function(evt, cityName) {
                var i, tabcontent, tablinks;
                tabcontent = document.getElementsByClassName("tabcontent");
                for (i = 0; i < tabcontent.length; i++) {
                    tabcontent[i].style.display = "none";
                }
                tablinks = document.getElementsByClassName("tablinks");
                for (i = 0; i < tablinks.length; i++) {
                    tablinks[i].className = tablinks[i].className.replace(" active", "");
                }
                document.getElementById(cityName).style.display = "block";
                evt.currentTarget.className += " active";
            }

            scope.init = function() {
                scope.initializeCtrl();
                var users = document.getElementById('usersButton');
                scope.initializeUser({currentTarget: users}, 'users');
                scope.safeApply();
            };

            scope.getUserSwitcherTemplate = function() {
                var userSwitcherPluginInstance = EkstepRendererAPI.getPluginObjs("org.sunbird.player.userswitcher");
                return userSwitcherPluginInstance._templatePath;
            }
        }
    }
});
