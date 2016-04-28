angular.module('genie-canvas.template',[])
.controller('ContentHomeCtrl', function($scope, $rootScope, $http, $cordovaFile, $cordovaToast, $ionicPopover, $state, ContentService, $stateParams) {
    $rootScope.showMessage = false;
    if (GlobalContext.config.appInfo && GlobalContext.config.appInfo.identifier) {
        $scope.playContent = function(content) {
            console.log("content : ", content);
            $state.go('playContent', {
                'itemId': content.identifier
            });
        };

        $scope.updateContent = function(content) {
            console.log("$stateParams.contentId : ", GlobalContext.currentContentId);
            console.log("content : ", content);
            ContentService.getContent(content)
                .then(function(data) {
                    GlobalContext.currentContentId = data.identifier;
                    GlobalContext.currentContentMimeType = data.mimeType;
                    $scope.$apply(function() {
                        $scope.item = data;
                    });
                    $rootScope.stories = [data];
                })
                .catch(function(err) {
                    console.log("contentNotAvailable : ", err);
                    contentNotAvailable();
                });
        }
        $rootScope.goToHome = function() {
            goToHome($state, $rootScope, GlobalContext.previousContentId);
        }

        $rootScope.goToGenie = function() {
            exitApp();
        }
        
        $scope.updateContent($stateParams.contentId);
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
                console.log("$scope.item : ", $scope.item);
            });
        });
    } else {
        alert('Sorry. Could not find the content.');
        startApp();
    }
})
.controller('EndPageCtrl', function($scope, $rootScope, $state, ContentService, $stateParams) {
    var id = $stateParams.contentId;
    $rootScope.content = {};

    $scope.arrayToString = function(array) {
        return (!_.isEmpty(array) && _.isArray(array)) ? array.join(", "): "";   
    }

    ContentService.getContent(id)
    .then(function(content) {
        console.log("Content:", content);
        content.imageCredits = $scope.arrayToString(content.imageCredits);
        content.soundCredits = $scope.arrayToString(content.soundCredits);
        content.voiceCredits = $scope.arrayToString(content.voiceCredits);
        $rootScope.content = content;

        var creditsPopup = angular.element(jQuery("popup[id='creditsPopup']"));
        creditsPopup.trigger("popupUpdate", {"content": content});
        $rootScope.$apply();
    })
    $scope.creditsBody = '<div class="credit-popup"><img ng-src="{{icons.popup.background}}" style="width:100%;" /><div class="popup-body"><div style="width:75%;height:50%;left: 15%;top: 15%;position: absolute;font-family: SkaterGirlsRock;font-size: 1em;"><table style="width:100%;"><tr ng-if="content.imageCredits"><td class="credits-title">Image</td><td class="credits-data">{{content.imageCredits}}</td></tr><tr ng-if="content.voiceCredits"><td class="credits-title">Voice</td><td class="credits-data">{{content.voiceCredits}}</td></tr><tr ng-if="content.soundCredits"><td class="credits-title">Sound</td><td class="credits-data">{{content.soundCredits}}</td></tr></table></div></div><a class="popup-close" href="javascript:void(0)" ng-click="hidePopup()"><img ng-src="{{icons.popup.close}}" style="width:100%;"/></a></div>';

    $scope.showCredits = function() {
        jQuery("#creditsPopup").show();
    }

    $scope.restartContent = function() {
        window.history.back();
        Renderer.theme.restart();
        // $state.go('playContent', {
        //         'itemId': $stateParams.id
        // });
    }
});