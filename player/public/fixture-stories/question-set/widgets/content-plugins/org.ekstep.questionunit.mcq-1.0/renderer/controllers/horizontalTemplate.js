// TODO: Controller for horizontalTemplate.html
'use strict';
angular.module('MCQRendererApp', []).controller("MCQRendererController", function($scope) {
  //var ctrl = this;
  $scope.showTemplate = true;
  $scope.question;
  $scope.selectedAns;
  $scope.cssPath = org.ekstep.pluginframework.pluginManager.resolvePluginResource("org.ekstep.questionunit.mcq", "1.0", "renderer/styles/horizontalTemplate.css");
  $scope.init = function() {
    $scope.pluginInstance = EkstepRendererAPI.getPluginObjs("org.ekstep.questionunit.mcq");
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
  $scope.selectedvalue = function(val, index) {
    $scope.selectedIndex = index;
    $scope.selectedAns = val.isAnswerCorrect;
  }
  $scope.evaluate = function() {
    var correctAnswer;
    $scope.questionObj.options.forEach(function(option) {
      if (option.isAnswerCorrect === $scope.selectedAns) {
        correctAnswer = option.isAnswerCorrect;

      }
    });
    if (correctAnswer) {
      console.log("right answere");

    } else {
      console.log("wrong");
    }
  }

});