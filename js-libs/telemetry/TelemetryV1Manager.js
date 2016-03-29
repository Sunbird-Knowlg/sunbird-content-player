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
        if(data.subtype == "PAUSE" || data.subtype == "STOP")
            type = data.subtype + "_LISTENING";
        if(data.subtype == "STOP_ALL")
            type = data.subtype + "_SOUNDS";
        var eks = {
            "type": type ? type : "",
            "id": id,
            "extype": type,
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
        if (eventObj) {

            if (!eventObj._isStarted) {
                eventObj._isStarted = true; // reset start status to true for re-assess events
            }

            eventObj.event.edata.eks.score = data.score || 0;
            eventObj.event.edata.eks.pass = data.pass ? 'Yes' : 'No';
            eventObj.event.edata.eks.res = data.res || [];
            eventObj.event.edata.eks.uri = data.uri || "";
            eventObj.event.edata.eks.qindex = data.qindex || 0;
            eventObj.end();
            return eventObj;
        }
    },
    interrupt: function(type, id) {
        var eventStr = TelemetryService._config.events["OE_INTERRUPT"];
        var eks = {
            "type": type,
            "id": id || ''
        };
        var ext = {};
        if (!_.contains(eventStr.eks.type.values, type)) {
            ext["type"] = type;
            type = "OTHER";
        }
        return this.createEvent("OE_INTERRUPT", eks).ext(ext);
    },
    exitApp: function() {
        setTimeout(function() {
            navigator.app.exitApp();
        }, 5000);
    }
});
