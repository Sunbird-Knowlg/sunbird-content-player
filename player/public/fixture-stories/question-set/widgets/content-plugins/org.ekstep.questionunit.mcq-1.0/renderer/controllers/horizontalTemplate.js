// TODO: Controller for horizontalTemplate.html
'use strict';
angular.module('MCQRendererApp', []).controller("MCQRendererController", function($scope) {
    debugger;
    var ctrl = this;
    $scope.showTemplate = true;
    $scope.question;

    $scope.cssPath=org.ekstep.pluginframework.pluginManager.resolvePluginResource("org.ekstep.questionunit.mcq", "1.0", "renderer/styles/horizontalTemplate.css");
      $scope.init = function() {
        $scope.pluginInstance = EkstepRendererAPI.getPluginObjs("org.ekstep.questionunit.mcq");
        // To show template/plugin  
        EkstepRendererAPI.addEventListener($scope.pluginInstance._manifest.id+":show", function(event, question){
    
     $scope.question = event.target;
    var questionData=JSON.parse($scope.question._currentQuestion.data);
    $scope.questionObj = questionData;
            $scope.showTemplate = true;
            $scope.safeApply();
        });
        EkstepRendererAPI.addEventListener($scope.pluginInstance._manifest.id+":hide", function(event){
            $scope.showTemplate = false;
            $scope.safeApply();
        });
    }

    $scope.init();

    // $scope.questionObj = {
    //     "question": "Choose the best",
    //     "options": [{
    //         "value": {
    //         	"id": "a",
    //             "type": "mixed",
    //             "text": "This is an Apple This is an Apple This is an Apple This is an Apple",
    //             "audio": "leg_aud",
    //             "image": "home_img"

    //         }
    //     }, {
    //         "value": {
    //         	"id": "b",
    //             "type": "mixed",
    //             "text": "Mango",
    //             "audio": "earspell_aud",
    //             "image": ""
    //         }
    //     }, {
    //         "value": {
    //         	"id": "c",
    //             "type": "mixed",
    //             "text": "Orange",
    //             "audio": "earspell_aud",
    //             "image": ""
    //         }
    //     }, {
    //         "value": {
    //         	"id": "d",
    //             "type": "mixed",
    //             "text": "Banana",
    //             "audio": "earspell_aud",
    //             "image": ""

    //         },

    //         "answer": true
    //     }, {
    //         "value": {
    //         	"id": "e",
    //             "type": "mixed",
    //             "text": "Mango1",
    //             "audio": "earspell_aud",
    //             "image": ""
    //         }
    //     }, {
    //         "value": {
    //         	"id": "f",
    //             "type": "mixed",
    //             "text": "Orange1",
    //             "audio": "earspell_aud",
    //             "image": ""
    //         }
    //     }]
    // }
    $scope.selectedValue = function(value, event) {
        console.log("value",value);
    	$("#"+event.target.id).parent().css("border","3px solid #166ca6").css("z-index","4").css("box-shadow","2px 2px 2px 2px #93bdda");
    	$("#"+event.target.id).parent().siblings().css("border","2px solid #166ca6").css("z-index","1").css("box-shadow","none");
    }
  
});