'use strict';

var OverlayController = OverlayController || {};

var imageBasePath = globalConfig.assetbase;
var nextImage = imageBasePath+'next.png';
var prevImage = imageBasePath+'prev.png';
var submitImage = globalConfig.assetbase + "submit_enable.png";
var Disableimage = globalConfig.assetbase + "submit_disable.png";
var reloadImage = imageBasePath+'icn_replayaudio.png';
var globalConfig = EkstepRendererAPI.getGlobalConfig();
var applables;


OverlayController.initTemplate = function (pluginInstance) {
    OverlayController.pluginInstance = pluginInstance;
    var pluginInstance = EkstepRendererAPI.getPluginObjs("org.ekstep.overlay");
    if (globalConfig.languageInfo) {
        for (var key in globalConfig.languageInfo) {
            AppLables[key] = globalConfig.languageInfo[key];
        }
    }
    this.AppLables = AppLables;
};

/**
 * loads the template content html
 */
OverlayController.loadOverlayTemplate = function () {
    
    return '<div id="overlay-container"></div>';
  };

OverlayController.nextButton = function() {
    return nextBtnTemplate = '<div>\<a class="nav-icon nav-next" id="nextButton" href="javascript:void(0);">\
                             <img src='+nextImage+' onclick="navigate("next")">\
                            </a>\
                        </div>'
};

OverlayController.previousButton = function() {
    return prevBtnTemplate = '<div>\
                        <a class="nav-icon nav-previous" id="prevButton" href="javascript:void(0);">\
                        <img src='+prevImage+' onclick="navigate("previous")">\
                        </a>\
                    </div>';
};            
                    
OverlayController.assess =  function() {
    return assesTemplate = '<div image="icons.assess.enable">\
                            <a class="assess" class="assessStyle" href="javascript:void(0);"\
                                onclick="onSubmit()">true<img src='+submitImage+'/>\
                            </a>\
                         </div>';                    
};

OverlayController.reloadStage = function () {
    return reloadStageTemplate = '<div id="showReload" style="position: absolute;width: 7%;bottom: 1%;left: 1%;">\
                                    <span class="reload-stage" onclick="EventBus.dispatch(\'actionReload\')">\
                                    <img id="reload_id" src='+reloadImage+' style="width:100%;"/></span></div>'; 
}

OverlayController.contentClose  = function () {
    var contentCloseIcon = EkstepRendererAPI.resolvePluginResource(this.pluginInstance._manifest.id, this.pluginInstance._manifest.ver, "renderer/assets/icons/content-close.png");
    return contentCloseTemplate = '<div id="showContentClose" style="position: absolute;width: 7%;top: 1%;right: 1%;">\
                                    <span class="content-close" onclick="closeContent();" id="showContentClose !== state_off">\
                                    <img id="content_close" src="'+contentCloseIcon+'" style="width:100%;"/></span></div>';
}

OverlayController.tryAgain = function () {
    return tryAgainTemplate = '<div id="showOverlayTryAgain"><div class="popup">\
                                    <div class="popup-overlay" onclick="hidePopup()">\
                                </div> \
                                <div class="popup-full-body">\
                                    <div class="font-lato assess-popup assess-tryagain-popup">\
                                    <div class="wrong-answer" style=" text-align: center;">\
                                        <div class="banner">\
                                         <img src="'+ imageBasePath +"banner2.png" +'height="100%" width="100%">\
                                         </div>\
                                         <div class="sign-board">\
                                             <img src="'+imageBasePath+"incorrect.png" +'width="40%" id="incorrectButton" />\
                                        </div>\
                                </div>\
                                <div id="popup-buttons-container"> \
                                <div onclick="hidePopup(); moveToNextStage(\'next\');" class="left button">'+AppLables.next+'</div>\
                                <div onclick="retryAssessment(\'gc_retry\', $event);" href="javascript:void(0);" class="right primary button">'+AppLables.tryAgain+'</div> \
                            </div> \
                        </div> \
                    </div> \
                </div>\
            </div>';
};

OverlayController.goodJob = function () {
    return goodJobTemplate = '<div class="popup">\
                                <div class="popup-overlay" onclick="hidePopup()">\
                              </div>\
                              <div class="popup-full-body">\
                                <div class="font-lato assess-popup assess-goodjob-popup">\
                                <div class="correct-answer" style=" text-align: center;">\
                                <div class="banner">\
                                    <img src="'+imageBasePath+"banner3.png"+'height="100%" width="100%">\
                                </div>\
                                <div class="sign-board">\
                                    <img src="'+imageBasePath+"check.png"+'id="correctButton" width="40%" />\
                                </div>\
                            </div>\
                            <div id="popup-buttons-container">\
                            <div onclick="hidePopup(); moveToNextStage(\'next\');" class="primary center button">'+AppLables.next+'</div>\
                            </div>\
                        </div>\
                        </div>\
                    </div>';
};

OverlayController.getOverlayTemplate = function() {
    var template = '<div id="overlay" class="overlay-html">'
                        +OverlayController.nextButton()+
                        OverlayController.previousButton()+
                        OverlayController.assess()+
                        OverlayController.reloadStage()+
                        OverlayController.contentClose()+
                        OverlayController.tryAgain()+
                        OverlayController.goodJob()
        '</div>';
    /*
    * Appending the template to gameArea
    */
   var overlayVisible = true;
   console.log("getOverlayTemplate:"+template);
   $("#gameArea").append(template);
}

//# sourceURL=overlayPlugin_ctrl.js



