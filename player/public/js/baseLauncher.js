/**
 * Base launcher will launches all launcher it porvides a common supports for all the launcher.
 * any launcher can overide the specific method to change the behavior.
 * @extends base class
 * @author Manjunath Davanam <manjunathd@ilimi.in>
 */

org.ekstep.contentrenderer.baseLauncher = Class.extend({
init:function(){},
initialize:function(){
	console.info('Base Launcher is intializd');
},
relaunch:function(){
	console.info('Relaunching the launcher')
},
clear:function(){
	console.info('Clearing the launcher instance')
}
});