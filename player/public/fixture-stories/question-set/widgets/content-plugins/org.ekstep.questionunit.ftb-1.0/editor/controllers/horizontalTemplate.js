/**
 * Plugin to create question
 * @class org.ekstep.plugins.ftbplugin:createquestionController
 * Gourav More<gourav_m@tekditechnologies.com>
 */
'use strict';
angular.module('createquestionapp', [])
  .controller('ftbQuestionFormController', ['$scope', '$rootScope', function($scope, $rootScope) {

    $scope.config = [];
    $scope.questionData = [];
    $scope.config = [{
        maxLen: 220,
        isImage: true,
        isText: true,
        isAudio: true,
        isOption: false,
        isAnsOption: false,
        isHeader: true,
        headerName: 'Enter the question',
        isQuestion: true,
        isAnswer: false
      },
      {
        maxLen: 25,
        isImage: false,
        isText: true,
        isAudio: false,
        isOption: false,
        isAnsOption: true,
        isHeader: true,
        headerName: 'Set answer',
        isQuestion: false,
        isAnswer: true
      }
    ];

    $scope.image = false;
    $scope.audio = false;
    $scope.question = "";
    $rootScope.defaultConfigData = $scope.config;

    if (!ecEditor._.isUndefined($scope.questionEditData)) {
      $scope.questionData = $scope.questionEditData.data;
      if ($scope.questionData.answer.length > 2) {
        for (var j = 2; j < $scope.questionData.answer.length; j++) {
          $scope.config.push({ maxLen: 25, isImage: true, isText: true, isAudio: true, isOption: false, isAnsOption: false, isHeader: false, headerName: ' ', isQuestion: false, isAnswer: true });
        }
      }
      if ($scope.questionData.answer.length < 2) {
        $scope.config.splice(2, 1);
      }
    }

    $scope.$parent.$on('question:form:val', function(event) {
      if ($scope.getdetails()) {
        $scope.$emit('question:form:valid', $scope.finalDataObj);
      } else {
        $scope.$emit('question:form:inValid', $scope.finalDataObj);
      }
    });

    $scope.init = function() {
      console.log("i am loading..FTB plugin");
    }
 
    $scope.init();

    $scope.addAnswerField = function() {
      if ($scope.config.length <= 4)
        $scope.config.push({
          maxLen: 25,
          isImage: false,
          isText: true,
          isAudio: false,
          isOption: false,
          isAnsOption: true,
          isHeader: true,
          headerName: ' ',
          isQuestion: false,
          isAnswer: true
        });
    }


    $scope.cancel = function() {
      $scope.closeThisDialog();
    }

    $scope.showPreview = true;
    $scope.setPreviewData = function() {
      $scope.getdetails();
      this.previewURL = (ecEditor.getConfig('previewURL') || 'content/preview/preview.html') + '?webview=true';
      var instance = this;
      var contentService = ecEditor.getService('content');
      var defaultPreviewConfig = {
        showEndpage: true
      };
      var previewContentIframe = ecEditor.jQuery('#previewContentIframe')[0];
      previewContentIframe.src = instance.previewURL;
      var userData = ecEditor.getService('telemetry').context;
      previewContentIframe.onload = function() {
        var configuration = {};
        userData.etags = userData.etags || {};
        configuration.context = {
          'mode': 'edit',
          'sid': userData.sid,
          'uid': userData.uid,
          'channel': userData.channel,
          'pdata': userData.pdata,
          'app': userData.etags.app,
          'dims': userData.etags.dims,
          'partner': userData.etags.partner,
          'contentId': ecEditor.getContext('contentId'),
        };
        if (ecEditor.getConfig('previewConfig')) {
          configuration.config = ecEditor.getConfig('previewConfig');
        } else {
          configuration.config = defaultPreviewConfig;
        }
        configuration.metadata = ecEditor.getService(ServiceConstants.CONTENT_SERVICE).getContentMeta(ecEditor.getContext('contentId'));
        configuration.data = org.ekstep.contenteditor.stageManager.toECML();
        previewContentIframe.contentWindow.initializePreview(configuration);

      };
    }

    $scope.addToLesson = function() {
      $scope.getdetails();
      $scope.cancel();
    }

    $scope.getdetails = function() {
      var data = {};
      data.question = {};
      data.answer = [];
      var result = false;
      var check = false;
      var temp = {};
      var text1 = $("#textQ").val();
      var image1 = $('#imageQ').attr('src');
      var audio1 = $('#audioQ').attr('src');
      if (text1.length > 0) {
        data.question.text = text1;
        $("#textQ").css('border-bottom-color', 'inherit');
      }
      if (image1 && image1.length > 0) {
        data.question.image = image1;
      }
      if (audio1 && audio1.length > 0) {
        data.question.audio = audio1;
      }
      if (text1 || image1 || audio1) {
        result = false;
        // $("#textQ").css('border-bottom-color', 'red');
      }
      for (var i = 1; i < $scope.config.length; i++) {

        var temp = {};

        var text2 = $("#answerField_" + i).val();
        var text3 = $("#answerField_" + i).val().length > 0 ? true : false;
        if (text3) {
          temp.text = text2;
          $("#answerField_" + i).css('border-bottom-color', 'inherit');
          result = true;
        } else {
          result = false;
          $("#answerField_" + i).css('border-bottom-color', 'red');
          break;
        }
        temp.text = temp.text.toLowerCase();


        data.answer.push(temp);
      }
      if (result) {
        var configData = {};
        $scope.finalDataObj = data;
        configData["config"] = {
          __cdata: JSON.stringify(data)
        };
        ecEditor.dispatchEvent("org.ekstep.plugins.ftbplugin:create", configData);
        console.log("configData", data);
        return true;
      } else {
        return false;
      }

      // }
    }

  }])
  .directive('ftbEditor', function() {
    return {
      scope: {
        "config": "=?",
        "index": "=?",
        "questionData": "=?",
        "jags": "=?"
      },
      controller: 'createquestionController',
      templateUrl: 'editortemplate1',
    }
  })

  .controller('createquestionController', ['$scope', '$compile', '$injector', function($scope, $compile, $injector) {
    $scope.config = $scope.config || {};
    $scope.maxLen = $scope.config.maxLen;
    $scope.isText = $scope.config.isText;
    $scope.isImage = $scope.config.isImage;
    $scope.isAudio = $scope.config.isAudio;
    $scope.isOption = $scope.config.isOption;
    $scope.isAnsOption = $scope.config.isAnsOption;
    $scope.headerName = $scope.config.headerName;
    $scope.isQuestion = $scope.config.isQuestion;
    $scope.isAnswer = $scope.config.isAnswer;
    $scope.isHeader = $scope.config.isHeader;
    var count = $scope.index;

    $scope.editorObj1 = $scope.jags || {};
    $scope.question = '';
    $scope.activeMenu = 'Text'
    $scope.selectedImageURL = '';
    $scope.selectedAudioURL = '';
    $scope.audioSelectedURL = '';
    $scope.quesAudioSelectedURL = '';
    $scope.ansAudioSelectedURL = [];
    $scope.audioPlay = true;
    $scope.audioPause = false;
    $scope.addtolesson = true;
    if ($scope.editorObj1.length != 0) {
      if ($scope.editorObj1.question.audio != undefined) {
        $scope.quesAudioSelectedURL = new Audio($scope.editorObj1.question.audio);
        $scope.play = true;
      }
      if ($scope.editorObj1.answer.length != 0) {
        for (var i = 0; i < $scope.editorObj1.answer.length; i++) {
          if ($scope.editorObj1.answer[i].audio == undefined) {
            $scope.ansAudioSelectedURL.push('');
          } else {
            $scope.ansAudioSelectedURL.push(new Audio($scope.editorObj1.answer[i].audio));
            $scope.play = true;
          }
        }

      }
    }
    // $scope.play1 = true;
    ecEditor.jQuery('.ui.dropdown').dropdown({
      useLabels: false
    });
    $('.longer.modal')
      .modal('show');

    $('.demo.menu .item').tab({
      history: false
    });
    $('.test.modal')
      .modal('show');
    $scope.addTab = function(type, id) {

      if (type == 'image') {
        $scope.addImage(id);
      } else if (type == 'audio') {
        $scope.addAudio(id);
      }

    }
    $scope.addImage = function(id) {
      ecEditor.dispatchEvent('org.ekstep.assetbrowser:show', {
        type: 'image',
        search_filter: {}, // All composite keys except mediaType
        callback: function(data) {
          data.x = 20;
          data.y = 20;
          data.w = 50;
          data.h = 50;
          data.from = 'plugin';
          $scope.selectedImageURL = data.assetMedia.src;
          if ($scope.editorObj1 != undefined && $scope.editorObj1.question != undefined && $scope.editorObj1.question.image != undefined ? true : false) {
            $scope.editorObj1.question.image = "";
          }
          if ($scope.editorObj1 != undefined && $scope.editorObj1.answer != undefined && $scope.editorObj1.answer[id - 1] != undefined && $scope.editorObj1.answer[id - 1].image != undefined ? true : false) {
            $scope.editorObj1.answer[id - 1].image = "";
          }

          $scope.image = true;

          $("#second_" + id).addClass('active');
          $("#secondTab_" + id).addClass('active');
          $("#second_" + id).siblings().removeClass('active');
          $("#secondTab_" + id).siblings().removeClass('active');
        }
      });
    }

    $scope.addAudio = function(id) {
      ecEditor.dispatchEvent('org.ekstep.assetbrowser:show', {
        type: 'audio',
        search_filter: {}, // All composite keys except mediaType
        callback: function(data) {
          $scope.selectedAudioURL = data.assetMedia.src;
          $scope.audioSelectedURL = new Audio($scope.selectedAudioURL);
          if ($scope.editorObj1 != undefined && $scope.editorObj1.question != undefined && $scope.editorObj1.question.audio != undefined ? true : false) {
            $scope.editorObj1.question.audio = "";
          }
          if ($scope.editorObj1 != undefined && $scope.editorObj1.answer != undefined && $scope.editorObj1.answer[id - 1] != undefined && $scope.editorObj1.answer[id - 1].audio != undefined ? true : false) {
            $scope.editorObj1.answer[id - 1].audio = "";
          }
          $scope.audio = true;
          //$scope.image = false;
          $scope.play = true;
          // $scope.pause = false;

          $("#third_" + id).addClass('active');
          $("#thirdTab_" + id).addClass('active');
          $("#third_" + id).siblings().removeClass('active');
          $("#thirdTab_" + id).siblings().removeClass('active');
        }
      });
    }

    $scope.playAudio = function(status, id) {
      if (status == true) {
        if (id != undefined && $scope.ansAudioSelectedURL[id] != '') {
          $scope.ansAudioSelectedURL[id].play();
        } else if ($scope.quesAudioSelectedURL != '') {
          $scope.quesAudioSelectedURL.play();
        } else {
          $scope.audioSelectedURL.play();
        }
        $scope.play = false;
      } else {
        if (id != undefined && $scope.ansAudioSelectedURL[id] != '') {
          $scope.ansAudioSelectedURL[id].pause();
        } else if ($scope.quesAudioSelectedURL != '') {
          $scope.quesAudioSelectedURL.pause();
        } else {
          $scope.audioSelectedURL.pause();
        }
        $scope.play = true;
      }
    }

    $scope.deleteAudio = function(id, isQAud) {
      $scope.audio = false;
      if ($scope.editorObj1 != undefined && $scope.editorObj1.answer != undefined && $scope.editorObj1.answer[id - 1] != undefined && $scope.editorObj1.answer[id - 1].audio != undefined ? true : false) {
        $scope.editorObj1.answer[id - 1].audio = "";
      }
      if ($scope.editorObj1 != undefined && $scope.editorObj1.question != undefined && $scope.editorObj1.question.audio != undefined ? true : false) {
        $scope.editorObj1.question.audio = "";
      }
      if (isQAud == false) {
        $('#audio_' + id).attr('src', '');
      } else {
        $('#audioQ').attr('src', '');
      }

      $("#first_" + id).addClass('active');
      $("#firstTab_" + id).addClass('active');
      $("#first_" + id).siblings().removeClass('active');
      $("#firstTab_" + id).siblings().removeClass('active');

    }

    $scope.deleteImage = function(id, isQImg) {
      $scope.image = false;
      if ($scope.editorObj1 != undefined && $scope.editorObj1.answer != undefined && $scope.editorObj1.answer[id - 1] != undefined && $scope.editorObj1.answer[id - 1].image != undefined ? true : false) {
        $scope.editorObj1.answer[id - 1].image = "";
      }
      if ($scope.editorObj1 != undefined && $scope.editorObj1.question != undefined && $scope.editorObj1.question.image != undefined ? true : false) {
        $scope.editorObj1.question.image = "";
      }
      if (isQImg == true) {
        $('#imageQ').attr('src', '');
      } else {
        $('#image_' + id).attr('src', '');
      }
      $("#first_" + id).addClass('active');
      $("#firstTab_" + id).addClass('active');
      $("#first_" + id).siblings().removeClass('active');
      $("#firstTab_" + id).siblings().removeClass('active');
    }

    $scope.deleteAnswer = function(id) {
      $("#main_" + id).hide();
    }
  }]);

//# sourceURL=ftbcreatequestion.js