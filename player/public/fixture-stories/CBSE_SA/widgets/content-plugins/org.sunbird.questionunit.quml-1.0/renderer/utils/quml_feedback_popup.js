/**
 * Create Custom feedback popups
 * @extends EkstepRenderer.Plugin
 * @author Jagadish Pujari <jagadish.pujari@tarento.com>
 */
var QuMLFeedbackPopup = {};
QuMLFeedbackPopup._questionData = {};

QuMLFeedbackPopup.createSolutionPopUpElement = function(){
  var solutionFeedback = '<div id="quml-solution-model-popup" style="position:absolute;width:100%;height:100%;z-index:999999;top:0;display:none;"></div>'
  $("#gameArea").append(solutionFeedback);
}
/**
 * Show Good job success model popup on navigation
 * @memberof org.ekstep.questionunit.quml.quml_feedback_popup#
 */
QuMLFeedbackPopup.showGoodJob = function() {
  var goodJobTemplate = _.template('<div class="popup" style="z-index: 9999999;"> <div class="popup-overlay"></div> <div class="popup-full-body"> <div class="feedback-popup-solution"><div class="feedback-overlay"><div class="feedback-content feedback-popup-content correct-answer-popup"><div class="left-section"><div class="result"><div class="banner"><img height="100%" width="100%" src="assets/icons/banner3.png"></div><div class="empty-layer"></div><div class="sign-board"><img width="40%" src="assets/icons/check.png"></div></div></div><div class="right-section"><button type="button" class="sb-btn sb-btn-primary sb-btn-normal sb-btn-responsive" onclick="QuMLFeedbackPopup.hidePopup();QuMLFeedbackPopup.moveToNextStage();">Next</button><% if(QuMLFeedbackPopup._questionData && QuMLFeedbackPopup._questionData.solution && QuMLFeedbackPopup._questionData.solution.length > 0) { %><button type="button" class="sb-btn sb-btn-normal sb-btn-outline-primary sb-btn-responsive" onclick="QuMLFeedbackPopup.showSolution();">Solution</button><% } %></div></div></div></div></div> </div>');
  $("#qs-feedback-model-popup").html(goodJobTemplate);
  $("#qs-feedback-model-popup").show();
  QuMLFeedbackPopup.createSolutionPopUpElement();
}
/**
 * Hide the model popup on navigation
 * @memberof org.ekstep.questionunit.quml.quml_feedback_popup#
 */
QuMLFeedbackPopup.hidePopup = function() {
  $("#qs-feedback-model-popup").hide();
  QuMLFeedbackPopup.logTelemetry('feedback_popup');
}
/**
 * Hide the solution model popup on done/close
 * @memberof org.ekstep.questionunit.quml.quml_feedback_popup#
 */
QuMLFeedbackPopup.hideSolutionPopup = function(){
  $("#quml-solution-model-popup").hide();
  QuMLFeedbackPopup.logTelemetry('close_solution');
}
/**
 * move to next stage or next question
 * @memberof org.ekstep.questionunit.quml.quml_feedback_popup#
 */
QuMLFeedbackPopup.moveToNextStage = function() {
  EkstepRendererAPI.dispatchEvent('renderer:navigation:next');
  QuMLFeedbackPopup.logTelemetry('button-next');
  QuMLFeedbackPopup.hidePopup();
  if (_.isFunction(QuMLFeedbackPopup._callback)) {
    QuMLFeedbackPopup._callback(QuMLFeedbackPopup.result);
  }
}
/**
 * show try again model popup on navigation
 * @memberof org.ekstep.questionunit.quml.quml_feedback_popup#
 */
QuMLFeedbackPopup.showTryAgain = function() {
  var tryAgainTemplate = _.template('<div class="popup" style="z-index: 9999999;"> <div class="popup-overlay"></div> <div class="popup-full-body"> <div class="feedback-popup-solution"><div class="feedback-overlay"><div class="feedback-content feedback-popup-content wrong-answer-popup"><div class="left-section"><div class="result"><div class="banner"><img height="100%" width="100%" src="assets/icons/banner1.png"></div><div class="empty-layer"></div><div class="sign-board"><img width="40%" src="assets/icons/incorrect.png"></div></div></div><div class="right-section"><button type="button" class="sb-btn sb-btn-primary sb-btn-normal sb-btn-responsive" onclick="QuMLFeedbackPopup.hidePopup();QuMLFeedbackPopup.moveToNextStage();">Next</button><button type="button" class="sb-btn sb-btn-primary sb-btn-normal sb-btn-responsive" onclick="QuMLFeedbackPopup.hidePopup();QuMLFeedbackPopup.showRetry();">Try Again</button><% if(QuMLFeedbackPopup._questionData && QuMLFeedbackPopup._questionData.solution &&QuMLFeedbackPopup._questionData.solution.length > 0) { %><button type="button" class="sb-btn sb-btn-normal sb-btn-outline-primary sb-btn-responsive" onclick="QuMLFeedbackPopup.showSolution();">Solution</button><% } %></div></div></div></div></div> </div>');
  $("#qs-feedback-model-popup").html(tryAgainTemplate);
  $("#qs-feedback-model-popup").show();
  QuMLFeedbackPopup.createSolutionPopUpElement();
}
QuMLFeedbackPopup.getHtmlAsSolutionTemplate = function(){
  return '<div class="feedback-content"><div class="close-btn"> <img src="assets/icons/feedback-close.svg" alt="close" class="w-100" onclick="QuMLFeedbackPopup.hideSolutionPopup();"> </div> <div class="feedback-content-questions">'+ QuMLFeedbackPopup._questionData.solution[0].value  +'</div>    <div class="feedback-action-buttons"> <button class="sb-btn sb-btn-primary sb-btn-normal sb-btn-responsive" onclick="QuMLFeedbackPopup.hideSolutionPopup();"> Done </button> </div> </div>';
}
QuMLFeedbackPopup.getVideoAsSolutionTemplate = function(){
  return '<div class="feedback-gallery-view"> <div class="close-btn"> <img src="assets/icons/feedback-close.svg" alt="close" class="w-100" onclick="QuMLFeedbackPopup.hideSolutionPopup();"> </div> <div class="feedback-gallery"> <video class="w-100 video-section" controls=""> <source src="mov_bbb.mp4" type="video/mp4"> </video> </div> </div>';
}
/**
 * show solution model popup
 * @memberof org.ekstep.questionunit.quml.quml_feedback_popup#
 */
QuMLFeedbackPopup.showSolution = function() {
  QuMLFeedbackPopup.logTelemetry('solution_btn');
  var template;
  if(QuMLFeedbackPopup._questionData.solution[0].type == 'html'){
    template = QuMLFeedbackPopup.getHtmlAsSolutionTemplate();
  }else{
    template = QuMLFeedbackPopup.getVideoAsSolutionTemplate();
  }
  $("#quml-solution-model-popup").html(template);
  $("#quml-solution-model-popup").show();
}
/**
 * hide try again model popup on navigation
 * @memberof org.ekstep.questionunit.quml.quml_feedback_popup#
 */
QuMLFeedbackPopup.showRetry = function() {
  EkstepRendererAPI.dispatchEvent('org.ekstep.questionunit.quml:feedback:retry');
  QuMLFeedbackPopup.logTelemetry('button-retry');
  QuMLFeedbackPopup.hidePopup();
}
/*
 * Log telemetry intract event on click on buttons
 * @memberof org.ekstep.questionunit.quml.quml_feedback_popup#
 * @param { string } elem_id.
 */
QuMLFeedbackPopup.logTelemetry = function(elem_id) {
  QSTelemetryLogger.logEvent(QSTelemetryLogger.EVENT_TYPES.TOUCH, { type: QSTelemetryLogger.EVENT_TYPES.TOUCH, id: elem_id });
}
//# sourceURL=qumlFeedbackPopup.js