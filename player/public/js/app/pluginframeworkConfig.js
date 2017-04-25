/*console.info("Plugin framework Config is ready");
var pfConfig = {
    async: async,
    repos: [org.ekstep.pluginframework.publishedRepo],
    pluginsPath: "/widgets/content-plugins",
    env: 'renderer',
    corePlugins : 
};*/
var pfConfig = {};
var initializePluginFramwork = function(gameRelPath) {
    console.log("Plugin framework init is started..");
    // Note : isbrowserpreview will be true only for the portal and editor.
    var pluginsPath = isbrowserpreview ? "/content-plugins" : "/widgets/content-plugins";
    pfConfig.pluginsPath = pluginsPath;
    pfConfig.env = 'renderer';
    pfConfig.async = async;
    pfConfig.pluginRepo = gameRelPath + pfConfig.pluginsPath;
    pfConfig.backwardCompatibalityURL = gameRelPath + '/widgets/';
    org.ekstep.pluginframework.initialize(pfConfig);
};