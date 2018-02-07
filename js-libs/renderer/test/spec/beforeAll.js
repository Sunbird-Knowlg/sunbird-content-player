var contentBody = JSON.parse('{"theme":{"stage":{"text":{"strokeWidth":1,"rotate":0,"z-index":0,"editable":false,"h":5.02,"fontsize":48,"weight":"","minWidth":20,"textType":"text","fill":"#000000","fontStyle":"normal","stroke":"rgba(255, 255, 255, 0)","w":35,"x":10.28,"y":20.49,"lineHeight":1.3,"id":"text","opacity":1,"fontWeight":"normal","maxWidth":500,"font":"NotoSans","__text":"You Speak"},"shape":{"config":{"__cdata":{"opacity":100,"strokeWidth":1,"stroke":"rgba(255, 255, 255, 0)","autoplay":false,"visible":true,"color":"#00FF00","points":[{"x":50,"y":0},{"x":100,"y":100},{"x":0,"y":100}]}},"strokeWidth":1,"rotate":0,"z-index":1,"h":25,"type":"triangle","fill":"#00FF00","stroke":"rgba(255, 255, 255, 0)","w":14,"x":11.81,"y":52.1,"id":"shape","opacity":1},"htext":[{"event":{"action":{"type":"command","command":"play","asset":"ht1"},"type":"click"},"id":"ht1","x":6.11,"y":87.16,"w":35,"h":5.02,"highlight":"rgba(255,0,0,0.5)","fontsize":"1.2em","timings":"250,400,650,1000,1300,1500,1900,2300,2500,3000,3500,4200","__text":"This is rani family."},{"event":{"action":{"type":"command","command":"play","asset":"ht2"},"type":"click"},"id":"ht2","x":12.11,"y":80.16,"w":35,"h":5.02,"highlight":"rgba(255,0,0,0.5)","fontsize":"1.2em","timings":"250,400,650,1000,1300,1500,1900,2300,2500,3000,3500,4200","audio":"do_2123843431567933441477","__text":"This is rani family."}],"image":{"event":{"action":{"tween":{"to":[{"ease":"linear","duration":500,"__cdata":{"x":20,"y":20}},{"ease":"quadOut","duration":2000,"__cdata":{"x":55,"y":0}},{"ease":"linear","duration":1,"__cdata":{"x":75,"y":0,"scaleX":-1}},{"ease":"linear","duration":2000,"__cdata":{"x":40,"y":55}},{"ease":"linear","duration":1,"__cdata":{"x":18,"y":55,"scaleX":1}},{"ease":"linear","duration":2000,"__cdata":{"x":57,"y":55}}],"id":"imageTween"},"type":"command","command":"animate"},"type":"click"},"rotate":0,"z-index":2,"w":12.45,"x":31.79,"h":42.7,"y":8.88,"id":"do_2122479583895552001118_tween","asset":"do_2122479583895552001118"},"audio":{"z-index":4,"id":"audio","asset":"do_2123843431567933441477"},"hotspot":{"strokeWidth":1,"rotate":0,"z-index":3,"h":25,"type":"roundrect","fill":"rgb(255,0,0)","stroke":"rgba(255, 255, 255, 0)","w":15,"x":59.44,"y":13.83,"id":"hotspot","opacity":0.3},"scribble":{"strokeWidth":2,"rotate":0,"z-index":4,"thickness":2,"h":32.74,"type":"roundrect","fill":"#3399FF","stroke":"rgba(255, 255, 255, 0)","w":14.71,"x":63.82,"y":54.66,"stroke-width":1,"id":"scribble","opacity":0.3},"manifest":{"media":[{"assetId":"do_2122479583895552001118"},{"assetId":"do_2123843431567933441477"}]},"x":0,"y":0,"w":100,"h":100,"id":"stage1","rotate":""},"manifest":{"media":[{"src":"assets/public/content/image1.jpg","id":"no_image","type":"image"},{"src":"assets/public/content/image.jpg","id":"do_2122479583895552001118","type":"image"},{"src":"assets/public/content/audio.mp3","name":"audio 1510911260101 407 1510911274 1510911274761","id":"do_2123843431567933441477","type":"audio"}]},"plugin-manifest":"","compatibilityVersion":2,"id":"theme","version":1,"startStage":"stage1"}}');
function setUpRenderer() {
    var canvas = "<div ng-app='genie-canvas' id='gameArea'><div id='overlay'></div><canvas id='gameCanvas' style='top: 10px;left: 10px;position: absolute;'></canvas></div>";
    var body = document.getElementsByTagName("body")[0];
    var div = document.createElement('div');
    div.innerHTML = canvas;
    body.appendChild(div.children[0]);
    setGlobalConfig({});
    window.isMobile = window.cordova ? true : false;
    window.content = JSON.parse('{"baseDir":"/base/public/test/testContent", "path":"/base/public/test/testContent", "identifier": "org.ekstep.item.sample", "mimeType": "application/vnd.ekstep.ecml-archive", "name": "Content Preview ", "author": "EkStep", "localData": {"name": "Content Preview ", "loadingMessage": "Without requirements or design, programming is the art of adding bugs to an empty text file. ...", "identifier": "org.ekstep.item.sample" }, "pkgVersion": 1, "isAvailable": true}');
    window.content.body = JSON.parse(JSON.stringify(contentBody));
    org.ekstep.service.init();
    AppConfig.corePluginspath = '/public/coreplugins';
    org.ekstep.contentrenderer.initPlugins('', '/public/coreplugins');
    GlobalContext.game.id = packageName;
    GlobalContext.game.ver = version;
    startTelemetry(GlobalContext.game.id, GlobalContext.game.ver);
};

function startRenderer(data) {
    window.content.body = JSON.parse(JSON.stringify(data));
    Renderer.start("", "gameCanvas", {}, data);
}

setUpRenderer();

