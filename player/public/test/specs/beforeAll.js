function setUpRenderer() {
    var body = document.getElementsByTagName("body")[0];
    var div = document.createElement('div');
    div.id = 'gameArea';
    var canvas = document.createElement('canvas');
    canvas.id = 'gameCanvas';
    div.appendChild(canvas);
    body.appendChild(div);
    setGlobalConfig({});
    window.isMobile = window.cordova;
    window.content = JSON.parse('{"baseDir":"base/public/test/testContent", "identifier": "org.ekstep.item.sample", "mimeType": "application/vnd.ekstep.html-archive", "name": "Content Preview ", "author": "EkStep", "localData": {"name": "Content Preview ", "loadingMessage": "Without requirements or design, programming is the art of adding bugs to an empty text file. ...", "identifier": "org.ekstep.item.sample" }, "pkgVersion": 1, "isAvailable": true, "path": ""}');
    org.ekstep.service.init();
    TelemetryService.isActive = true;
    AppConfig.corePluginspath = 'https://s3.ap-south-1.amazonaws.com/ekstep-public-dev/v3/preview/coreplugins';
    org.ekstep.contentrenderer.initPlugins('', '/base/public/coreplugins');    
};

setUpRenderer();