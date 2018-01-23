'use strict';
angular.module('genie-canvas').controllerProvider.register("FTBRendererController", function($scope, $rootScope) {
  $scope.showTemplate = true;
  $scope.question;
  $scope.ftbAnswer;
  $scope.qcquestion = true;
  $scope.qcblank = true;
  $scope.events = {"show":"", "hide":"", "eval": ""};
  var ctrl = this;

  $scope.init = function() {
    $scope.cssPath = org.ekstep.pluginframework.pluginManager.resolvePluginResource("org.ekstep.questionunit.ftb", "1.0", "renderer/styles/horizontalTemplate.css");
    $scope.pluginInstance = EkstepRendererAPI.getPluginObjs("org.ekstep.questionunit.ftb");

    $scope.events.eval = $scope.pluginInstance._manifest.id + ":evaluate";
    $scope.events.show = $scope.pluginInstance._manifest.id + ":show";
    $scope.events.hide = $scope.pluginInstance._manifest.id + ":hide";
    
    $scope.removeEvents(); 
    $scope.registerEvents();  
    if(!$rootScope.isFTBRendererd){
      $rootScope.isFTBRendererd = true;
    }
    if(EventBus.hasEventListener($scope.events.eval)){
      if(EventBus.listeners[$scope.events.eval].length > 1)
        EventBus.removeEventListener($scope.events.eval, $scope.evalListener)
    }
  }

  $scope.registerEvents = function(){
    /**
     * renderer:questionunit.ftb:dispatch an event in question set with question data.
     * @event renderer:questionunit.ftb:dispatch
     * @memberof org.ekstep.questionunit.ftb
     */
    EkstepRendererAPI.addEventListener($scope.events.show, $scope.showEventListener);
    /**
     * renderer:questionunit.ftb:hide template on question set navigation.
     * @event renderer:questionunit.ftb:dispatch
     * @memberof org.ekstep.questionunit.ftb
     */
    EkstepRendererAPI.addEventListener($scope.events.hide, $scope.hideEventListener);
    /**
     * renderer:questionunit.ftb:question set call evalution using plugin instance.
     * @event renderer:questionunit.ftb:click
     * @memberof org.ekstep.questionunit.ftb
     */
    EkstepRendererAPI.addEventListener($scope.events.eval,  $scope.evalListener);
  }

  $scope.removeEvents = function(){
    EkstepRendererAPI.removeEventListener($scope.events.hide, $scope.hideEventListener, undefined);
    EkstepRendererAPI.removeEventListener($scope.events.show, $scope.showEventListener, undefined);
    EkstepRendererAPI.removeEventListener($scope.events.eval, $scope.evalListener, undefined);
  }

  $scope.showEventListener = function(event){
    $scope.question = event.target;
    $scope.ftbAnswer="";
    var qData=$scope.question._currentQuestion.data.__cdata||$scope.question._currentQuestion.data;
    var questionData = JSON.parse(qData);
    var qState = $scope.question._currentQuestionState;
    if(qState && qState.val) {
       $scope.ftbAnswer = qState.val;
    }
    $scope.questionObj = questionData;
    $scope.showTemplate = true;
    $scope.safeApply();
  }

  $scope.hideEventListener = function(event){
    $scope.showTemplate = false;
    $scope.safeApply();
  }

  $scope.evalListener = function(event){
    var callback = event.target;
    $scope.evaluate(callback);
    $scope.safeApply();
  }

  /**
     * renderer:questionunit.ftb:show keyboard in device.
     * @event renderer:questionunit.ftb:click
     * @memberof org.ekstep.questionunit.ftb
     */
  window.addEventListener('native.keyboardshow', function(e) {
    $scope.qcquestion = false;
    $scope.qcmiddlealign=true;
    $scope.safeApply();
  });

  /**
     * renderer:questionunit.ftb:hide keyboard in device.
     * @event renderer:questionunit.ftb:click
     * @memberof org.ekstep.questionunit.ftb
     */
  window.addEventListener('native.keyboardhide', function() {
    $scope.qcquestion = true;
    $scope.qcblank = true;
    $scope.qcmiddlealign=false;
    $scope.safeApply();
  });

   /**
     * renderer:questionunit.ftb:max length 25 because max length not working in andirod.
     * @event renderer:questionunit.ftb:watch
     * @memberof org.ekstep.questionunit.ftb
     */
  $scope.$watch("ftbAnswer", function(newValue, oldValue){
        if (typeof newValue!="undefined" && newValue.length > 25){
            $scope.ftbAnswer = oldValue;
        }
        var state = {
         val: $scope.ftbAnswer
       }
       EkstepRendererAPI.dispatchEvent('org.ekstep.questionset:saveQuestionState', state);
    });

  $scope.evaluate = function(callback) {
    var ansValue = angular.element('#preview-ftb-horizontal').scope().ftbAnswer;
    var correctAnswer = false;
    if ($scope.questionObj.answers[0].text.toLowerCase().replace(/ /g, '') === ansValue.toLowerCase().replace(/ /g, '')) {
      correctAnswer = true;
    }
    var result = {
        eval: correctAnswer,
        state: {
            val: ansValue
        }
    }
    if(_.isFunction(callback)) {
      //$scope.removeEvents();
      callback(result);
    }
  }
});
//# sourceURL=questionunitFtbRenderereTmpPlugin.js