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
        jQuery('#loadingText').text(GlobalContext.config.appInfo.name);
        jQuery('#loadingText1').text(GlobalContext.config.appInfo.name);
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
        // This is used by ContentCtrl.
        $rootScope.stories = [data];
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
    $scope.showNextContent = true;
    $rootScope.pageId = "endpage";
    $scope.creditsBody = '<div class="credit-popup"><img ng-src="{{icons.popup.credit_popup}}" style="width:100%;" /><div class="popup-body"><div class="credit-body-icon-font"><table style="width:100%; table-layout: fixed;"><tr ng-hide="content.imageCredits==null"><td class="credits-title">Image</td><td class="credits-data">{{content.imageCredits}}</td></tr><tr ng-hide="content.voiceCredits==null"><td class="credits-title">Voice</td><td class="credits-data">{{content.voiceCredits}}</td></tr><tr ng-hide="content.soundCredits==null"><td class="credits-title">Sound</td><td class="credits-data">{{content.soundCredits}}</td></tr></table></div></div><a class="popup-close" href="javascript:void(0)" ng-click="hidePopup()"><img ng-src="{{icons.popup_close.close_icon}}" style="width:100%; left:70%;"/></a></div>';
    //$rootScope.content = {};

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
        
    if(!GlobalContext.previousContentId){
        $scope.showNextContent = false;
    }

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
            return;
        }
        jQuery("#creditsPopup").show();
        TelemetryService.interact("TOUCH", "gc_credit", "TOUCH", {
            stageId: "ContnetApp-CreditsScreen",
            subtype: "ContentID"
        });
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
        window.history.back();
        var gameId = TelemetryService.getGameId();
        var version = TelemetryService.getGameVer();;
        var instance = this;
        setTimeout(function() {
            if (gameId && version) {
                TelemetryService.start(gameId, version);
            }
        }, 500);
    }
});
