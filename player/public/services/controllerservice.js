/**
 * @author Manjunath Davanam <manjunathd@ilimi.in>
 */
org.ekstep.service.controller = new (org.ekstep.service.mainService.extend({
	loadModules: undefined,
	loadTemplates: undefined,
	callback: undefined,
	init: function () {},
	initService: function (loadModuleFn) {
		this.loadModules = loadModuleFn
	},
	loadNgModules: function (templatePath, controllerPath, callback) {
		this.loadModules && this.loadModules(templatePath, controllerPath, callback)
	},
	injectTemplate: function (injectTemplatesFn) {
		this.loadTemplates = injectTemplatesFn
	},
	inject: function (templatePath, toElement) {
		this.loadTemplates && this.loadTemplates(templatePath, toElement)
	}
}))()
