function setUpRenderer() {
    // jQuery.getJSON('base/public/test/testContent/assets/index.json', function(data) {
    //     window.contentBody = _.clone(data)
    // });
    var canvas = "<div ng-app='genie-canvas' id='gameArea'><div id='overlay'></div><canvas id='gameCanvas'></canvas></div>";
    var body = document.getElementsByTagName("body")[0];
    var div = document.createElement('div');
    div.innerHTML = canvas;
    body.appendChild(div.children[0]);
    setGlobalConfig({"context": {}, 'config': {}});
    window.isMobile = window.cordova;
    window.content = JSON.parse('{"baseDir":"base/public/test/testContent", "identifier": "org.ekstep.item.sample", "mimeType": "application/vnd.ekstep.html-archive", "name": "Content Preview ", "author": "EkStep", "localData": {"name": "Content Preview ", "loadingMessage": "Without requirements or design, programming is the art of adding bugs to an empty text file. ...", "identifier": "org.ekstep.item.sample" }, "pkgVersion": 1, "isAvailable": true, "path": ""}');
    org.ekstep.service.init();
    // TelemetryService.isActive = true;
    AppConfig.corePluginspath = 'https://s3.ap-south-1.amazonaws.com/ekstep-public-dev/v3/preview/coreplugins';
    org.ekstep.contentrenderer.initPlugins('', '/base/public/coreplugins');
    GlobalContext.game.id = packageName;
    GlobalContext.game.ver = version;
    startTelemetry(GlobalContext.game.id, GlobalContext.game.ver);
};

setUpRenderer();

