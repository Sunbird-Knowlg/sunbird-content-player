/**
 * @author Manjunath Davanam <manjunathd@ilimi.in>
 */
org.ekstep.service.controller = new(org.ekstep.service.mainService.extend({
	loadModules: undefined,
	loadTemplates: undefined,
	init:function(){
	 	console.info('controller service init');
	},
	initService: function(loadModuleFn) {
        this.loadModules = loadModuleFn;
    },
    loadNgModules: function(templatePath, controllerPath) {
        this.loadModules && this.loadModules(templatePath, controllerPath);
    },
    injectTemplate:function(injectTemplatesFn){
    	this.loadTemplates = injectTemplatesFn;
    },
    inject: function(templatePath){
    	this.loadTemplates && this.loadTemplates(templatePath);
    }
}));