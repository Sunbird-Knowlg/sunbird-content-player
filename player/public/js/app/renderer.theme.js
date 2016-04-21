angular.module('genie-canvas.theme',[])
.controller('GameCtrl', function($rootScope, $scope, $http) {
    $scope.navigate = function(to) {
        var navigation = [];
        if (!_.isEmpty(Renderer.theme._currentScene._data.param)) {
            navigation = (_.isArray(Renderer.theme._currentScene._data.param)) ? Renderer.theme._currentScene._data.param : [Renderer.theme._currentScene._data.param];
            var direction = _.findWhere(navigation, {name: to});
            var action = {"asset":Renderer.theme._id,"command":"transitionTo","duration":100,"ease":"linear","effect":"fadeIn","type":"command","value":direction.value};
            if ("previous" == to) {
                action.transitionType = "previous";
            }
            Renderer.theme.transitionTo(action);
        }
    };
});