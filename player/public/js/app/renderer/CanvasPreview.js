CanvasPreview = {
    loader: undefined,
    theme: undefined,
    update: true,
    gdata: undefined,
    running: false,
    preview: false,
    resizeGame: function(disableDraw) {
        var gameArea = document.getElementById('gameArea');
        var widthToHeight = 16 / 9;     
        var newWidth = 720;
        var newHeight = 450;
        CanvasPreview.theme.updateCanvas(newWidth, newHeight);
        if(!disableDraw) CanvasPreview.theme.reRender();
    },
    start: function(gameRelPath, canvasId, gameId,data,preview) {
        Renderer=this; // This is required due to the global reference of Renderer in plugins 
        if(CanvasPreview.running) {
            CanvasPreview.cleanUp();
        }
        CanvasPreview.running = true;
        CanvasPreview.preview = preview;
        // TelemetryService.start(gameId, GlobalContext.game.ver);
        CanvasPreview.init(data, canvasId, gameRelPath);
      
    },
   
    init: function(data, canvasId, gameRelPath) {
        CanvasPreview.gdata = data;
        data.theme.canvasId = canvasId;
        CanvasPreview.theme = new ThemePlugin(data.theme);
        CanvasPreview.resizeGame(true);
        CanvasPreview.theme.baseDir = gameRelPath;
        if(CanvasPreview.preview){
            CanvasPreview.theme.start(gameRelPath);
        }else{
            CanvasPreview.theme.start(gameRelPath.replace('file:///', '') + "/assets/");
        }
        createjs.Ticker.addEventListener("tick", function() {
            if(CanvasPreview.update) {
                CanvasPreview.theme.update();
                CanvasPreview.update = false;                
            } else {
                if (CanvasPreview.theme) {
                    CanvasPreview.theme.tick();
                }
            }
        });
    },
    cleanUp: function() {
        Renderer.running = false;
        PluginManager.cleanUp();
        AnimationManager.cleanUp();
        AssetManager.destroy();
        TimerManager.destroy();
        Renderer.theme.cleanUp();
        Renderer.theme = undefined;
        TelemetryService.end();
    },
    pause: function() {
        if(CanvasPreview.theme)
            CanvasPreview.theme.pause();
    },
    resume: function() {
        if(CanvasPreview.theme)
            CanvasPreview.theme.resume();
    }
}
