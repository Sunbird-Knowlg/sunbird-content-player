TelemetryV1Manager = Class.extend({
    _end: undefined,
    init: function() {
        console.info("TelemetryService Version 1 initialized.. ");
    },
    exitWithError: function(error) {
        var message = '';
        if (error) message += ' Error: ' + JSON.stringify(error);
        this.exitApp();
    },
    createEvent: function(eventName, body) {
        return new TelemetryEvent(eventName, TelemetryService._version, body, TelemetryService._user, TelemetryService._gameData);
    },
    start: function(id, ver) {
        TelemetryService._gameData = {id: id , ver : ver};
        this._end = this.createEvent("OE_END", {}).start();
        return this.createEvent("OE_START", {});
    },
    end: function(gameId) {
        // console.log("genieservice_web.tList : " +  genieservice_web.tList);
        return this._end.end();
    },
    interact: function(type, id, extype, data) {
        var ext = {
            stageid: data.stageId,
            x: data.x,
            y: data.y,
            choice_id: data.choice_id,
            drag_id: data.drag_id,
            itemId: data.itemId
        };
        var eventStr = TelemetryService._config.events["OE_INTERACT"];
        if (!_.contains(eventStr.eks.type.values, type)) {
            ext.type = type;
            type = "OTHER";
        }
        var eks = {
            "type": type ? type : "",
            "id": id,
            "extype": extype,
            "uri": ""
        };
        return this.createEvent("OE_INTERACT", eks).ext(ext);
    },
    assess: function(qid, subj, qlevel, data) {
        if (qid && subj && qlevel) {
            var eks = {
                qid: qid,
                subj: subj,
                qlevel: qlevel,
                mmc: [],
                mc: data.mc,
                maxscore: data.maxscore,
                params: []
            };
            return this.createEvent("OE_ASSESS", eks).start();
        } else {
            console.error("qid, subject, qlevel is required to create assess event.");
            return new InActiveEvent();
        }
    },
    assessEnd: function(eventObj, data) {
        if (eventObj && eventObj._isStarted) {
            eventObj.event.edata.eks.score = data.score || 0;
            eventObj.event.edata.eks.pass = data.pass ? 'Yes' : 'No';
            eventObj.event.edata.eks.res = data.res || [];
            eventObj.event.edata.eks.uri = data.uri || "";
            eventObj.end();
            eventObj.flush();
            return eventObj;
        }
    },
    levelSet: function(eventData) {
        if (TelemetryService.isActive) {
            var eventName = 'OE_LEVEL_SET';
            return new InActiveEvent();        }
    },
    interrupt: function(type, id) {
        var eventStr = TelemetryService._config.events["OE_INTERRUPT"];
        if (!_.contains(eventStr.eks.type.values, type)) {
            edata.ext["type"] = type;
            type = "OTHER";
        }
        edata.eks = {
            "type": type,
            "id": id || ''
        };
        return this.createEvent("OE_INTERRUPT", eks);
    },
    logError: function(eventName, error) {
        var data = {
                'eventName': eventName,
                'message': error,
                'time': Date.now()
            }
            // change this to write to file??
        console.log('TelemetryServiceV1 Error:', JSON.stringify(data));
    },
    exitApp: function() {
        setTimeout(function() {
            navigator.app.exitApp();
        }, 5000);
    }
});