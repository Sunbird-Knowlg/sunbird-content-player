angular.module('genie-canvas.template',[])
.controller('ContentHomeCtrl', function($scope, $rootScope, $http, $cordovaFile, $cordovaToast, $ionicPopover, $state, ContentService, $stateParams) {
    $rootScope.showMessage = false;
    $rootScope.pageId = "coverpage";

    $scope.playContent = function(content) {
        $state.go('playContent', {
            'itemId': content.identifier
        });
    };

    $scope.updateContent = function(content) {
        ContentService.getContent(content)
            .then(function(data) {
                GlobalContext.currentContentId = data.identifier;
                GlobalContext.currentContentMimeType = data.mimeType;
                $scope.$apply(function() {
                    $scope.item = data;
                });
                $rootScope.stories = [data];
                var identifier = (data && data.identifier) ? data.identifier : null;
                var version = (data && data.pkgVersion) ? data.pkgVersion : "1";
                TelemetryService.start(identifier, version);
                TelemetryService.interact("TOUCH", data.identifier, "TOUCH", { stageId: "ContentApp-Title", subtype: "ContentID"});
            })
            .catch(function(err) {
                console.info("contentNotAvailable : ", err);
                contentNotAvailable();
            });
    }
    
    $scope.init = function(){
        if (GlobalContext.config.appInfo && GlobalContext.config.appInfo.identifier) {
            if(_.isUndefined(content.metadata) && (webview == true)){
                var data = content.metadata;
                content.metadata.status = 'ready';
                $scope.item = content.metadata;
                $rootScope.stories = [content.metadata];   
                var identifier = (data && data.identifier) ? data.identifier : null;
                var version = (data && data.pkgVersion) ? data.pkgVersion : "1";
                TelemetryService.start(identifier, version);
                TelemetryService.interact("TOUCH", data.identifier, "TOUCH", { stageId: "ContentApp-Title", subtype: "ContentID"});
            }else{
                $scope.updateContent($stateParams.contentId);
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

    $scope.init();
})
.controller('EndPageCtrl', function($scope, $rootScope, $state, ContentService, $stateParams) {
    $rootScope.pageId = "endpage";
    var id = $stateParams.contentId;
    $rootScope.content = {};
    $scope.showNextContent = true;
    if(!GlobalContext.previousContentId)
        $scope.showNextContent = false;

    $scope.arrayToString = function(array) {
        return (!_.isEmpty(array) && _.isArray(array)) ? array.join(", "): "";   
    }

    ContentService.getContent(id)
    .then(function(content) {
        content.imageCredits = $scope.arrayToString(content.imageCredits);
        content.soundCredits = $scope.arrayToString(content.soundCredits);
        content.voiceCredits = $scope.arrayToString(content.voiceCredits);
        $rootScope.content = content;

        var creditsPopup = angular.element(jQuery("popup[id='creditsPopup']"));
        creditsPopup.trigger("popupUpdate", {"content": content});
        $rootScope.$apply();
    })
    $scope.creditsBody = '<div class="credit-popup"><img ng-src="{{icons.popup.credit_popup}}" style="width:100%;" /><div class="popup-body"><div style="width:75%;height:50%;left: 15%;top: 0%;position: absolute;font-family: SkaterGirlsRock;font-size: 1em;"><table style="width:100%;"><tr ng-if="content.imageCredits"><td class="credits-title">Image</td><td class="credits-data">{{content.imageCredits}}</td></tr><tr ng-if="content.voiceCredits"><td class="credits-title">Voice</td><td class="credits-data">{{content.voiceCredits}}</td></tr><tr ng-if="content.soundCredits"><td class="credits-title">Sound</td><td class="credits-data">{{content.soundCredits}}</td></tr></table></div></div><a class="popup-close" href="javascript:void(0)" ng-click="hidePopup()"><img ng-src="{{icons.popup_close.close_icon}}" style="width:100%; left:70%;"/></a></div>';

    $scope.showCredits = function() {
        jQuery("#creditsPopup").show();
        TelemetryService.interact("TOUCH", "gc_credit", "TOUCH", {stageId : "ContnetApp-CreditsScreen", subtype: "ContentID"});
    }

    $scope.playNextContent = function() {
        var id = collectionChildrenIds.pop();
        Renderer.cleanUp();
        if(id)
            $state.go('showContent', {"contentId": id});
        else
            $state.go('contentList', { "id": GlobalContext.previousContentId });
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
      TelemetryService.interact("TOUCH", $stateParams.contentId, "TOUCH", { stageId: "ContnetApp-EndScreen", subtype: "ContentID"});
});