/**
 * @description
 * Base Launcher to launch any type launcher i.e Ecml/Html/Pdf/Youtube/video/h5p launcher.
 * child launcher can overide the specific method to change the behavior.
 * To extend the functionality of the baseLauncher child Launcher should use this._super();
 * @class org.ekstep.contentrenderer.baseLauncher.
 * @extends Class
 * @author Manjunath Davanam <manjunathd@ilimi.in>
 */

org.ekstep.contentrenderer.baseLauncher = Class.extend({
	contentMetaData: undefined,
	manifest: undefined,
	enableHeartBeatEvent: false,
	heartBeatData: {},
	sleepMode: true,
	isEndPageSeen: false,

	/**
     * init of the launcher with the given data.
     * @param data {object} return the manifest object data
     * @memberof org.ekstep.contentrenderer.baseLauncher
     */
	init: function (manifest) {
		try {
			EkstepRendererAPI.addEventListener("renderer:telemetry:end", this.endTelemetry, this)
			EkstepRendererAPI.addEventListener("renderer:content:end", this.end, this)
			EkstepRendererAPI.addEventListener("renderer:content:replay", this.replay, this)
			this.manifest = manifest
			this.contentMetaData = content
			EkstepRendererAPI.dispatchEvent("renderer:launcher:register", this)
			this.initLauncher(this.manifest)
		} catch (error) {
			this.throwError(error)
		}
	},

	initLauncher: function () {
		console.info("Base launcher should constuct.")
	},

	/**
     * launch of the particular launcher based on the mimetype.
     * @memberof org.ekstep.contentrenderer.baseLauncher
     */
	start: function () {
		var instance = this
		this.cleanUp()
		EkstepRendererAPI.addEventListener("renderer:launcher:clean", this.cleanUp, this)
		console.info("Base Launcher should construct")
		this.resetDomElement()
		this.sleepMode = false
		if (this.enableHeartBeatEvent) {
			this.heartBeatEvent(true)
		}
		setTimeout(function () {
			instance.startTelemetry()
		}, 0)
	},

	/**
     * End of the content listen for the renderer:content:end event.
     * Any child launcher can extend/override this functionality.
     * @memberof org.ekstep.contentrenderer.baseLauncher
     */
	end: function () {
		if (this.sleepMode) return
		this.isEndPageSeen = true	
		this.heartBeatEvent(false)
		this.endTelemetry()
		EkstepRendererAPI.dispatchEvent("renderer:endpage:show")
	},

	/**
     * Replay of the particular launcher.
     * Any child launcher can extends/override this functionality.
     * @memberof org.ekstep.contentrenderer.baseLauncher
     */
	replay: function () {
		if (this.sleepMode) return
		this.heartBeatEvent(false)
		this.endTelemetry()
		this.start()
	},

	/**
     * Clearing of the Launcher instace
     * @memberof org.ekstep.contentrenderer.baseLauncher
     */
	cleanUp: function () {
		console.info("Clearing the launcher instance")
		this.sleepMode = true
		EkstepRendererAPI.removeEventListener("renderer:launcher:clean", this.cleanUp, this)
	},

	/**
     * Calculates the content progress
     * @param currentIndex {int} Current stage number
     * @param totalIndex {int} Total number of stages in the content.
     */
	progres: function (currentIndex, totalIndex) {
		var totalProgress = (currentIndex / totalIndex) * 100
		totalProgress = _.isFinite(totalProgress) ? totalProgress : 0
		totalProgress = totalProgress > 100 ? 100 : Math.round(totalProgress)
		return totalProgress
	},
	contentProgress: function () {
		console.warn("Child Launcher should calculate")
	},

	/**
	 *  generic Summary event
	 */
	
	contentPlaySummary : function () {
		return [{"totallength":""},{"visitedlength":""},{"visitedcontentend":""},{"totalseekedlength": ""}]
	},
	
	additionalContentSummary: function () {
		console.warn("content launcher should implement this for additional content statistics ")
	},

	/**
     * Generation of the OE_START Telemetry event.
     */

	startTelemetry: function () {
		var data = {}
		data.stageid = EkstepRendererAPI.getCurrentStageId()
		data.mode = getPreviewMode()
		data.duration = (Date.now() / 1000) - window.PLAYER_START_TIME
		var gameId = content.identifier
		var version = content.pkgVersion || "1.0"
		window.PLAYER_STAGE_START_TIME = Date.now() / 1000
		TelemetryService.start(gameId, version, data)
	},

	/**
     * Generation of OE_END Telemetry event.
     */
	endTelemetry: function () {
		if (this.sleepMode) return
		if (TelemetryService.instance && TelemetryService.instance.telemetryStartActive()) {
			var telemetryEndData = {}
			var endpageSeen = [{ "endpageseen" : this.isEndPageSeen }]
			var contentProgress = [{ "progress" : this.contentProgress() }]
			telemetryEndData.stageid = getCurrentStageId()
			telemetryEndData.progress = this.contentProgress()
			telemetryEndData.summary = _.union(contentProgress,this.contentPlaySummary(),endpageSeen)
			console.info("telemetryEndData", telemetryEndData)
			TelemetryService.end(telemetryEndData)
		} else {
			console.warn("Telemetry service end is already logged Please log start telemetry again")
		}
	},

	/**
     * It Generates the HEARTBEAT Telemetry event.
     * Any child launcher can extends/overide this functionality.
     */

	heartBeatEvent: function (flag) {
		var instance = this
		if (flag) {
			instance._time = setInterval(function () {
				EkstepRendererAPI.getTelemetryService().interact("HEARTBEAT", "", "", instance.heartBeatData || {})
			}, EkstepRendererAPI.getGlobalConfig().heartBeatTime)
		} else
		if (!flag) {
			clearInterval(instance._time)
		}
	},

	/**
     * It return the current player gameArea.
     */
	getGameArea: function () {
		return document.getElementById("gameArea")
	},

	/**
     * Provides an ability to add dom element to player gamearea.
     * Any child launcher can extends/override this functionality.
     */
	addToGameArea: function (domElement) {
		domElement.id = this.manifest.id
		jQuery("#" + this.manifest.id).insertBefore("#gameArea")
		var gameArea = this.getGameArea()
		gameArea.insertBefore(domElement, gameArea.childNodes[0])
		jQuery("#gameArea").css({
			left: "0px",
			top: "0px",
			width: "100%",
			height: "100%",
			marginTop: 0,
			marginLeft: 0
		})
		var elementId = document.getElementById(this.manifest.id)
		elementId.style.position = "absolute"
		elementId.style.display = "block"
		elementId.style.width = "100%"
		elementId.style.height = "100%"
	},

	/**
     * Provides an ability to remove the dom element from player gamearea.
     * Any child launcher can extends/override this functionality.
     */
	resetDomElement: function () {
		jQuery("#" + this.manifest.id).remove()
		var chilElemtns = jQuery("#gameArea").children()
		jQuery(chilElemtns).each(function () {
			if ((this.id !== "overlay") && (this.id !== "gameCanvas")) {
				jQuery(this).remove()
			}
		})
	},

	/**
     * Return the dom element which is being added to gameArea.
     */
	getLauncherDom: function () {
		return document.getElementById(this.manifest.id)
	},

	/**
     * Provides an ability to throw an custom error message and it will generates an OE_ERROR events.
     * Any child launcher can extends/override this functionality.
     */
	throwError: function (errorObj) {
		if (errorObj) {
			EkstepRendererAPI.dispatchEvent("renderer:toast:show", undefined, {
				message: errorObj.message || "Sorry!!.. Unable to open the Content",
				type: "error",
				custom: { timeOut: 200000 },
				errorInfo: {
					errorStack: errorObj,
					data: errorObj.data || { "severity": "fatal", "type": "content", "action": "play" }
				}
			})
		}
	}
})
