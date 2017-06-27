// Ionic Quiz App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'quiz' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('genie-canvas', ['ionic', 'ngCordova', 'oc.lazyLoad'])
    .constant("appConstants", {"contentId": "contentId", "stateContentList": "contentList", "stateShowContent": "showContent", "statePlayContent": "playContent", "stateShowContentEnd": "showContentEnd"})
    .run(function($rootScope, $ionicPlatform, $location, $timeout, $state, $stateParams, appConstants) {
        $rootScope.imageBasePath = "assets/icons/";
        $rootScope.enableEval = false;
        $rootScope.userSwitcherEnabled = undefined;
        $rootScope.showUser = undefined;
        $rootScope.sortingIndex = 0;
        $rootScope.users = [];
        // serverPath and localPreview is a global variable defined in index.html file inside a story
        if ("undefined" != typeof localPreview && "local" == localPreview)
            $rootScope.imageBasePath = serverPath + $rootScope.imageBasePath;
        $rootScope.languageSupport = AppLables;
        $rootScope.safeApply = function(fn) {
            var phase = this.$root.$$phase;
            if (phase == '$apply' || phase == '$digest') {
                if (fn && (typeof(fn) === 'function')) {
                    fn();
                }
            } else {
                this.$apply(fn);
            }
        };
        $rootScope.addIonicEvents = function() {
            $ionicPlatform.onHardwareBackButton(function() {
                backbuttonPressed($rootScope.pageId);
            });
            $ionicPlatform.on("pause", function() {
                Renderer.pause();
            });
            $ionicPlatform.on("resume", function() {
                Renderer.resume();
            });
        };
        $timeout(function() {
            $ionicPlatform.ready(function() {
                isMobile = window.cordova ? true : false,
                    console.log('ionic platform is ready...');
                org.ekstep.service.init();
                if ("undefined" == typeof Promise) {
                    alert("Your device isn’t compatible with this version of Genie.");
                    exitApp();
                }
                $rootScope.addIonicEvents();
                if (window.cordova && window.cordova.plugins.Keyboard) {
                    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                } else {
                    AppConfig.recorder = "android";
                }
                window.StatusBar && StatusBar.styleDefault();
                GlobalContext.init(packageName, version).then(function(appInfo) {
                    if ("undefined" != typeof localPreview && "local" == localPreview)
                        return;
                    if (!isbrowserpreview) {
                        localStorageGC.setItem("contentExtras", GlobalContext.game.contentExtras);
                        org.ekstep.contentrenderer.device();
                    }
                }).catch(function(res) {
                    console.log("Error Globalcontext.init:", res);
                    EkstepRendererAPI.logErrorEvent(res, {
                        'type': 'system',
                        'severity': 'fatal',
                        'action': 'play'
                    })
                    alert(res.errors);
                    exitApp();
                });
            });

        });
    }).config(function($stateProvider, $urlRouterProvider, $controllerProvider, $compileProvider) {
        $stateProvider
            .state('contentList', {
                cache: false,
                url: "/content/list/:id",
                templateUrl: "templates/content-list.html",
                controller: 'ContentListCtrl'
            })
            .state('playContent', {
                cache: false,
                url: "/play/content/:itemId",
                templateUrl: "templates/renderer.html",
                controller: 'ContentCtrl'
            })
    }).controller('BaseCtrl', function($scope, $rootScope, $state, $ocLazyLoad, $stateParams, appConstants) {
        $rootScope.replayContent = function() {
            $scope.endContent('gc_replay');
            $scope.startContent();
        }
        $scope.endContent = function(eleId) {
            if (!$rootScope.content) {
                org.ekstep.contentrenderer.getContentMetadata($stateParams.itemId);
            }
            $rootScope.pageTitle = $rootScope.content.name;
            org.ekstep.contentrenderer.progressbar(true);
            if (!_.isUndefined(Renderer) && Renderer.theme) {
                TelemetryService.interact("TOUCH", eleId, "TOUCH", {
                    stageId: EkstepRendererAPI.getCurrentStageId() ? EkstepRendererAPI.getCurrentStageId() : $rootScope.pageId
                });
            }
            if (eleId === 'gc_userswitch_replayContent') {
                TelemetryService.interrupt("SWITCH", EkstepRendererAPI.getCurrentStageId() ? EkstepRendererAPI.getCurrentStageId() : $rootScope.pageId);
            }
            var menuReplay = $state.current.name == appConstants.statePlayContent;
            org.ekstep.contentrenderer.progressbar(false);
            // 1) For HTML content onclick of replay EventListeners will be not available hence calling Telemetryservice end .
            // 2) OE_START for the HTML/ECML content will be takne care by the contentctrl rendere method always.
            EventBus.hasEventListener('actionReplay') ? EventBus.dispatch('actionReplay', {
                'menuReplay': menuReplay
            }) : TelemetryService.end();
        }
        $scope.startContent = function() {
            if ($state.current.name == appConstants.stateShowContentEnd) {
                $state.go(appConstants.statePlayContent, {
                    'itemId': $rootScope.content.identifier
                });
            }
        }
        $rootScope.us_replayContent = function() {
            $scope.endContent('gc_userswitch_replayContent');
            var stageId =
                TelemetryService.setUser($rootScope.currentUser, EkstepRendererAPI.getCurrentStageId() ? EkstepRendererAPI.getCurrentStageId() : $rootScope.pageId);

            EventBus.dispatch('event:closeUserSwitchingModal')
            jQuery("#pluginTemplate").hide();
            $scope.startContent();
        }
        $rootScope.us_continueContent = function(userSwitchHappened) {
            TelemetryService.interact("TOUCH", 'gc_userswitch_continue', "TOUCH", {
                stageId: EkstepRendererAPI.getCurrentStageId() ? EkstepRendererAPI.getCurrentStageId() : $rootScope.pageId
            });
            if (userSwitchHappened) {
                var version = TelemetryService.getGameVer();;
                var gameId = TelemetryService.getGameId();
                TelemetryService.interrupt("SWITCH", EkstepRendererAPI.getCurrentStageId() ? EkstepRendererAPI.getCurrentStageId() : $rootScope.pageId);

                TelemetryService.end();
                TelemetryService.setUser($rootScope.currentUser, EkstepRendererAPI.getCurrentStageId() ? EkstepRendererAPI.getCurrentStageId() : $rootScope.pageId);
                var data = {};
                data.mode = getPreviewMode();
                TelemetryService.start(gameId, version, data);
            }
        }
        $scope.templates = "";

        function loadNgModules(templatePath, controllerPath) {
            $ocLazyLoad.load([{
                type: 'html',
                path: templatePath
            }, {
                type: 'js',
                path: controllerPath
            }]);
        };
        function injectTemplates(templatePath, place) {
            $scope.safeApply(function() {
                $scope.templates = templatePath + "?a=" + Date.now();
            });
        }
        org.ekstep.service.controller.initService(loadNgModules);
        org.ekstep.service.controller.injectTemplate(injectTemplates);
        EkstepRendererAPI.addEventListener("event:loadContent", function() {
            var configuration = EkstepRendererAPI.getPreviewData();
            content.metadata = (_.isUndefined(configuration.metadata) || _.isNull(configuration.metadata)) ? defaultMetadata : configuration.metadata
            if (_.isUndefined(configuration.data)) {
                org.ekstep.contentrenderer.web(configuration.context.contentId);
            } else {
                content.body = configuration.data;
                console.info("Content id is undefined or body is available !!");
                var $state = angular.element(document.body).injector().get('$state')
                updateContentData($state, content.metadata.identifier)
            }
        }, this);
    }).controller('ContentListCtrl', function($scope, $rootScope, $state, $stateParams) {
        /* contentListCtrl for the localDevelopment*/
        $rootScope.pageId = 'ContentApp-Collection';
        $scope.version = GlobalContext.game.ver;
        $rootScope.stories = [];
        $rootScope.showMessage = false;

        $rootScope.$on('show-message', function(event, data) {
            if (data.message && data.message != '') {
                $rootScope.$apply(function() {
                    $rootScope.showMessage = true;
                    $rootScope.message = data.message;
                });
            }
            if (data.timeout) {
                setTimeout(function() {
                    $rootScope.$apply(function() {
                        $rootScope.showMessage = false;
                    });
                    if (data.callback) {
                        data.callback();
                    }
                }, data.timeout);
            }
        });

        $rootScope.renderMessage = function(message, timeout, reload) {
            $rootScope.$broadcast('show-message', {
                "message": message,
                "timeout": timeout
            });
        }

        $scope.resetContentListCache = function() {
            org.ekstep.contentrenderer.progressbar(false)
            var collectionContentId = $stateParams.id;
            $rootScope.renderMessage("", 0);
            org.ekstep.service.content.getContent(collectionContentId)
                .then(function(content) {
                    GlobalContext.previousContentId = content.identifier;
                    if (!_.findWhere(collectionPath, {
                            identifier: collectionContentId
                        }))
                        collectionPath.push({
                            identifier: content.identifier,
                            mediaType: "Collection"
                        });

                    if (collectionPathMap[content.identifier]) {
                        var pathArr = collectionPathMap[content.identifier];
                        if (pathArr[pathArr.length - 1].mediaType.toLowerCase() == "content") {
                            collectionPath = pathArr;
                            collectionPath.pop()
                        } else {
                            collectionPath = pathArr;
                        }
                    }
                    if (!_.contains(stack, content.identifier))
                        stack.push(content.identifier);
                    if (COLLECTION_MIMETYPE == content.mimeType) {
                        $rootScope.title = content.name;
                        $rootScope.collection = content;
                        localStorageGC.setItem("collection", $rootScope.collection);
                        TelemetryService.start(content.identifier, content.pkgVersion);
                    } else {
                        $rootScope.collection = {};
                    }
                    var childrenIds = (content.children) ? _.pluck(_.sortBy(content.children, function(child) {
                        return child.index;
                    }), "identifier") : null;
                    if (childrenIds)
                        collectionChildrenIds = childrenIds;
                    collectionChildren = true;
                    var filter = (content.filter) ? JSON.parse(content.filter) : content.filter;
                    return org.ekstep.service.content.getContentList(filter, childrenIds);
                })
                .then(function(result) {
                    $rootScope.$apply(function() {
                        $rootScope.stories = result;
                    });
                    if ($rootScope.stories && $rootScope.stories.length <= 0) {
                        $rootScope.renderMessage(AppMessages.NO_CONTENT_LIST_FOUND);
                    }
                })
                .catch(function(err) {
                    $rootScope.$apply(function() {
                        $rootScope.stories = [];
                    });
                    console.error(err);
                    $rootScope.renderMessage(AppMessages.ERR_GET_CONTENT_LIST, 3000);
                });
        };
        $scope.playContent = function(content) {
            $rootScope.content = content;
            if (content.mimeType == COLLECTION_MIMETYPE) {
                console.info("collection nat handled")
            } else {
                GlobalContext.currentContentId = content.identifier;
                GlobalContext.currentContentMimeType = content.mimeType;
                collectionPath.push({
                    identifier: content.identifier,
                    mediaType: "Content"
                });
                $state.go('playContent', {
                    'itemId': content.identifier
                });
            }
        };
        $scope.simulateCrash = function(fatal) {
            if (navigator.crashlytics) {
                if (fatal === true) {
                    console.log("Simulating fatal crash for Crashlytics");
                    navigator.crashlytics.simulateCrash("Simulated crash");
                } else {
                    console.log("Simulating non-fatal error for Crashlytics");
                    navigator.crashlytics.logException("Simulated non-fatal error");
                }
                console.log("Simulation sent to Crashlytics");
            } else {
                console.log("Crashlytics not available for reporting");
            }
        };

        $scope.exitApp = function() {
            exitApp();
        };
        $scope.init = function() {
            $rootScope.title = GlobalContext.config.appInfo ? GlobalContext.config.appInfo.name : "";
            $scope.resetContentListCache();
        };
        $scope.init();
    }).controller('ContentCtrl', function($scope, $rootScope, $state, $stateParams) {
        $rootScope.pageId = "ContentApp-Renderer";
        $scope.init = function() {
            if (_.isUndefined($rootScope.content)) {
                if (!_.isUndefined(content.metadata)) {
                    $rootScope.content = content.metadata;
                    $scope.renderContent();
                }else{
                    console.info('contentMetada is undefined');
                }

            } else {
                $scope.renderContent();
            }
        }
        $scope.callStartTelemetry = function(content, cb) {
            var identifier = (content && content.identifier) ? content.identifier : null;
            var pkgVersion = !_.isUndefined(content.pkgVersion) ? content.pkgVersion.toString() : null;
            var version = (content && pkgVersion) ? pkgVersion : "1";
            startTelemetry(identifier, version, cb);
        }
        $scope.renderContent = function() {
            //EkstepRendererAPI.dispatchEvent('renderer:launcher:initLauncher');
            if ($stateParams.itemId && $rootScope.content) {
                localStorageGC.setItem("content", $rootScope.content);
                $rootScope.pageTitle = $rootScope.content.name;
                org.ekstep.contentrenderer.progressbar(true);
                GlobalContext.currentContentId = _.isUndefined(GlobalContext.currentContentId) ? $rootScope.content.identifier : GlobalContext.currentContentId;
                $scope.callStartTelemetry($rootScope.content, function() {
                    $scope.item = $rootScope.content;
                    $scope.callStartTelemetry($rootScope.content, function() {
                        $rootScope.content.body = isbrowserpreview ? getContentObj(content) : undefined;
                        EkstepRendererAPI.dispatchEvent('renderer:launcher:initLauncher', undefined, $rootScope.content);
                    });
                });
            } else {
                alert('Name or Launch URL not found.');
                exitApp();
            }

        }
        $scope.reloadStage = function() {
            reloadStage();
        }

        $scope.$on('$destroy', function() {})
        $rootScope.showMessage = false;
        $rootScope.$on('show-message', function(event, data) {
            if (data.message && data.message != '') {
                $rootScope.$apply(function() {
                    $rootScope.showMessage = true;
                    $rootScope.message = data.message;
                });
            }
            if (data) {
                setTimeout(function() {
                    $rootScope.$apply(function() {
                        $rootScope.showMessage = false;
                    });
                }, 5000);
            }
        });

        // This is to fix FTB preview issue of causing by Ionic and Angular combination
        // childnodes error causing by ionic framework whiel rendering FTB item
        // reference: http://stackoverflow.com/questions/27776174/type-error-cannot-read-property-childnodes-of-undefined
        setTimeout(function() {
            $scope.init();
        }, 0);
    }).controller('OverlayCtrl', function($scope, $rootScope, $stateParams) {
        $rootScope.isItemScene = false;
        $rootScope.menuOpened = false;
        $rootScope.stageId = undefined;
        EventBus.addEventListener("sceneEnter", function(data) {
            $rootScope.stageData = data.target;
            //TODO: Remove this currentStage parameter and use directly stageData._currentStage
            $rootScope.stageId = !_.isUndefined($rootScope.stageData) ? $rootScope.stageData._id : undefined;
        });

        $scope.state_off = "off";
        $scope.state_on = "on";
        $scope.state_disable = "disable";

        $scope.showOverlayNext = true;
        $scope.showOverlayPrevious = true;
        $scope.showOverlaySubmit = false;
        $scope.showOverlayGoodJob = false;
        $scope.showOverlayTryAgain = false;
        $scope.overlayEvents = ["overlayNext", "overlayPrevious", "overlaySubmit", "overlayMenu", "overlayReload", "overlayGoodJob", "overlayTryAgain"];

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

        $scope.navigate = function(navType) {
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

        $scope.init = function() {
            if (GlobalContext.config.languageInfo) {
                console.log("Language updated", GlobalContext.config.languageInfo);
                var languageInfo = JSON.parse(GlobalContext.config.languageInfo);
                for (key in languageInfo) {
                    $rootScope.languageSupport[key] = languageInfo[key];
                }
            }

            var evtLenth = $scope.overlayEvents.length;
            for (i = 0; i < evtLenth; i++) {
                var eventName = $scope.overlayEvents[i];
                EventBus.addEventListener(eventName, $scope.overlayEventHandler, $scope);
            }
        }

        $scope.overlayEventHandler = function(event) {
            // console.log("Event", event);
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
    }).controller('userSwitchCtrl', ['$scope', '$rootScope', '$state', '$stateParams', function($scope, $rootScope, $state, $stateParams) {
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
    }]).directive('menu', function($rootScope, $sce) {
        return {
            restrict: 'E',
            templateUrl: ("undefined" != typeof localPreview && "local" == localPreview) ? $sce.trustAsResourceUrl(serverPath + 'templates/menu.html') : 'templates/menu.html'
        }
    }).directive('fallbackSrc', function() {
        return {
            restrict: 'AE',
            link: function postLink(scope, iElement, iAttrs) {
                iElement.bind('error', function() {
                    angular.element(this).attr("src", iAttrs.fallbackSrc);
                });
            }
        }
    }).directive('stageInstructions', function($rootScope) {
        return {
            restrict: 'E',
            template: '<div ng-class="{\'icon-opacity\' : !stageData.params.instructions}" ng-click="showInstructions()"><img ng-src="{{imageBasePath}}icn_teacher.png" style="z-index:2;" alt="note img"/><span> {{languageSupport.instructions}} </span></div>',
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
    }).directive('mute', function($rootScope) {
        return {
            restrict: 'E',
            template: '<div ng-click="toggleMute()"><img src="{{muteImg}}"/><span>Sound {{languageSupport.mute}} </span></div>',
            link: function(scope, url) {
                var muteElement = document.getElementById("unmute_id");
                scope.muteImg = $rootScope.imageBasePath + "audio_icon.png";
                // scope muteImg = $rootScope.imageBasePath + icn_replay.png;
                if (!_.isNull(muteElement)) {
                    muteElement.style.display = "none";
                }
                AudioManager.unmute();
                scope.toggleMute = function() {
                    if (AudioManager.muted) {
                        AudioManager.unmute();
                        scope.muteImg = $rootScope.imageBasePath + "audio_icon.png";
                        $rootScope.languageSupport.mute = "on";
                    } else {
                        AudioManager.mute();
                        scope.muteImg = $rootScope.imageBasePath + "audio_mute_icon.png";
                        $rootScope.languageSupport.mute = "off";
                    }
                    TelemetryService.interact("TOUCH", AudioManager.muted ? "gc_mute" : "gc_unmute", "TOUCH", {
                        stageId: Renderer.theme._currentStage
                    });
                }
            }
        }
    }).directive('reloadStage', function($rootScope) {
        return {
            restrict: 'E',
            template: '<a href="javascript:void(0)" onclick="EventBus.dispatch(\'actionReload\')"><img id="reload_id" src="{{imageBasePath}}icn_replayaudio.png" style="width:100%;"/></a>'
        }
    }).directive('popup', function($rootScope, $compile) {
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
                scope.retryAssessment = function(id, e) {
                    scope.hidePopup(id);
                }

                scope.hidePopup = function(id) {
                    element.hide();
                    TelemetryService.interact("TOUCH", id ? id : "gc_popupclose", "TOUCH", {
                        stageId: ($rootScope.pageId == "endpage" ? "endpage" : $rootScope.stageId)
                    });
                };

                scope.moveToNextStage = function(navType) {
                    EventBus.dispatch("actionNavigateSkip", navType);
                }
            }
        }
    }).directive('goodJob', function($rootScope) {
        return {
            restrict: 'E',
            template: '<div class="popup"><div class="popup-overlay" ng-click="hidePopup()"></div><div class="popup-full-body"><div class="font-lato assess-popup assess-goodjob-popup"><img class="popup-bg-img" ng-src="{{imageBasePath}}goodJobpop.png"/><div class="goodjob_next_div gc-popup-icons-div"><a href="javascript:void(0);" ng-click="hidePopup()"><img class="popup-goodjob-next " ng-src="{{ imageBasePath }}icon_popup_next_big.png" ng-click="moveToNextStage(\'next\')" /></a><p>{{languageSupport.next}}</p></div></div></div></div>',
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
    }).directive('tryAgain', function($rootScope) {
        return {
            restrict: 'E',
            template: '<div class="popup"><div class="popup-overlay" ng-click="hidePopup()"></div><div class="popup-full-body"><div class="font-lato assess-popup assess-tryagain-popup"><img class="popup-bg-img" ng-src="{{imageBasePath}}tryagain_popup.png"/><div class="tryagain-retry-div gc-popup-icons-div"><a ng-click="retryAssessment(\'gc_retry\', $event);" href="javascript:void(0);"><img class="popup-retry" ng-src="{{imageBasePath}}icn_popup_replay.png" /></a><p class="gc-popup-retry-replay">{{languageSupport.replay}}</p></div><div class="tryagian-next-div gc-popup-icons-div"><a href="javascript:void(0);" ng-click="hidePopup()"><img class="popup-retry-next" ng-src="{{ imageBasePath }}icn_popup_next_small.png" ng-click="moveToNextStage(\'next\')" /></a><p>{{languageSupport.next}}</p></div></div></div></div></div></div>',
            controller: function($scope, $rootScope, $timeout) {

            }

        }
    }).directive('assess', function($rootScope) {
        return {
            restrict: 'E',
            scope: {
                image: '=',
                show: '='
            },
            template: '<a class="assess" ng-show="show" ng-class="assessStyle" href="javascript:void(0);" ng-click="onSubmit()"> <!-- enabled --><img ng-src="{{image}}"/></a>',
            link: function(scope, element) {
                scope.labelSubmit = $rootScope.languageSupport.submit;
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
                            $scope.image = $rootScope.imageBasePath + "submit_enable.png";
                        }, 100);
                    } else {
                        //Disable state
                        $scope.assessStyle = 'assess-disable';
                        $scope.image = $rootScope.imageBasePath + "submit_disable.png";
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
    }).directive('genie', function($rootScope) {
        return {
            scope: {
                icon: '@'
            },
            restrict: 'E',
            template: '<div ng-class="enableGenie ? \'genie-home\' : \'icon-opacity genie-home\'" ng-click="goToGenie()"><img ng-src="{{imgSrc}}"/><span> {{languageSupport.home}} </span></div>',
            /* above span will not be visible in the end page. To be handles oin css */
            link: function(scope) {
                scope.languageSupport = $rootScope.languageSupport;
                scope.enableGenie = ("undefined" == typeof cordova) ? false : true;
                scope.imgSrc = $rootScope.imageBasePath + scope.icon
                if (scope.enableGenie) {
                    scope.goToGenie = function() {
                        EkstepRendererAPI.hideEndPage();
                        var pageId = $rootScope.pageId;
                        exitApp(pageId);
                    }
                }
            }
        }
    }).directive('restart', function($rootScope, $state, $stateParams) {
        return {
            restrict: 'E',
            template: '<div ng-click="restartContent()"><img src="{{imageBasePath}}icn_replay.png"/><span> {{languageSupport.replay}} </span></div>',
            link: function(scope) {
                scope.restartContent = function() {
                    $rootScope.replayContent();
                    var muteElement = document.getElementById("unmute_id");
                    if (!_.isNull(muteElement)) {
                        muteElement.style.display = "none";
                    }
                    AudioManager.unmute();
                    if (!_.isUndefined(scope.hideMenu) && scope.menuOpened)
                        scope.hideMenu();
                }
            }
        }
    }).directive('lastPage', function($rootScope) {
        return {
            restrict: 'E',
            template: '<a href="javascript:void(0)" ng-click="goToLastPage()"><img ng-src="{{imageBasePath}}icn_back_page.png"/></a>',
            link: function(scope) {}
        }
    }).directive('userSwitcher', function($rootScope, $compile) {
        return {
            restrict: 'E',
            scope: {
                popupBody: '=popupBody'
            },
            controller: 'userSwitchCtrl',
            templateUrl: 'templates/user-switch-popup.html',
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
                scope.init = function() {
                    if (GlobalContext.config.showUser === true) {
                        userSlider.mCustomScrollbar('destroy');
                        groupSlider.mCustomScrollbar('destroy');
                        scope.initializeCtrl();
                        scope.render();
                    }
                }();
            }
        }
    });