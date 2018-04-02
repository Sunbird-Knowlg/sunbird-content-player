 /**
 *
 * Plugin to create mcq question
 * @extends org.ekstep.contenteditor.questionUnitPlugin
 * @author Jagadish P <jagadish.pujari@tarento.com>
 */
 org.ekstep.contenteditor.questionUnitPlugin.extend({
 	
 	initialize: function() {  
 		ecEditor.addEventListener("org.ekstep.plugins.mcqplugin:showpopup", this.loadHtml, this);
 		var templatePath = ecEditor.resolvePluginResource(this.manifest.id, this.manifest.ver, 'editor/templates/horizontalTemplate.html');
 		var controllerPath = ecEditor.resolvePluginResource(this.manifest.id, this.manifest.ver, 'editor/controllers/horizontalTemplate.js');
 		ecEditor.getService(ServiceConstants.POPUP_SERVICE).loadNgModules(templatePath, controllerPath);
 	}
 });
//# sourceURL=mcqpluginEditorPlugin.js
