'use strict';
angular.module('FTBRendererApp', []).controller("FTBRendererController", function($scope) {
    $scope.showTemplate = true;
    $scope.ftbquestion = true;
    $scope.question;
    $scope.ftbAnswer;
    $scope.cssPath = org.ekstep.pluginframework.pluginManager.resolvePluginResource("org.ekstep.questionunit.ftb", "1.0", "renderer/styles/horizontalTemplate.css");
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
    $scope.init();
    window.addEventListener('native.keyboardshow', function() {
        $scope.answeretextarea = true;
        $scope.ftbquestion = false;
        $scope.safeApply();
    });
    window.addEventListener('native.keyboardhide', function() {
        $scope.ftbquestion = true;
        $scope.answeretextarea = false;
        $scope.safeApply();
    });

    $scope.evaluate = function() {
        var correctAnswer = false;
        if ($scope.questionObj.answers[0].text === $scope.ftbAnswer) {
            correctAnswer = true;
        }
        if (correctAnswer) {
            alert("right ftbAnswer");

        } else {
            alert("wrong ftbAnswer");
        }
    }
});

//# sourceURL=questionunitFtbRenderereTmpPlugin.js