'use strict';
angular.module('ftbRendererApp', []).controller("ftbRendererController", function($scope) {
    var ctrl = this;
     $scope.showTemplate = true;
    $scope.questionObj = {"question":{"text":"ftb question"},"answers":[{"text":"ftbanswer"}]};
    $scope.answer = "";
      $scope.init = function() {
        $scope.pluginInstance = EkstepRendererAPI.getPluginObjs("org.ekstep.questionunit.ftb");
        // To show template/plugin  
        EkstepRendererAPI.addEventListener($scope.pluginInstance._manifest.id + ":show", function(event, question) {

            $scope.question = event.target;
            var questionData = JSON.parse($scope.question._currentQuestion.data);
            $scope.questionObj = questionData;
            $scope.showTemplate = true;
            $scope.safeApply();
        });
        EkstepRendererAPI.addEventListener($scope.pluginInstance._manifest.id + ":hide", function(event) {
            $scope.showTemplate = false;
            $scope.safeApply();
        });
        EkstepRendererAPI.addEventListener($scope.pluginInstance._manifest.id + ":evaluate", function(event) {
            $scope.evaluate();
            $scope.safeApply();
        });

    }
    $scope.evalution = function(){
        if ($scope.answer === $scope.questionObj.answers[0].text){
            alert("answer is correct");
            return true;
        }else{
            alert("incorrect answer");
            return false;
        }
    }
});