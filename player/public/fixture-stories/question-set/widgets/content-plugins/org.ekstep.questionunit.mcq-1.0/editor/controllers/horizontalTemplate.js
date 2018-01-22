/**
 * Plugin to create MCQ question
 * @class org.ekstep.questionunitmcq:mcqQuestionFormController
 * Jagadish P<jagadish.pujari@tarento.com>
 */

angular.module('createquestionapp', [])
 .controller('mcqQuestionFormController', ['$scope', '$rootScope', function($scope, $rootScope) {

  $scope.formVaild = false;
  $scope.mcqFormData = {
    'question': { 'text': '', 'image': '', 'audio': '' },
    'options': [{ 'text': '', 'image': '', 'audio': '', 'isCorrect': false },
    { 'text': '', 'image': '', 'audio': '', 'isCorrect': false }
    ]
  };

  $scope.init = function() {
    $('.menu .item').tab();
    $('.ui.dropdown').dropdown({ useLabels: false });

    if (!ecEditor._.isUndefined($scope.questionEditData)) {
      var data = $scope.questionEditData.data;
      $scope.mcqFormData.question = data.question;
      $scope.mcqFormData.options = data.options;
      if (data.length > 2) {
        for (var j = 2; j < data.length; j++) {
          $scope.mcqFormData.options.push({ 'text': '', 'image': '', 'audio': '', 'isCorrect': false });
        }
      }
      if ($scope.mcqFormData.options.length < 2) {
        $scope.mcqFormData.options.splice(2, 1);
      }
    }

    $scope.$parent.$on('question:form:val', function(event) {
      if ($scope.formValidation()) {
        $scope.$emit('question:form:valid', $scope.mcqFormData);
      } else {
        $scope.$emit('question:form:inValid', $scope.mcqFormData);
      }
    })
  }

  $scope.addAnswerField = function() {
    var option = { 'text': '', 'image': '', 'audio': '', 'isCorrect': false };
    if ($scope.mcqFormData.options.length < 8)
      $scope.mcqFormData.options.push(option);
  }

  $scope.formValidation = function() {
    var opSel = false;
    var valid = false;
    var formValid = $scope.mcqForm.$valid;
    $scope.submitted=true;
    $scope.mcqFormData.media = [{}];
    if (!_.isUndefined($scope.selectedOption)) {
      _.each($scope.mcqFormData.options, function(k, v) {
        $scope.mcqFormData.options[v].isCorrect = false;
      });
      valid = true;
      $scope.mcqFormData.options[$scope.selectedOption].isCorrect = true;
    } else {
      _.each($scope.mcqFormData.options, function(k, v) {
        if (k.isCorrect) {
          valid = true;
        }
      });
    }
    if (valid) {
      opSel = true;
      $scope.selLbl = 'success';
    } else {
      opSel = false;
      $scope.selLbl = 'error';
    }
    return (formValid && opSel) ? true : false;
  }

  $scope.deleteAnswer = function(id) {
    if (id >= 0)
      $scope.mcqFormData.options.splice(id, 1);
  }
}]);
//# sourceURL=horizontalMCQ.js