TelemetryService = {
    _version: "3.0",
    _baseDir: 'EkStep Content App',
    isActive: false,
    _config: undefined,
    instance: undefined,
    instanceV2: undefined,
    gameOutputFile: undefined,
    _gameErrorFile: undefined,
    _gameData: undefined,
    _correlationData: undefined,
    _producerData: undefined,
    _otherData: undefined,
    _data: [],
    _gameIds: [],
    _user: {},
    apis: {
        telemetry: "sendTelemetry",
        feedback: "sendFeedback"
    },
    mouseEventMapping: {
        click: 'TOUCH',
        dblclick: 'CHOOSE',
        mousedown: 'DROP',
        pressup: 'DRAG'
    },
    init: function(gameData, user, correlationData, otherData) {
        return new Promise(function(resolve, reject) {
            if (!TelemetryService.instance) {
                TelemetryService._user = user;
                TelemetryService.getTelemetryIntance(TelemetryService._version);
                TelemetryService.instanceV2 = new TelemetryV2Manager();
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
                if(correlationData && !_.isEmpty(correlationData)){
                    TelemetryService._correlationData = correlationData;
                };
                if(otherData && !_.isEmpty(otherData)){
                    TelemetryService._otherData = otherData;
                };
                resolve(true);
            } else {
                resolve(true)
                console.log("TelemetryService instance is not create")
            }
        });
    },
    webInit: function(gameData, user) {
        return new Promise(function(resolve, reject) {
            TelemetryService.init(gameData, user)
                .then(function() {
                    TelemetryService.start(gameData.id, gameData.ver);
                    resolve(true);
                })
                .catch(function(err) {
                    reject(err);
                });
        });
    },
    getTelemetryIntance: function(version) {
        TelemetryService._version = version;
        switch(version){
          case "1.0" : 
            TelemetryService.instance = new TelemetryV1Manager(); break;
          case "2.0" : 
          case "2.1" : 
          case "2.2" : 
            TelemetryService.instance = new TelemetryV2Manager(); break;
          default : 
            TelemetryService.instance = new TelemetryV3Manager();
        }
        return TelemetryService.instance;
        //TelemetryService.instance = (TelemetryService._version == "1.0") ? new TelemetryV1Manager() : new TelemetryV2Manager();
        console.info("Telemetry Version updated to:", version);
    },
    getDataByField: function(field) {

    },
    getGameData: function() {
        return TelemetryService.isActive ? TelemetryService._gameData : undefined;
    },
    getInstance: function() {
        return TelemetryService.isActive ? TelemetryService.instance : undefined;
    },
    getMouseEventMapping: function() {
        return TelemetryService.mouseEventMapping;
    },
    getGameId: function() {
        return TelemetryService.isActive ? TelemetryService._gameData.id : undefined;
    },
    getGameVer: function() {
        return TelemetryService.isActive ? TelemetryService._gameData.ver : undefined;
    },
    exitWithError: function(error) {
        var message = '';
        if (error) message += ' Error: ' + JSON.stringify(error);
        TelemetryService.instance.exitApp();
    },
    flushEvent: function(eventObj, apiName) {
      if(eventObj && eventObj.event.ver == "2.1")
        TelemetryService._data.push(eventObj);
        if (eventObj)
            eventObj.flush(apiName);
        return eventObj;
    },
    start: function(id, ver, data) {
        if (!TelemetryService.isActive) {
            console.log("TelemetryService is not active.");
            return new InActiveEvent();
        } else {
            ver = ver.toString();
            TelemetryService._gameData ={
                id: id,
                ver: ver
            };
            if (_.findWhere(TelemetryService.instance._start, {
                    id: id
                })){
                return new InActiveEvent();              
            }
            else{
              TelemetryService.instance.start(id, ver, data);
              return TelemetryService.instanceV2.start(id, ver, data);              
            }
        }
    },
    end: function(data) {
        if (!TelemetryService.isActive) {
            return new InActiveEvent();
        }
        TelemetryService.instance.end(data);
        return this.flushEvent(TelemetryService.instanceV2.end(data), TelemetryService.apis.telemetry);
    },
    interact: function(type, id, extype, data, eid, options) {
        if (!TelemetryService.isActive) {
            return new InActiveEvent();
        }
        TelemetryService.instance.interact(type, id, extype, data, eid, options);
        return TelemetryService.flushEvent(TelemetryService.instanceV2.interact(type, id, extype, data, eid), TelemetryService.apis.telemetry);
    },
    setUser: function(data, stageid, eid) {
        TelemetryService._user = data;
        data.stageId = stageid;
        TelemetryService.interact("TOUCH", "gc_userswitch", "TOUCH", data, eid);
    },
    assess: function(qid, subj, qlevel, data) {
        if (!TelemetryService.isActive) {
            return new InActiveEvent();
        }
        TelemetryService.instance.assess(qid, subj, qlevel, data);
        return TelemetryService.instanceV2.assess(qid, subj, qlevel, data);
    },
    error: function(errorObj) {
        if (!TelemetryService.isActive) {
            return new InActiveEvent();
        }
        TelemetryService.instance.error(errorObj);
        return TelemetryService.flushEvent(TelemetryService.instance.error(errorObj), TelemetryService.apis.telemetry);
    },
    assessEnd: function(event, data) {
        if (!TelemetryService.isActive) {
            return new InActiveEvent();
        }
        TelemetryService.instance.assessEnd(event, data);
        return TelemetryService.flushEvent(TelemetryService.instanceV2.assessEnd(event, data), TelemetryService.apis.telemetry);
    },
    levelSet: function(eventData) {
        if (TelemetryService.isActive) {
            var eventName = 'OE_LEVEL_SET';
            return new InActiveEvent();
        }
    },
    interrupt: function(type, id, eid) {
        if (!TelemetryService.isActive) {
            return new InActiveEvent();
        }
        TelemetryService.instance.interrupt(type, id, eid);
         return TelemetryService.flushEvent(TelemetryService.instanceV2.interrupt(type, id, eid), TelemetryService.apis.telemetry);
    },
    exitApp: function() {
        setTimeout(function() {
            navigator.app.exitApp();
        }, 5000);
    },
    navigate: function(stageid, stageto, data) {
        if (!TelemetryService.isActive) {
            return new InActiveEvent();
        }
        TelemetryService.instance.navigate(stageid, stageto, data);
         return TelemetryService._version == "1.0" ? "" : this.flushEvent(TelemetryService.instanceV2.navigate(stageid, stageto), TelemetryService.apis.telemetry);
    },
    sendFeedback: function(eks) {
        if (!TelemetryService.isActive) {
            return new InActiveEvent();
        }
        TelemetryService.instance.sendFeedback(eks);
    },
    xapi: function(eks) {
        if (!TelemetryService.isActive) {
            return new InActiveEvent();
        }
        TelemetryService.instance.xapi(eks);
    },
    itemResponse: function(data) {
        if (!TelemetryService.isActive) {
            return new InActiveEvent();
        }
        TelemetryService.instance.itemResponse(data);
        return TelemetryService.instanceV2.itemResponse(data);
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
    exit: function(stageId) {
        if (TelemetryService.isActive) {
            TelemetryService._data = [];
            var data = {};
            data.stageid = stageId;
            if (!_.isEmpty(TelemetryService.instance._end)) {
                var len = TelemetryService.instance._end.length;
                for (var i = 0; i < len; i++)
                    TelemetryService.end(data);
            }
            if (_.isEmpty(TelemetryService.instance._end)) {
                TelemetryService.isActive = false;
            }
        }
    },
    logError: function(eventName, error) {
        var data = {
                'eventName': eventName,
                'message': error,
                'time': getCurrentTime()
            }
            // change this to write to file??
        console.log('TelemetryService Error:', JSON.stringify(data));
        // create the event and Dispatch the Event
        var evt = document.createEvent('Event');
        evt.initEvent('logError', true, true);
        document.body.dispatchEvent(evt);
        console.info('Telemetry :' + JSON.stringify(data.message));
    },
    print: function() {
        if (TelemetryService._data.length > 0) {
            var events = TelemetryService._data.cleanUndefined();
            events = _.pluck(events, "event");
            console.log(JSON.stringify(events));
        } else {
            console.log("No events to print.");
        }
    },
    eventDispatcher: function() {
        console.warn('Framework should handle dispatching of event by overwiting this function with dispatching event function');
    }
}

Array.prototype.cleanUndefined = function() {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == undefined) {
            this.splice(i, 1);
            i--;
        }
    }
    return this;
};
