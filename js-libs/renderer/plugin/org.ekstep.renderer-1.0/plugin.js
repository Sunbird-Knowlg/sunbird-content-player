Plugin.extend({
    initialize: function() {
        console.info('ECML Renderer initialize')
        EkstepRendererAPI.addEventListener('renderer:ecml:launch', this.start, this);
    },
    start: function(evt, renderObj) {
        if (_.isUndefined(renderObj)) return;
        try {
            if (Renderer.running) {
                Renderer.cleanUp();
                TelemetryService.start(game.identifier, game.pkgVersion);
            }
            Renderer.running = true;
            Renderer.preview = renderObj.preview || false;
            if (renderObj.body) {
                Renderer.init(renderObj.body, 'gameCanvas', renderObj.gameRelPath);
            } else {
                Renderer.initByJSON(renderObj.baseDir, 'gameCanvas');
                if (typeof sensibol != "undefined") {
                    sensibol.recorder.init(renderObj.baseDir + "/lesson.metadata")
                        .then(function(res) {
                            console.info("Init lesson successful.", res);
                        })
                        .catch(function(err) {
                            console.error("Error while init lesson:", err);
                        });
                }
            }
        } catch (e) {
            showToaster('error', 'Lesson fails to play');
            EkstepRendererAPI.logErrorEvent(e, {
                'severity': 'fatal',
                'type': 'content',
                'action': 'play'
            });
            console.warn("Canvas Renderer init is failed", e);
        }
    },
});

//# sourceURL=ECMLRenderer.js