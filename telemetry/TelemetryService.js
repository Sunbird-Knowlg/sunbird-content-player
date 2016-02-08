TelemetryService = {
    _version: "2.0",
    _baseDir: 'EkStep Content App',
    isActive: false,
    _config: undefined,
    instance: undefined,
    gameOutputFile: undefined,
    _gameErrorFile: undefined,
    _gameData: undefined,
    _data: [],
    _user: {},
    mouseEventMapping: {
        click: 'TOUCH',
        dblclick: 'CHOOSE',
        mousedown: 'DROP',
        pressup: 'DRAG'
    },
    init: function(gameData, user) {
        if (!TelemetryService.instance) {
            return new Promise(function(resolve, reject) {
                TelemetryService._user = user;
                TelemetryService.instance = (TelemetryService._version == "1.0") ? new TelemetryV1Manager() : new TelemetryV2Manager();
                if (gameData) {
                    if (gameData.id && gameData.ver) {
                        TelemetryService._parentGameData = gameData;
                        TelemetryService._gameData = gameData;
                    } else {
                        reject('Invalid game data.');
                    }
                    TelemetryServiceUtil.getConfig().then(function(config) {
                        TelemetryService._config = config;
                        if (TelemetryService._config.isActive) TelemetryService.isActive = TelemetryService._config.isActive;
                        resolve(true);
                    }).catch(function(err) {

                        reject(err);
                    });

                } else {
                    reject('Game data is empty.');
                };
                resolve(true);
            });
        }
    },
    changeVersion: function(version) {
        TelemetryService._version = version;
        TelemetryService.instance = (TelemetryService._version == "1.0") ? new TelemetryV1Manager() : new TelemetryV2Manager();
        console.info("Telemetry Version updated to:", version);
    },
    getDataByField: function(field) {

    },
    getGameData: function() {
        return TelemetryService._gameData
    },
    getInstance: function() {
        return TelemetryService.instance;
    },
    getMouseEventMapping: function() {
        return TelemetryService.mouseEventMapping;
    },
    getGameId: function() {
        return TelemetryService._gameData.id;
    },
    getGameVer: function() {
        return TelemetryService._gameData.ver;
    },
    exitWithError: function(error) {
        var message = '';
        if (error) message += ' Error: ' + JSON.stringify(error);
        TelemetryService.instance.exitApp();
    },
    flushEvent: function(event) {
        TelemetryService._data.push(event);
        if (event)
            event.flush();
        return event;
    },
    start: function(id, ver) {
        if (!TelemetryService.isActive) {
            return new InActiveEvent();
        }
        return TelemetryService.flushEvent(TelemetryService.instance.start(id, ver));
    },
    end: function() {
        if (!TelemetryService.isActive) {
            return new InActiveEvent();
        }
        return this.flushEvent(TelemetryService.instance.end());
    },
    interact: function(type, id, extype, data) {
        if (!TelemetryService.isActive) {
            return new InActiveEvent();
        }
        return TelemetryService.flushEvent(TelemetryService.instance.interact(type, id, extype, data));
    },
    assess: function(qid, subj, qlevel, data) {
        if (!TelemetryService.isActive) {
            return new InActiveEvent();
        }
        return TelemetryService.instance.assess(qid, subj, qlevel, data);
    },
    assessEnd: function(event, data) {
        if (!TelemetryService.isActive) {
            return new InActiveEvent();
        }
        return TelemetryService.instance.assessEnd(event, data);
    },
    levelSet: function(eventData) {
        if (TelemetryService.isActive) {
            var eventName = 'OE_LEVEL_SET';
            return new InActiveEvent();
        }
    },
    interrupt: function(type, id) {
        if (!TelemetryService.isActive) {
            return new InActiveEvent();
        }
        return TelemetryService.flushEvent(TelemetryService.instance.interrupt(type, id));
    },
    logError: function(eventName, error) {
        var data = {
                'eventName': eventName,
                'message': error,
                'time': getCurrentTime()
            }
            // change this to write to file??
        console.log('TelemetryService Error:', JSON.stringify(data));
    },
    exitApp: function() {
        setTimeout(function() {
            navigator.app.exitApp();
        }, 5000);
    },
    navigate: function(stageid, stageto) {
        if (!TelemetryService.isActive) {
            return new InActiveEvent();
        }
        return TelemetryService._version == "1.0" ? "" : this.flushEvent(TelemetryService.instance.navigate(stageid, stageto));
    },
    itemResponse: function(data) {
        if (!TelemetryService.isActive) {
            return new InActiveEvent();
        }
        return TelemetryService.instance.itemResponse(data);
    },
    resume: function(newUserId, NewContentId, gameData, user) {
        var previousContentId = TelemetryService._gameData;
        var previousUserId = TelemetryService._user.uid;
        if (previousContentId != NewContentId || newUserId != previousUserId) {
            TelemetryService.end();
            TelemetryService.init(TelemetryService._gameData, TelemetryService._user);
            TelemetryService.start()
        }
    },
    exit: function(packageName, ver) {
        TelemetryService._data = [];
        if (TelemetryService.instance._gameData)
            TelemetryService.end(packageName, ver);
    },
    
}
