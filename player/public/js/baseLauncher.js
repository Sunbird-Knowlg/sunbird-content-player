/**
 * Base launcher will launches all launcher it porvides a common supports for all the launcher.
 * any launcher can overide the specific method to change the behavior.
 * @class org.ekstep.contentrenderer.baseLauncher
 * @author Manjunath Davanam <manjunathd@ilimi.in>
 */

org.ekstep.contentrenderer.baseLauncher = Class.extend({


/**
 * init of the launcher with the given data.
 * @param data {object} return the manifest object data
 * @memberof org.ekstep.contentrenderer.baseLauncher
 */
init:function(data){
	console.info('Base Launcher init...');
	this.initialize(data);
},

/**
 * Initializes of the launcher with the given data.
 * @param data {object} return the manifest object data any launcher must extend initialize
 * method to load the launcher in globally
 * @memberof org.ekstep.contentrenderer.baseLauncher
 */

initialize:function(data){
	console.info('Base Launcher is intializd');
},

/**
 * launching of the particular launcher
 * @memberof org.ekstep.contentrenderer.baseLauncher
 */

launch:function(){
	console.info('Base Launcher should construct');
},


/**
 * relaunch of the particular launcher
 * @memberof org.ekstep.contentrenderer.baseLauncher
 */

relaunch: function() {
    console.info('Base Launcher should construct');
    var data = {};
		data.stageid = EkstepRendererAPI.getCurrentStageId();
    data.mode = getPreviewMode();
    TelemetryService.start(GlobalContext.game.id, GlobalContext.game.ver, data);
},

/**
 * Clearing of the Lancher instace
 * @memberof org.ekstep.contentrenderer.baseLauncher
 */

clear:function(){
	console.info('Clearing the launcher instance')
}

});
