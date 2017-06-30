/**
 * Plugin to create repo instance and to register repo instance
 * @extends EkstepRenderer.Plugin
 * @author Manjunath Davanam <manjunathd@ilimi.in>
 * ref: http://ify.io/lazy-loading-in-angularjs/
 */
Plugin.extend({
    _templatePath: undefined,
    _type: "overlay",
    _ngScopeVar: "overlay",
    initialize: function() {
        console.info('overlay plugin is doing initialize....', this);
        this._templatePath = org.ekstep.pluginframework.pluginManager.resolvePluginResource(this._manifest.id, this._manifest.ver, "renderer/templates/overlay.html");
        this.controllerPath = org.ekstep.pluginframework.pluginManager.resolvePluginResource(this._manifest.id, this._manifest.ver, "renderer/controller/overlay.js");
        
        var instance = this;
        org.ekstep.service.controller.loadNgModules(this._templatePath, this.controllerPath, function(injectTemplateFn){
            injectTemplateFn(instance._templatePath, instance._ngScopeVar, '#gameArea');
        });

        EkstepRendererAPI.addEventListener("render:overlay:applyStyles", instance.updateRendererStyles, instance);
    },
    updateRendererStyles: function(event, instance){
       var gameArea = document.getElementById("overlay");
        var widthToHeight = 16 / 9;
        var newWidth = window.innerWidth;
        var newHeight = window.innerHeight;
        var newWidthToHeight = newWidth / newHeight;
        if (newWidthToHeight > widthToHeight) {
            newWidth = newHeight * widthToHeight;
            gameArea.style.height = newHeight + 'px';
            gameArea.style.width = newWidth + 'px';
        } else {
            newHeight = newWidth / widthToHeight;
            gameArea.style.width = newWidth + 'px';
            gameArea.style.height = newHeight + 'px';
        }

         gameArea.style.left = "50%";
         gameArea.style.top = "50%";
        gameArea.style.marginTop = (-newHeight / 2) + 'px';
        gameArea.style.marginLeft = (-newWidth / 2) + 'px';
    },
    applyStyles: function(ele, prop, val){
        ele.style[prop] = val;
        var contentArea = document.getElementById(Renderer.divIds.contentArea);
       // contentArea.style[prop] = val;
    },
});