'use strict';

app.controllerProvider.register('ContentCtrl', function($scope, $rootScope, $state, $stateParams) {
    $rootScope.pageId = "ContentApp-Renderer";
    $scope.showPlayer = false;
    $scope.isInitialized = false;
    $scope.canvas = false;

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
            $scope.canvas  = $rootScope.content.mimeType == 'application/vnd.ekstep.ecml-archive' ? true : false;
            GlobalContext.currentContentId = _.isUndefined(GlobalContext.currentContentId) ? $rootScope.content.identifier : GlobalContext.currentContentId;
            $scope.callStartTelemetry($rootScope.content, function() {
                $scope.item = $rootScope.content;
                $rootScope.content.body = isbrowserpreview ? content.body : undefined;
                /**
                 * 'renderer:launcher:load' event will get dispatch once core launcher, metadata,body is ready .
                 * @event 'renderer:launcher:load'
                 * @fires 'renderer:launcher:load'
                 * @memberof EkstepRendererEvents
                 */
                EkstepRendererAPI.dispatchEvent('renderer:launcher:load', undefined, $rootScope.content);
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

    $scope.initializePlayer = function() {
        $scope.isInitialized = true;
        /**
         * 'renderer:player:show' event will get dispatch to show the canvas player .
         * @event 'renderer:player:show'
         * @fires 'renderer:player:show'
         * @memberof EkstepRendererEvents
         */
        EkstepRendererAPI.dispatchEvent('renderer:player:show');
        $scope.init();
    }

    $scope.hideCanvasPlayer = function() {
        $scope.showPlayer = false;
        $scope.safeApply();
    }

    $scope.showCanvasPlayer = function() {
        $scope.showPlayer = true;
        $scope.safeApply();
    };
    
    EkstepRendererAPI.addEventListener("renderer:player:init", $scope.initializePlayer);

    /**
     * renderer:player:hide event to hide the player.
     * @event 'renderer.player.init'
     * @listens 'renderer.player.init'
     * @memberof 'org.ekstep.launcher'
     */
    EkstepRendererAPI.addEventListener('renderer:player:hide', $scope.hideCanvasPlayer);
    EkstepRendererAPI.addEventListener('renderer:player:show', $scope.showCanvasPlayer);

     /**
     * renderer:content:replay event to replay the current content.
     * @event 'renderer:content:replay'
     * @listens 'renderer:content:replay'
     * @memberof 'org.ekstep.launcher'
     */
    EkstepRendererAPI.addEventListener('renderer:content:replay', function(){
        $rootScope.$broadcast('renderer:overlay:unmute');
        $scope.showCanvasPlayer()
        // EkstepRendererAPI.dispatchEvent('renderer:player:show')
    });

    /* TODO: Temporary solution so load content. init event is dispatched before loading/compiling this controller */
    setTimeout(function(){
        if($scope.isInitialized){
            $scope.isInitialized = false;
        } else {
            //EkstepRendererAPI.dispatchEvent('renderer:player:show');
            $scope.showCanvasPlayer();
            $scope.init();
        }
    }, 2000);
});
