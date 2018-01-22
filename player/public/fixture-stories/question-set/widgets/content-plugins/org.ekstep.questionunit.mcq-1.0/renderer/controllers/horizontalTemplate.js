// TODO: Controller for horizontalTemplate.html
'use strict';
angular.module('genie-canvas').controllerProvider.register("MCQRendererController", function($scope, $rootScope) {
  //var ctrl = this;
  $scope.showTemplate = true;
  $scope.question;
  $scope.selectedAns;
  $scope.cssPath = org.ekstep.pluginframework.pluginManager.resolvePluginResource("org.ekstep.questionunit.mcq", "1.0", "renderer/styles/horizontalTemplate.css");
  $scope.init = function() {
    $scope.pluginInstance = EkstepRendererAPI.getPluginObjs("org.ekstep.questionunit.mcq");
    $scope.pluginInstance.initPlugin($scope.pluginInstance);
    // To show template/plugin  
    EkstepRendererAPI.addEventListener($scope.pluginInstance._manifest.id + ":show", function(event, question) {
      $scope.question = event.target;
      var qData=$scope.question._currentQuestion.data.__cdata||$scope.question._currentQuestion.data;
      var questionData = JSON.parse(qData);
      var qState = $scope.question._currentQuestionState;
      if(qState && qState.val) {
        $scope.selectedIndex = qState.val;
      }
      $scope.questionObj = questionData;
      $scope.showTemplate = true;
      $scope.safeApply();
    });
    EkstepRendererAPI.addEventListener($scope.pluginInstance._manifest.id + ":hide", function(event) {
      $scope.showTemplate = false;
      $scope.safeApply();
    });
    EkstepRendererAPI.addEventListener($scope.pluginInstance._manifest.id + ":evaluate", function(event) {
      var callback = event.target;
      $scope.evaluate(callback);
      $scope.safeApply();
    });
  }

  $scope.init();

  $scope.selectedvalue = function(val, index) {
    $scope.selectedIndex = index;
    $scope.selectedAns = val.isAnswerCorrect;
    var state = {
        val: $scope.selectedIndex
    }
    EkstepRendererAPI.dispatchEvent('org.ekstep.questionset:saveQuestionState', state);
  }
  
  $scope.evaluate = function(callback) {
    var correctAnswer;
    $scope.questionObj.options.forEach(function(option) {
      if (option.isAnswerCorrect === $scope.selectedAns) {
        correctAnswer = option.isAnswerCorrect;
      }
    });
    var result = {
        eval: correctAnswer,
        state: {
            val: $scope.selectedIndex
        }
    }
    if(_.isFunction(callback)) callback(result);
  }

});