/**
 * Plugin to create repo instance and to register repo instance
 * @extends EkstepRenderer.Plugin
 * @author Manjunath Davanam <manjunathd@ilimi.in>
 * ref: http://ify.io/lazy-loading-in-angularjs/
 */

Plugin.extend({
    myApp: undefined,
    initialize: function() {
        console.info('Endpage plugin is doing initialize....');
        EkstepRendererAPI.addEventListener('renderer:init:endpage', this.loadControllers, this);
    },
    loadControllers: function() {
        /*var $body = angular.element(document.body);
        var $rootScope = $body.scope().$root;
        $rootScope.content.name = 'Test Content Name';*/
        app.controllerProvider.register('EndPageCtrl', function($scope, $rootScope, $state, $stateParams) {
            $scope.showFeedbackArea = true;
            $scope.commentModel = '';
            $scope.showFeedbackPopup = false;
            $scope.userRating = 0;
            $scope.popUserRating = 0;
            $scope.stringLeft = 130;
            $scope.selectedRating = 0;
            $rootScope.pageId = "ContentApp-Endpage";
            $scope.creditsBody = '<div class="gc-popup-new credit-popup"><div class="gc-popup-title-new"> {{languageSupport.credit}}</div> <div class="gc-popup-body-new"><div class="font-lato credit-body-icon-font"><div class="content-noCredits" ng-show="content.imageCredits == null && content.voiceCredits == null && content.soundCredits == null">{{languageSupport.noCreditsAvailable}}</div><table style="width:100%; table-layout: fixed;"><tr ng-hide="content.imageCredits==null"><td class="credits-title">{{languageSupport.image}}</td><td class="credits-data">{{content.imageCredits}}</td></tr><tr ng-hide="content.voiceCredits==null"><td class="credits-title">{{languageSupport.voice}}</td><td class="credits-data">{{content.voiceCredits}}</td></tr><tr ng-hide="content.soundCredits==null"><td class="credits-title">{{languageSupport.audio}}</td><td class="credits-data">{{content.soundCredits}}</td></tr></table></div></div></div>';

            $scope.arrayToString = function(array) {
                return (_.isString(array)) ? array : (!_.isEmpty(array) && _.isArray(array)) ? array.join(", ") : "";
            };

            $scope.ep_openUserSwitchingModal = function() {
                TelemetryService.interact("TOUCH", "gc_open_userswitch", "TOUCH", {
                    stageId: EkstepRendererAPI.getCurrentStageId() ? EkstepRendererAPI.getCurrentStageId() : $rootScope.pageId
                });
                EventBus.dispatch("event:openUserSwitchingModal");
            }

            $scope.setCredits = function(key) {
                if ($scope.content[key]) {
                    $scope.content[key] = $scope.arrayToString($scope.content[key]);
                } else {
                    $scope.content[key] = null;
                }
            };

            $scope.showCredits = function(key) {
                if ($scope.content.imageCredits == null && $scope.content.voiceCredits == null && $scope.content.soundCredits == null) {
                    console.warn("No metadata imageCredits,voiceCredites and soundCredits");
                }
                jQuery("#creditsPopup").show();
                TelemetryService.interact("TOUCH", "gc_credit", "TOUCH", {
                    stageId: "ContentApp-CreditsScreen",
                    subtype: "ContentID"
                });
            }

            $scope.ep_replayContent = function() {
                $rootScope.replayContent();
                //Resetting mute state
                var muteElement = document.getElementById("unmute_id");
                if (!_.isNull(muteElement)) {
                    muteElement.style.display = "none";
                }
                AudioManager.unmute();
            }

            $scope.showFeedback = function(param) {
                $scope.userRating = param;
                $scope.popUserRating = param;
                $scope.showFeedbackPopup = true;
                $scope.enableFeedbackSubmit();
            }

            $scope.updatePopUserRating = function(param) {
                $scope.popUserRating = param;
                $scope.enableFeedbackSubmit();
            }

            $scope.enableFeedbackSubmit = function() {
                if ($scope.popUserRating > 0 || $scope.stringLeft < 130)
                    jQuery('#feedbackSubmitBtn').removeClass('icon-opacity');
                else
                    jQuery('#feedbackSubmitBtn').addClass('icon-opacity');
            }

            $scope.submitFeedback = function() {
                $scope.userRating = $scope.popUserRating;
                $scope.selectedRating = $scope.userRating;
                $scope.hideFeedback();
                var eks = {
                    type: "RATING",
                    rating: $scope.userRating,
                    context: {
                        type: "Content",
                        id: $rootScope.content.identifier,
                        stageid: $rootScope.pageId
                    },
                    comments: jQuery('#commentText').val()
                }
                TelemetryService.sendFeedback(eks);
            }

            $scope.hideFeedback = function() {
                $scope.showFeedbackPopup = false;
                $scope.stringLeft = 130;
                $scope.userRating = $scope.selectedRating;
            }
            $scope.setTotalTimeSpent = function() {
                var startTime = (TelemetryService && TelemetryService.instance && TelemetryService.instance._end[TelemetryService.instance._end.length - 1]) ? TelemetryService.instance._end[TelemetryService.instance._end.length - 1].startTime : 0;
                if (startTime) {
                    var totalTime = Math.round((new Date().getTime() - startTime) / 1000);
                    var mm = Math.floor(totalTime / 60);
                    var ss = Math.floor(totalTime % 60);
                    $scope.totalTimeSpent = (mm > 9 ? mm : ("0" + mm)) + ":" + (ss > 9 ? ss : ("0" + ss));
                } else {
                    $scope.showFeedbackArea = false;
                }
            }

            $scope.getTotalScore = function(id) {
                if ("undefined" != typeof cordova) {
                    ContentService.getLearnerAssessment(TelemetryService._user.uid, id)
                        .then(function(score) {
                            if (score && score.total_questions) {
                                $scope.showScore = true;
                                $scope.$apply(function() {
                                    $scope.totalScore = (score.total_correct + "/" + score.total_questions);
                                });
                            } else {
                                $scope.showScore = false
                            }
                        })
                } else {
                    $scope.showScore = false
                }
            }

            $scope.commentLength = function() {
                if ($('#commentText').val().length > 130)
                    $('#commentText').val($('#commentText').val().slice(0, 130));
                $scope.stringLeft = 130 - $('#commentText').val().length;
                $scope.enableFeedbackSubmit();
            }

            $scope.init = function() {
                if (_.isUndefined($rootScope.content)) {
                    localStorageGC.update();
                    // Updating the current content object by getting from localStage
                    content = localStorageGC.getItem('content');
                    $rootScope.content = content;
                }
                localStorageGC.setItem('content_old', $rootScope.content)
                if (_(TelemetryService.instance).isUndefined()) {
                    var tsObj = localStorageGC.getItem('telemetryService');
                    var correlationData = [];
                    correlationData.push({
                        "id": CryptoJS.MD5(Math.random().toString()).toString(),
                        "type": "ContentSession"
                    });
                    TelemetryService.init(tsObj._gameData, tsObj._user, correlationData);
                }

                TelemetryService.interact("TOUCH", $stateParams.contentId, "TOUCH", {
                    stageId: "ContentApp-EndScreen",
                    subtype: "ContentID"
                });

                // Get related contents for the current content
                $scope.$broadcast('getRelatedContentEvent');

                var creditsPopup = angular.element(jQuery("popup[id='creditsPopup']"));
                creditsPopup.trigger("popupUpdate", {
                    "content": $rootScope.content
                });
                setTimeout(function() {
                    $rootScope.$apply();
                }, 1000);
                $scope.setCredits('imageCredits');
                $scope.setCredits('soundCredits');
                $scope.setCredits('voiceCredits');
                window.addEventListener('native.keyboardshow', epKeyboardShowHandler, true);
                window.addEventListener('native.keyboardhide', epKeyboardHideHandler, true);
                jQuery('#loading').hide();
                $scope.setTotalTimeSpent();
                $scope.getTotalScore($stateParams.contentId);
                $scope.showFeedback(0);
            }

            function epKeyboardShowHandler() {
                jQuery('#gcFbPopup').addClass('gc-fc-popup-keyboard');
            }

            function epKeyboardHideHandler() {
                jQuery('#gcFbPopup').removeClass('gc-fc-popup-keyboard');
            }

            setTimeout(function() {
                $scope.init();
            }, 0);

            $rootScope.$on('loadEndPage', function() {
                if (_.isUndefined($rootScope.content)) {
                    $scope.init();
                }
            });
        });
        this.loadDirectives();
    },
    loadDirectives: function() {
        app.compileProvider.directive('genie', function($rootScope) {
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
                            var pageId = $rootScope.pageId;
                            exitApp(pageId);
                        }
                    }
                }
            }
        });
        app.compileProvider.directive('restart', function($rootScope, $state, $stateParams) {
            return {
                restrict: 'E',
                template: '<div ng-click="restartContent()"><img src="{{imageBasePath}}icn_replay.png"/><span> {{languageSupport.replay}} </span></div>',
                link: function(scope) {
                    scope.restartContent = function() {
                        $rootScope.replayContent();
                        //Resetting mute state
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
        });
        app.compileProvider.directive('starRating', function($rootScope) {
            return {
                //reference: http://jsfiddle.net/manishpatil/2fahpk7s/
                scope: {
                    rating: '=',
                    maxRating: '@',
                    readOnly: '@',
                    click: "&",
                    mouseHover: "&",
                    mouseLeave: "&",
                    emptyRating: '@',
                    selectedRating: '@'
                },
                restrict: 'EA',
                template: "<div style='display: inline-block; padding: 1%; cursor:pointer; width:12%; height:45%;' ng-repeat='idx in maxRatings track by $index'> \
                    <img ng-src='{{((hoverValue + _rating) <= $index) && rating_empty || rating_selected }}' \
                    ng-Click='isolatedClick($index + 1)' style='height:100%;' \></img> \
            </div>",
                compile: function(element, attrs) {
                    if (!attrs.maxRating || (Number(attrs.maxRating) <= 0)) {
                        attrs.maxRating = '5';
                    };
                },
                controller: function($scope, $element, $attrs, $rootScope) {
                    $scope.maxRatings = [];
                    $scope.rating_empty = $rootScope.imageBasePath + $scope.emptyRating;
                    $scope.rating_selected = $rootScope.imageBasePath + $scope.selectedRating;

                    for (var i = 1; i <= $scope.maxRating; i++) {
                        $scope.maxRatings.push({});
                    };

                    $scope._rating = $scope.rating;

                    $scope.isolatedClick = function(param) {
                        if ($scope.readOnly == 'true') return;

                        $scope.rating = $scope._rating = param;
                        $scope.hoverValue = 0;
                        $scope.click({
                            param: param
                        });
                    };
                }
            };
        })
    }
})