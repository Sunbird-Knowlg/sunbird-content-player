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
        $scope.goToHome = function() {
            goToHome($state, GlobalContext.previousContentId);
        }

        $scope.goToGenie = function() {
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

    console.log("inside into end page ctrl........................");
    $scope.creditsBody = '<div><h2>Try Again!...</h2><a ng-click="hidePopup()" href="javascript:void(0);" style="position:absolute;width: 15%;top: 45%;left: 30%;"><img src="img/icons/speaker_icon.png" style="width:100%;" /></a><navigate type="\'next\'" enable-image="\'img/icons/next_icon.png\'" disable-image="\'img/icons/next_icon_disabled.png\'" style="position:absolute;width: 15%;top: 45%;right: 30%;"></navigate></div>';
    $scope.showCredits = function() {
        jQuery("#creditsPopup").show();
    }
 
});