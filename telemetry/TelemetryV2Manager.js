TelemetryV2Manager = Class.extend({
    _end: undefined,
     init: function() {
        console.info("TelemetryService Version 2 initialized..");
    },
    exitWithError: function(error) {
        var message = '';
        if (error) message += ' Error: ' + JSON.stringify(error);
        TelemetryServiceV2.exitApp();
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
    interact: function(type, id, extype, eks) {
        if (eks.optionTag) {
            console.log("inside interact option tag....");
            var itemResponseEvent = this.itemResponse(eks);
            itemResponseEvent.flush();
        }
        if (type != "DRAG") {
            var eks = {
                "stageid": eks.stageId ? eks.stageId : "",
                "type": type,
                "subtype": eks.subtype ? eks.subtype : "",
                "pos": eks.pos ? eks.pos : [],
                "id": id,
                "tid": eks.tid ? eks.tid : "",
                "uri": eks.uri ? eks.uri : ""
            };
            return this.createEvent("OE_INTERACT", eks);
        } else {
            return new InActiveEvent();
        }
    },
    assess: function(qid, subj, qlevel, data) {
        if (qid && subj && qlevel) {
            var eks = {
                qid: qid,
                params: []
            };
            return this.createEvent("OE_ASSESS", eks);
        } else {
            console.error("qid, subject, qlevel is required to create assess event.", qid, subj, qlevel);
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
    interrupt: function(type, id) {
            var eventStr = TelemetryService.manager._config.events[name];
            var eks = {
                "type": type,
                "stageid": id || ''
            };
            if (!_.contains(eventStr.eks.type.values, type)) {
                edata.eks["type"] = type;
                type = "OTHER";
            }
            return this.createEvent("OE_INTERRUPT", eks);
    },
    logError: function(eventName, error) {
        var data = {
                'eventName': eventName,
                'message': error,
                'time': toGenieDateTime(new Date().getTime())
            }
            // change this to write to file??
        console.log('TelemetryServiceV2 Error:', JSON.stringify(data));
        var $body = angular.element(document.body); // 1
        var $rootScope = $body.scope().$root; // 2
        $rootScope.$broadcast('show-message', {
            "message": 'Telemetry :' + JSON.stringify(data.message.errors)
        });
    },
    exitApp: function() {
        setTimeout(function() {
            navigator.app.exitApp();
        }, 5000);
    },
    navigate: function(stageid, stageto) {
        if (stageto != undefined && stageid != undefined && stageto != stageid) {
            var eks = {
                stageid: stageid ? stageid : "",
                stageto: stageto ? stageto : ""
            };
            return this.createEvent("OE_NAVIGATE", eks);
        }
    },
    itemResponse: function(data) {
        var type = data.optionTag == "MCQ" ? "CHOOSE" : "MATCH";
        var eks = {
                "qid": data.itemId ? data.itemId : "",
                "type": type ? type : "",
                "state": data.state ? data.state : "",
                "res": data.res ? data.res : []
            };
        return this.createEvent("OE_ITEM_RESPONSE", eks);
    },
    levelSet: function(eventData) {
        var eventName = 'OE_LEVEL_SET';
        return new InActiveEvent();
    }
})