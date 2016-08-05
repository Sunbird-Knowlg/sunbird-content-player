angular.module('genie-canvas.template',[])
.controller('ContentHomeCtrl', function($scope, $rootScope, $http, $cordovaFile, $cordovaToast, $ionicPopover, $state, ContentService, $stateParams) {
    $rootScope.showMessage = false;
    $rootScope.pageId = "coverpage";
    $rootScope.content;
    $scope.showPage = true;
    $scope.playContent = function(content) {
        $scope.showPage = false;
        $state.go('playContent', {
            'itemId': content.identifier
        });
        jQuery('#loadingText').text(content.name);
        jQuery("#progressBar").width(0);
        jQuery('#loading').show();
        startProgressBar(40, 0.6);

    };

    $scope.getContentMetadata = function(content) {
        jQuery('#loading').hide();
        ContentService.getContent(content)
        .then(function(data) {
           $scope.setContentMetadata(data);
        })
        .catch(function(err) {
            console.info("contentNotAvailable : ", err);
            contentNotAvailable();
        });
    }

    $scope.setContentMetadata = function(data){
        GlobalContext.currentContentId = data.identifier;
        GlobalContext.currentContentMimeType = data.mimeType;
        if(_.isUndefined(data.localData)){
            data.localData = data;
        }else{
            data =data.localData;
        }
        data.status = "ready";
        $scope.$apply(function() {
            $scope.item = data;
            $rootScope.content = data;
        });

        var identifier = (data && data.identifier) ? data.identifier : null;
        var version = (data && data.pkgVersion) ? data.pkgVersion : "1";
        TelemetryService.start(identifier, version);
        TelemetryService.interact("TOUCH", data.identifier, "TOUCH", { stageId: "ContentApp-Title", subtype: "ContentID"});
    }

    $scope.init = function(){
        $scope.showPage = true;
        if (GlobalContext.config.appInfo && GlobalContext.config.appInfo.identifier) {
            if( (webview == "true")){
                if(content.metadata && (content.metadata.mimeType != COLLECTION_MIMETYPE)){
                    jQuery('#loading').hide();
                    //For JSON and Direct contentID
                    $scope.setContentMetadata(content.metadata);
                }else{
                    //For collections
                    $scope.getContentMetadata($stateParams.contentId);
                }
            }else{
                //For mobile
                $scope.getContentMetadata($stateParams.contentId);
            }
        } else {
            alert('Sorry. Could not find the content.');
            startApp();
        }
        
    }
    
    $rootScope.$on('show-message', function(event, data) {
        if (data.message && data.message != '') {
            $rootScope.showMessage = true;
            $rootScope.message = data.message;
            $rootScope.$apply();
        }
        if (data.timeout) {
            setTimeout(function() {
                $rootScope.showMessage = false;
                $rootScope.$apply();
                if (data.callback) {
                    data.callback();
                }
            }, data.timeout);
        }
    });

    $rootScope.$on('process-complete', function(event, result) {
        $scope.$apply(function() {
            $scope.item = result.data;
        });
    });

    setTimeout(function(){
        $scope.init();
    }, 0);
})
.controller('EndPageCtrl', function($scope, $rootScope, $state, ContentService, $stateParams) {
    $scope.showRelatedContent = false;
    $scope.contentShowMore = false;
    $scope.showRelatedContentHeader = true;
    $scope.relatedContents = [];
    $scope.relatedContentPath = [];
    $scope.commentModel = '';
    $scope.showFeedbackPopup = false;
    $scope.userRating = 0;
    $scope.popUserRating = 0;

    $rootScope.pageId = "endpage";
    $scope.creditsBody = '<div class="gc-popup-new credit-popup"><div class="gc-popup-title-new"> {{languageSupport.credit}}</div> <div class="gc-popup-body-new"><div class="credit-body-icon-font"><div class="content-noCredits" ng-show="content.imageCredits == null && content.voiceCredits == null && content.soundCredits == null">{{languageSupport.noCreditsAvailable}}</div><table style="width:100%; table-layout: fixed;"><tr ng-hide="content.imageCredits==null"><td class="credits-title">{{languageSupport.image}}</td><td class="credits-data">{{content.imageCredits}}</td></tr><tr ng-hide="content.voiceCredits==null"><td class="credits-title">{{languageSupport.voice}}</td><td class="credits-data">{{content.voiceCredits}}</td></tr><tr ng-hide="content.soundCredits==null"><td class="credits-title">{{languageSupport.audio}}</td><td class="credits-data">{{content.soundCredits}}</td></tr></table></div></div></div>';
   
    $scope.arrayToString = function(array) {
        return (_.isString(array)) ? array : (!_.isEmpty(array) && _.isArray(array)) ? array.join(", "): "";   
    };

    $scope.setCredits = function(key) {
        if (content[key]) {
            content[key] = $scope.arrayToString(content[key]);
        } else {
            content[key] = null;
        }
    };
    var content = $rootScope.content;

    $scope.setCredits('imageCredits');
    $scope.setCredits('soundCredits');
    $scope.setCredits('voiceCredits');

    var creditsPopup = angular.element(jQuery("popup[id='creditsPopup']"));
    creditsPopup.trigger("popupUpdate", {"content": content});
    setTimeout(function() {
        $rootScope.$apply();
    }, 1000);

    TelemetryService.interact("TOUCH", $stateParams.contentId, "TOUCH", { stageId: "ContnetApp-EndScreen", subtype: "ContentID"});
    
    $scope.showCredits = function(key) {
        if (content.imageCredits == null && content.voiceCredits == null && content.soundCredits == null) {
            console.warn("No metadata imageCredits,voiceCredites and soundCredits");
        }
        jQuery("#creditsPopup").show();
        TelemetryService.interact("TOUCH", "gc_credit", "TOUCH", {
            stageId: "ContnetApp-CreditsScreen",
            subtype: "ContentID"
        });
    }

    $scope.showFeedback = function(param){
        $scope.userRating = param;
        $scope.popUserRating = param; 
        TelemetryService.interact("TOUCH", "gc_feedback", "TOUCH", {
            stageId: "ContnetApp-FeedbackScreen",
            subtype: "ContentID"
        });
        $scope.showFeedbackPopup = true;
    }

    $scope.updatePopUserRating = function(param){
        $scope.popUserRating = param; 
    }

    $scope.submitFeedback = function(){
        $scope.userRating = $scope.popUserRating;
        $scope.hideFeedback();
        var eks = {
            type : "RATING",
            rating : $scope.userRating,
            context : {
                type : "Content",
                id : $rootScope.content.identifier,
                stageid: $rootScope.pageId
            },
            comments: jQuery('#commentText').val()
        }
        TelemetryService.sendFeedback(eks);
    }

    $scope.hideFeedback = function(){
        $scope.showFeedbackPopup = false;
    }

    $scope.playNextContent = function() {
        var id = collectionChildrenIds.pop();
        if(Renderer.running)
            Renderer.cleanUp();
        if(id) {
            ContentService.getContent(id)
            .then(function(content) {
                if (COLLECTION_MIMETYPE == content.mimeType) {
                    $state.go('contentList', { "id": id });
                } else {
                    $state.go('showContent', {"contentId": id});
                }
            })
            .catch(function(err) {
                if(!_.isEmpty(collectionChildrenIds))
                     $scope.playNextContent();
                else {
                    console.info("contentNotAvailable : ", err);
                    contentNotAvailable();
                }
            });
        } else {
            $state.go('contentList', { "id": GlobalContext.previousContentId });
        }
    }

    $scope.restartContent = function() {
        jQuery('#loading').show();
       /* window.history.back();*/
     $state.go('playContent', {
            'itemId': content.identifier
        });
        var gameId = TelemetryService.getGameId();
        var version = TelemetryService.getGameVer();
        var instance = this;
        setTimeout(function() {
            if (gameId && version) {
                TelemetryService.start(gameId, version);
            }
        }, 500);
    }

     $scope.playRelatedContent = function(content) {
        $scope.showRelatedContent = false;
        $scope.contentShowMore = false;
        $scope.showRelatedContentHeader = false;
        
        jQuery('#endPageLoader').show();
        TelemetryService.end();
        if(GlobalContext.config.appInfo.mimeType == COLLECTION_MIMETYPE) {
            collectionPath = $scope.relatedContentPath;
            ContentService.getContent(content.identifier)
            .then(function(content) {
                if (COLLECTION_MIMETYPE == content.mimeType) {
                    $state.go('contentList', { "id": content.identifier});
                } else {
                    $state.go('showContent', {"contentId": content.identifier});
                }
            })
        } else {
            if(content.isAvailable) {
                if (COLLECTION_MIMETYPE == content.mimeType) {
                    $state.go('contentList', { "id": content.identifier});
                } else {
                    $state.go('showContent', {"contentId": content.identifier});
                }
            } else {
                window.open("ekstep://c/" + content.identifier, "_system");
            }
            
        }
        
    }

    $scope.showAllRelatedContent = function() {
        window.open("ekstep://l/related/" + $stateParams.contentId, "_system");
        exitApp();
    }


    $scope.getRelatedContent = function(list) {
        ContentService.getRelatedContent(GlobalContext.user.uid, list)
        .then(function(item) {      
            if(!_.isEmpty(item)) {
                var list = [];
                if(!_.isEmpty(item.collection)) {
                    $scope.showRelatedContent = true;
                    $scope.relatedContentPath = item.collection;
                    list = [item.collection[item.collection.length - 1]]; 
                    list[0].appIcon = list[0].path + '/' + list[0].appIcon;
                }
                else if(!_.isEmpty(item.content)) {
                    $scope.showRelatedContent = true;
                    $scope.contentShowMore = true;
                    list = _.first(_.isArray(item.content) ? item.content : [item.content], 2); 
                }

                if(!_.isEmpty(list)) {
                    $scope.$apply(function() {
                        $scope.relatedContents = list;
                        jQuery('#endPageLoader').hide();    
                    });
                } else {
                    $scope.showRelatedContentHeader = false;
                }
            }
        })
    }


    $scope.renderRelatedContent = function(id) {
        var list = [];
        if(GlobalContext.config.appInfo.mimeType != COLLECTION_MIMETYPE) {
            // For Content
            if(("undefined" != typeof cordova)) {
                list = [{
                    "identifier":id,
                    "mediaType":"Content"
                }]
                $scope.getRelatedContent(list);
            } 
        } else {
            // For Collection
            list = collectionPath;
            collectionPathMap[GlobalContext.previousContentId] = collectionPath;
            $scope.getRelatedContent(list);
        }
    }

    $scope.setTotalTimeSpent = function() {
        var startTime =  (TelemetryService && TelemetryService.instance && TelemetryService.instance._end[ TelemetryService.instance._end.length -1 ]) ? TelemetryService.instance._end[ TelemetryService.instance._end.length -1 ].startTime : 0;
        var totalTime = Math.round((new Date().getTime() - startTime) /1000);
        var mm = Math.floor(totalTime / 60);
        var ss = Math.floor(totalTime % 60);
        $scope.totalTimeSpent = (mm > 9 ? mm : ("0" + mm))  + ":" + (ss > 9 ? ss : ("0" + ss));
    }

    $scope.getTotalScore = function(id) {
        if("undefined" != typeof cordova) {
            ContentService.getLearnerAssessment(GlobalContext.user.uid, id)
            .then(function(score){
                if(score && score.total_questions) {
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


    $scope.init = function(){
        window.addEventListener('native.keyboardshow', epKeyboardShowHandler, true);
        window.addEventListener('native.keyboardhide', epKeyboardHideHandler, true);

        if("undefined" != typeof cordova) {
            $scope.renderRelatedContent($stateParams.contentId);
        } else {
            jQuery('#endPageLoader').hide();
            $scope.showRelatedContentHeader = false;
        }
        $scope.setTotalTimeSpent();
        $scope.getTotalScore($stateParams.contentId);
        $scope.showFeedback(0);
    }

    function epKeyboardShowHandler(){
        jQuery('#gcFbPopup').addClass('gc-fc-popup-keyboard');
    }

    function epKeyboardHideHandler(){
        jQuery('#gcFbPopup').removeClass('gc-fc-popup-keyboard');
    }

    $scope.init();
});
