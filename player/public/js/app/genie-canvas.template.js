angular.module('genie-canvas.template',[])
.controller('ContentHomeCtrl', function($scope, $rootScope, $http, $cordovaFile, $cordovaToast, $ionicPopover, $state, ContentService, $stateParams) {
    $rootScope.showMessage = false;
    if (GlobalContext.config.appInfo && GlobalContext.config.appInfo.identifier) {
        $scope.playContent = function(content) {
            $state.go('playContent', {
                'itemId': content.identifier
            });
        };

        $scope.updateContent = function(content) {
            ContentService.getContent(content.identifier)
                .then(function(data) {
                    $scope.$apply(function() {
                        $scope.item = data;
                    });
                    var game = $scope.item;
                    $rootScope.stories = [data];
                    var identifier = (game && game.identifier) ? game.identifier : null;
                    var version = (game && game.pkgVersion) ? game.pkgVersion : "1";
                    TelemetryService.start(identifier, version);
                })
                .catch(function(err) {
                    contentNotAvailable();
                });
        }
        $scope.goToHome = function() {
            goToHome();
        }

        $scope.goToGenie = function() {
            exitApp();
        }
        $scope.updateContent(GlobalContext.config.appInfo);
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

    $scope.updateContent(GlobalContext.config.appInfo);
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
 
})