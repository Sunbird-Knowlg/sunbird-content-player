var canvasApp = angular.module("genie-canvas");
canvasApp.controller("endPageController", function($scope, $rootScope, $state,$element, $stateParams) {
    console.info("EndPage controller is calling");
    $scope.showEndPage = false;
    $scope.showFeedbackArea = true;
    $scope.commentModel = '';
    $scope.showFeedbackPopup = false;
    $scope.userRating = 0;
    $scope.popUserRating = 0;
    $scope.stringLeft = 130;
    $scope.selectedRating = 0;
    $rootScope.pageId = "ContentApp-Endpage";
    $scope.creditsBody = '<div class="gc-popup-new credit-popup"><div class="gc-popup-title-new"> {{AppLables.credit}}</div> <div class="gc-popup-body-new"><div class="font-lato credit-body-icon-font"><div class="content-noCredits" ng-show="content.imageCredits == null && content.voiceCredits == null && content.soundCredits == null">{{AppLables.noCreditsAvailable}}</div><table style="width:100%; table-layout: fixed;"><tr ng-hide="content.imageCredits==null"><td class="credits-title">{{AppLables.image}}</td><td class="credits-data">{{content.imageCredits}}</td></tr><tr ng-hide="content.voiceCredits==null"><td class="credits-title">{{AppLables.voice}}</td><td class="credits-data">{{content.voiceCredits}}</td></tr><tr ng-hide="content.soundCredits==null"><td class="credits-title">{{AppLables.audio}}</td><td class="credits-data">{{content.soundCredits}}</td></tr></table></div></div></div>';
    $scope.imageBasePath = AppConfig.assetbase;
    $scope.arrayToString = function(array) {
        return (_.isString(array)) ? array : (!_.isEmpty(array) && _.isArray(array)) ? array.join(", ") : "";
    };
    $scope.ep_openUserSwitchingModal = function() {
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
        $scope.CreditPopup = true;
        TelemetryService.interact("TOUCH", "gc_credit", "TOUCH", {stageId: "ContentApp-CreditsScreen", subtype: "ContentID"});
    }
    $scope.replayContent = function() {
        var data = {
            'interactId' : 'ge_replay',
            'callback': $scope.replayCallback
        };
        EkstepRendererAPI.dispatchEvent("renderer:show:overlay")
        EkstepRendererAPI.dispatchEvent('renderer:content:close', undefined,data);
    }
    $scope.replayCallback = function(){
        EkstepRendererAPI.hideEndPage();
        EkstepRendererAPI.dispatchEvent('renderer:content:replay');   
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
        $scope.enableFeedBackButton  =  $scope.popUserRating > 0 || $scope.stringLeft < 130 ? false : true
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
            org.ekstep.service.content.getLearnerAssessment(GlobalContext.user.uid, id,GlobalContext.game.contentExtras)
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
    $scope.handleEndpage = function() {
        if (_.isUndefined($rootScope.content)) {
            localStorageGC.update();
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
            var otherData = getAppConfigDetails();
            TelemetryService.init(tsObj._gameData, tsObj._user, correlationData, otherData);
        }

        TelemetryService.interact("TOUCH", $rootScope.content.identifier, "TOUCH", {
            stageId: "ContentApp-EndScreen",
            subtype: "ContentID"
        });
        EkstepRendererAPI.dispatchEvent('renderer:init:relatedContent');
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
        EkstepRendererAPI.dispatchEvent("renderer:splash:hide");
        $scope.setTotalTimeSpent();
        $scope.getTotalScore($rootScope.content.identifier);
        $scope.showFeedback(0);
    }

    function epKeyboardShowHandler() {
        angular.element('#gcFbPopup').addClass('gc-fc-popup-keyboard');
    }
    function epKeyboardHideHandler() {
        angular.element('#gcFbPopup').removeClass('gc-fc-popup-keyboard');
    }
    $scope.initEndpage = function() {
        $scope.handleEndpage();
        if (_.isUndefined($rootScope.content)) {
            localStorageGC.update();
           content = localStorageGC.getItem('content');
            $rootScope.content = content;
        }

    };
    EkstepRendererAPI.addEventListener('renderer:show:endpage', function(){
        EkstepRendererAPI.dispatchEvent('renderer:content:end');
        $scope.showEndPage = true;
        // EkstepRendererAPI.dispatchEvent('renderer:overlay:hide');
        // EkstepRendererAPI.dispatchEvent('renderer:player:hide');
        $scope.initEndpage();
        $scope.safeApply();
    });

    EkstepRendererAPI.addEventListener('renderer:hide:endpage',function(){
        $scope.showEndPage = false;
        $scope.safeApply();
    });
});
canvasApp.controller('RelatedContentCtrl', function($scope, $rootScope, $state, $stateParams) {
        $scope.showRelatedContent = false;
        $scope.contentShowMore = false;
        $scope.showRelatedContentHeader = true;
        $scope.relatedContents = [];
        $scope.relatedContentPath = [];
        $scope.collectionTree = undefined;

        $scope.playRelatedContent = function(content, index) {
            var contentId = [];
            collectionPath = $scope.relatedContentPath;
            var eleId = "gc_nextcontent";
            var values = [];
            var contentIds = [];
            // Send only for normal contet/ content played directly from Genie
            if (_.isUndefined($scope.collectionTree) || _.isEmpty($scope.collectionTree)) {
                if ($scope.relatedContents.length > 0) {
                    contentIds = _.pluck($scope.relatedContents, 'identifier');
                }
                eleId = "gc_relatedcontent";
                values = [{
                    PositionClicked: index + 1
                }, {
                    ContentIDsDisplayed: contentIds,
                }, {
                    id: $scope.relatedContentItem ? $scope.relatedContentItem.responseMessageId : "",
                    type: $scope.relatedContentItem ? $scope.relatedContentItem.id : ''
                }]
            }
            TelemetryService.interact("TOUCH", eleId, "TOUCH", {
                stageId: "endpage",
                subtype: "",
                values: values
            });
            TelemetryService.end();
            GlobalContext.game.id = content.identifier
            GlobalContext.game.pkgVersion = content.pkgVersion;
            var contentExtras = [];
            if (!(_.isUndefined($scope.collectionTree) || _.isEmpty($scope.collectionTree))) {
                _.each($scope.relatedContentPath, function(eachObj) {
                    contentExtras.push(_.pick(eachObj, 'identifier', 'contentType'));
                });
            }
            // Check is content is downloaded or not in Genie.
            org.ekstep.service.content.getContentAvailability(content.identifier)
                .then(function(contetnIsAvailable) {
                    if (contetnIsAvailable) {
                        // This is required to setup current content details which is going to play
                        org.ekstep.contentrenderer.getContentMetadata(content.identifier, function(obj) {
                            if ($scope.collectionTree) {
                                GlobalContext.game.contentExtras = contentExtras;
                                localStorageGC.setItem("contentExtras", GlobalContext.game.contentExtras);
                            }
                            EkstepRendererAPI.hideEndPage();
                            $rootScope.content = obj;
                            if (window.content.mimeType == obj.mimeType){
                                window.content = obj;
                                EkstepRendererAPI.clearStage();
                                EkstepRendererAPI.dispatchEvent('renderer:content:load');
                                EkstepRendererAPI.dispatchEvent('renderer:player:show');
                                EkstepRendererAPI.dispatchEvent('renderer:splash:show');
                            } else {
                                window.content = obj;
                                EkstepRendererAPI.dispatchEvent('renderer:launcher:load', undefined, window.content);
                            }
                        });
                    } else {
                        $scope.navigateToDownloadPage(contentExtras, content.identifier);
                    }
                })
                .catch(function(err) {
                    console.info("contentNotAvailable : ", err);
                    $scope.navigateToDownloadPage(contentExtras, content.identifier);
                });
        }
        $scope.navigateToDownloadPage = function(contentExtras, contentId) {
            var deepLinkURL = "ekstep://c/" + contentId;
            if (!_.isEmpty(contentExtras)) {
                contentExtras.pop();
                contentExtras = JSON.stringify(contentExtras);
                deepLinkURL += "&contentExtras=" + contentExtras;
            }
            console.log("deepLinkURL: ", deepLinkURL);
            window.open(deepLinkURL, "_system");
        }
        $scope.getRelatedContent = function(list) {
            org.ekstep.service.content.getRelatedContent(GlobalContext.user.uid, list)
            .then(function(item) {
                if (!_.isEmpty(item)) {
                    $scope.relatedContentItem = item;
                    var list = [];
                    item.collection = item.nextContent;
                    item.content = item.relatedContents;
                    if (!_.isEmpty(item.collection)) {
                        $scope.showRelatedContent = true;
                        $scope.relatedContentPath = item.collection;
                        list = [item.collection[item.collection.length - 1]];
                        list[0].appIcon = list[0].basePath + '/' + list[0].contentData.appIcon;
                    } else if (!_.isEmpty(item.content)) {
                        $scope.showRelatedContent = true;
                        $scope.contentShowMore = true;
                        _.each(item.content, function(content) {
                            content.appIcon = content.contentData.appIcon;
                        })
                        list = _.first(_.isArray(item.content) ? item.content : [item.content], 2);
                    }
                    if (!_.isEmpty(list)) {
                        $scope.$apply(function() {
                            $scope.relatedContents = list;
                            jQuery('#endPageLoader').hide();
                        });
                    } else {
                        $scope.showRelatedContentHeader = false;
                        jQuery('#endPageLoader').hide();
                    }
                }
            })
        }

        $scope.renderRelatedContent = function(id) {
            var list = [];
            if (_.isUndefined($scope.collectionTree) || _.isEmpty($scope.collectionTree)) {
                if (("undefined" != typeof cordova)) {
                    list = [{
                        "identifier": id,
                        "mediaType": "Content"
                    }]
                    $scope.getRelatedContent(list);
                }
            } else {
                list = $scope.collectionTree;
                $scope.getRelatedContent(list);
            }
        }

        $scope.init = function() {
            $scope.collectionTree = localStorageGC.getItem('contentExtras');
            if ("undefined" != typeof cordova) {
                $scope.renderRelatedContent($rootScope.content.identifier);
            } else {
                jQuery('#endPageLoader').hide();
                $scope.showRelatedContentHeader = false;
            }
        }
        EkstepRendererAPI.addEventListener('renderer:init:relatedContent',function(){
                console.info('Endpage init..')
                $scope.init();

        })
    });
canvasApp.directive('starRating', function($rootScope) {
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
            $scope.rating_empty = AppConfig.assetbase + $scope.emptyRating;
            $scope.rating_selected = AppConfig.assetbase + $scope.selectedRating;

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
