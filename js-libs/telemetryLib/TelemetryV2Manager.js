TelemetryV2Manager = Class.extend({
    _end: new Array(),
    _start: new Array(),
     init: function() {
        console.info("TelemetryService Version 2 initialized..");
    },
    exitWithError: function(error) {
        var message = '';
        if (error) message += ' Error: ' + JSON.stringify(error);
        TelemetryServiceV2.exitApp();
    },
    createEvent: function(eventName, body) {
        return new TelemetryEvent(eventName, Telemetry._version, body, Telemetry.user, Telemetry._gameData, Telemetry._correlationData, Telemetry._otherData);
    },
    start: function(contentId, contentVer, data) {
        this._end.push(this.createEvent("OE_END", {}).start());
        this._start.push({contentId: contentId , contentVer : contentVer});
        return this.createEvent("OE_START", data);
    },
    end: function(data) {
        if (this.telemetryStartActive()) {
            this._start.pop();
            if(data.progress == undefined) {
                // Bu default we are sending as 50. If any external guys called telemetryService.end() directly
                data.progress = 50;
            }
            Telemetry.isActive = false;
            Telemetry.instance = undefined;
            return this._end.pop().end(data);
        } else {
            console.warn("Telemetry service end is already logged Please log start telemetry again");
        }
    },

    // interact: function(type, id, extype, eks, eid)
    interact: function(data) {
        if (undefined != data.type && undefined != data.id) {
            if (data.extra.optionTag)
                this.itemResponse(data.extra);
            if (data.type != "DRAG") {
                var eks = {
                    "stageid": data.extra.stageId ? data.extra.stageId.toString() : "",
                    "type": data.type,
                    "subtype": data.extra.subtype ? data.extra.subtype : "",
                    "pos": data.extra.pos ? data.extra.pos : [],
                    "id": data.id,
                    "tid": data.extra.tid ? data.extra.tid : "",
                    "uri": data.extra.uri ? data.extra.uri : "",
                    "extype": "",
                    "values": data.extra.values ? data.extra.values : []
                };
                var eventName = "OE_INTERACT"
                return this.createEvent(eventName, eks);
            }
        } else {
            console.info("Required fields missing for Telemetry interact ")
        }
    },

    assess: function(qid, subj, qlevel, data) {
        if (undefined != qid && undefined != subj && undefined != qlevel) {
            var maxscore;
            subj = subj ? subj : "";
            if (data) {
                maxscore = data.maxscore || 1;
            }
            qlevel = qlevel ? qlevel : "MEDIUM";
            if (qid) {
                var eks = {
                    qid: qid,
                    maxscore: maxscore ,
                    params: []
                };
                return this.createEvent("OE_ASSESS", eks).start();
            } else {
                console.error("qid is required to create assess event.", qid);
                return new InActiveEvent();
            }
        } else {
            console.info("Required fields missing for Telemetry assess ")
        }
    },
    error: function(data) {
        if (undefined != data.err && undefined != data.errtype && undefined != data.stacktrace) {
            var data = {env: data.env || '', type: data.errtype, stacktrace: data.stacktrace, stageid: data.stageId || '', objecttype: data.objectType || '', objectid: data.objectId || '', err: data.err, action: data.action || '', data: data.data || '', severity: data.severity || ''}
            return this.createEvent("OE_ERROR", data);
        } else {
            console.info("Required fields missing for Telemetry error ")
        }
    },
    assessEnd: function(eventObj, data) {
        if (undefined != eventObj && undefined != data) {
            if (!eventObj._isStarted) {
                eventObj._isStarted = true; // reset start status to true for re-assess events
            }
            eventObj.event.edata.eks.score = data.score || 0;
            eventObj.event.edata.eks.pass = data.pass ? 'Yes' : 'No';
            eventObj.event.edata.eks.resvalues = isEmpty(data.res)? [] : data.res;
            eventObj.event.edata.eks.uri = data.uri || "";
            eventObj.event.edata.eks.qindex = data.qindex || 0;
            eventObj.event.edata.eks.exlength = 0;
            eventObj.event.edata.eks.qtitle = data.qtitle;
            eventObj.event.edata.eks.qdesc = data.qdesc.substr(0,140);
            eventObj.event.edata.eks.mmc = data.mmc;
            eventObj.event.edata.eks.mc = data.mc;
            if (Array.isArray(eventObj.event.edata.eks.resvalues)) {
                eventObj.event.edata.eks.resvalues = eventObj.event.edata.eks.resvalues.map(function(val) {
                    val = ("object" == typeof val) ? val :{"0" : val};
                    return val;
                });
            } else {
                eventObj.event.edata.eks.resvalues = [];
            }

            eventObj.end();
            return eventObj;
        } else {
            console.info("Required fields missing for Telemetry assessEnd ")
        }
    },
    interrupt: function(data) {
        if (data.type) {
            var eventStr = Telemetry.config.events["OE_INTERRUPT"];
            var eks = {
                "type": data.type,
                "stageid": data.pageid || ''
            };
            var eventName = data.eventid ? data.eventid : "OE_INTERRUPT";
            return this.createEvent(eventName, eks);
        } else {
            console.info("Required fields missing for Telemetry interrupt ")
        }
    },
    exitApp: function() {
        setTimeout(function() {
            navigator.app.exitApp();
        }, 5000);
    },
    navigate: function(pageid, type, subtype, data) {
        if (pageid != undefined && type != undefined) {
            var eks = {
                stageid: pageid ? pageid : "",
                stageto: (data && data.stageto) ? data.stageto : "",
                type: type ? type : "",
                subtype: subtype ? subtype : "",
                itype: ""
            };
            return this.createEvent("OE_NAVIGATE", eks);
        } else {
            console.info("Required fields missing for Telemetry navigate ")
        }
    },
    itemResponse: function(data) {
        if (data.qid != undefined && data.type != undefined && data.target != undefined && data.values != undefined) {
            var type = data.optionTag == "MCQ" ? "CHOOSE" : "MATCH";
            var eks = {
                target: data.target,
                "qid": data.qid,
                "type": data.type,
                "state": data.state,
                "resvalues": isEmpty(data.values) ? [] : data.values
            };
            return Telemetry.flushEvent(this.createEvent("OE_ITEM_RESPONSE", eks));
        } else {
            console.info("Required fields missing for Telemetry itemResponse ")
        }
    },
    sendFeedback: function(eks) {
        return this.createEvent("", eks);
    },
    telemetryStartActive: function() {
        return (!isEmpty(this._start));
    },
    xapi: function(type, data) {
        var eks = {xapi: data};
        return this.createEvent("OE_XAPI", eks);
    }
})


function isEmpty(obj) {

    // null and undefined are "empty"
    if (obj == null) return true;

    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length > 0)    return false;
    if (obj.length === 0)  return true;

    // If it isn't an object at this point
    // it is empty, but it can't be anything *but* empty
    // Is it empty?  Depends on your application.
    if (typeof obj !== "object") return true;

    // Otherwise, does it have any properties of its own?
    // Note that this doesn't handle
    // toString and valueOf enumeration bugs in IE < 9
    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
    }

    return true;
}

/*
* This method returns the first matching object from the given list
* list: [array] takes an array of object
* obj: [object] receives one key with one value to be compared
*/
function findWhere(list, obj) {
    return list.find(function(e) {
        return e[Object.keys(obj)[0]] == Object.values(obj)[0];
    });
}
