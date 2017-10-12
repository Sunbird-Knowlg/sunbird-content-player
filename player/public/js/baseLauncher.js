/**
 * Base launcher will launches all launcher it porvides a common supports for all the launcher.
 * any launcher can overide the specific method to change the behavior.
 * @class org.ekstep.contentrenderer.baseLauncher
 * @author Manjunath Davanam <manjunathd@ilimi.in>
 */

org.ekstep.contentrenderer.baseLauncher = Class.extend({
    contentData: undefined,
    manifest: undefined,

    /**
     * init of the launcher with the given data.
     * @param data {object} return the manifest object data
     * @memberof org.ekstep.contentrenderer.baseLauncher
     */
    init: function(manifest) {
        try {
            EkstepRendererAPI.addEventListener("renderer:telemetry:end", this.endTelemetry, this);
            EkstepRendererAPI.addEventListener('renderer:content:end',this.end,this);
            EkstepRendererAPI.addEventListener('renderer:content:replay', this.replay, this);
            this.manifest = manifest;
            this.initLauncher(this.manifest);
        } catch (error) {
            this.throwError(error);
        }
    },

    initLauncher: function(){
    	console.info("Base launcher should constuct.");
    },
    /**
     * launching of the particular launcher
     * @memberof org.ekstep.contentrenderer.baseLauncher
     */
    start: function() {
        console.info('Base Launcher should construct');
        this.resetDomElement();
        this.startTelemetry();
    },


    end:function(){
    	this.endTelemetry();
        EkstepRendererAPI.dispatchEvent("renderer:endpage:show");
    },

    /**
     * relaunch of the particular launcher
     * @memberof org.ekstep.contentrenderer.baseLauncher
     */

    replay: function() {
    	this.start();
    },

    /**
     * Clearing of the Lancher instace
     * @memberof org.ekstep.contentrenderer.baseLauncher
     */

    clear: function() {
        console.info('Clearing the launcher instance')
    },

    progres: function(currentIndex, totalIndex) {
        var totalProgress = (currentIndex / totalIndex) * 100;
        totalProgress = totalProgress > 100 ? 100 : totalProgress;
        return Math.round(totalProgress);
    },
    contentProgress: function() {
        console.warn("Child Launcher should calculate");
    },
    startTelemetry: function() {
        var data = {};
        data.stageid = EkstepRendererAPI.getCurrentStageId();
        data.mode = getPreviewMode();
        TelemetryService.start(GlobalContext.game.id, GlobalContext.game.ver, data);
    },
    endTelemetry: function(event) {
        if (TelemetryService.instance && TelemetryService.instance.telemetryStartActive()) {
            var telemetryEndData = {};
            telemetryEndData.stageid = getCurrentStageId();
            telemetryEndData.progress = this.contentProgress();
            console.info("telemetryEndData", telemetryEndData);
            TelemetryService.end(telemetryEndData);
        } else {
            console.warn('Telemetry service end is already logged Please log start telemetry again');
        }
    },
    heartBeatEvent: function(flag, data) {
        var instance = this;
        if (flag) {
            instance._time = setInterval(function() {
                EkstepRendererAPI.getTelemetryService().interact("HEARTBEAT", "", "", data || {});
            }, EkstepRendererAPI.getGlobalConfig().heartBeatTime);
        }
        if (!flag) {
            clearInterval(instance._time);
        }
    },
    addToGameArea: function(domElement) {
        domElement.id = this.manifest.id;
        jQuery('#' + this.manifest.id).insertBefore("#gameArea");
        var gameArea = document.getElementById('gameArea');
        gameArea.insertBefore(domElement, gameArea.childNodes[0]);
        jQuery('#gameArea').css({
            left: '0px',
            top: '0px',
            width: "100%",
            height: "100%"
        });
        var elementId = document.getElementById(this.manifest.id);
        elementId.style.position = 'absolute';
        elementId.style.display = 'block';
        elementId.style.width = '100%';
        elementId.style.height = '100%';
    },
    resetDomElement: function() {
        console.info('Child Launcher should implement');
        jQuery('#' + this.manifest.id).remove();
        var chilElemtns = jQuery('#gameArea').children();
        jQuery(chilElemtns).each(function() {
            if ((this.id !== "overlay") && (this.id !== "gameCanvas")) {
                jQuery(this).remove();
            }
        });
    },
    throwError: function(errorInfo) {
        var errorMessage = 'Sorry!!.. Unable to open the Content';
        var errorStack = undefined;
        if (errorInfo) {
            errorStack = errorInfo.stack
        };
        EkstepRendererAPI.logErrorEvent(errorStack, {
            'severity': 'fatal',
            'type': 'content',
            'action': 'play'
        });
        showToaster("error", errorMessage, {
            timeOut: 200000
        });
    },
    reset: function() {
        if (document.getElementById(this.manifest.id)) {
            videojs(this.manifest.id).dispose();
            jQuery('#' + this.manifest.id).remove();
        }
        this.progressTimer(false);
        this.currentTime = 0;
    },
    


});