var canvasApp = angular.module("genie-canvas");
canvasApp.controller('ContentCtrl', function($scope, $rootScope, $state, $stateParams) {
    $rootScope.pageId = "ContentApp-Renderer";
    $scope.showPlayer = false;
    $scope.init = function() {
        if (_.isUndefined($rootScope.content)) {
            if (!_.isUndefined(content.metadata)) {
                $rootScope.content = content.metadata;
                $scope.renderContent();
            } else {
                console.info('Content Metadata is not present');
            }
        } else {
            $scope.renderContent();
        }
    };
    $scope.callStartTelemetry = function(content, cb) {
        var identifier = (content && content.identifier) ? content.identifier : null;
        var pkgVersion = !_.isUndefined(content.pkgVersion) ? content.pkgVersion.toString() : null;
        var version = (content && pkgVersion) ? pkgVersion : "1";
        startTelemetry(identifier, version, cb);
    };
    $scope.renderContent = function() {
        if ($rootScope.content) {
            localStorageGC.setItem("content", $rootScope.content);
            $rootScope.pageTitle = $rootScope.content.name;
            org.ekstep.contentrenderer.progressbar(true);
            GlobalContext.currentContentId = _.isUndefined(GlobalContext.currentContentId) ? $rootScope.content.identifier : GlobalContext.currentContentId;
            $scope.callStartTelemetry($rootScope.content, function() {
                $scope.item = $rootScope.content;
                $scope.callStartTelemetry($rootScope.content, function() {
                    $rootScope.content.body = isbrowserpreview ? content.body : undefined;
                    EkstepRendererAPI.dispatchEvent('renderer:launcher:load', undefined, $rootScope.content);
                });
            });
        } else {
            alert('Name or Launch URL not found.');
            exitApp();
        }
    };
    $scope.reloadStage = function() {
        reloadStage();
    };
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
    EkstepRendererAPI.addEventListener("renderer:player:init", function() {
        $scope.showPlayer = true;
        $scope.init();
    });
    EkstepRendererAPI.addEventListener('renderer:player:hide',function(){
          $scope.showPlayer = false;
    });
});