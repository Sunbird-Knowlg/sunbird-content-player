TelemetryV3Manager = Class.extend({
    _end: new Array(),
    _start: new Array(),
     init: function() {
        console.info("TelemetryService Version 3 initialized..");
        TelemetryV3Manager.instance = EkTelemetry;
    },
    exitWithError: function(error) {
        var message = '';
        if (error) message += ' Error: ' + JSON.stringify(error);
        TelemetryServiceV3.exitApp();
    },
    start: function(id, ver, data) {
        var deviceId = detectClient();
        var config = {
            pdata: {
                id: EkstepRendererAPI.getGlobalConfig().pdata.id || "in.ekstep",
                ver: EkstepRendererAPI.getGlobalConfig().pdata.ver || "1.0",
                pid: data.pid || "",
                ver: data.ver || ""
            },
            channel: EkstepRendererAPI.getGlobalConfig().channel,
            env: EkstepRendererAPI.getGlobalConfig().mode,
            uid: GlobalContext.user.uid || "anonymous",
            sid: EkstepRendererAPI.getGlobalConfig().sid || "",
            did: GlobalContext.config.did || CryptoJS.MD5(JSON.stringify(deviceId)).toString(),
            authtoken: "",
            dispatcher: ("undefined" == typeof cordova) ? org.ekstep.contentrenderer.webDispatcher : org.ekstep.contentrenderer.deviceDispatcher
        };
        var startData = {
            type: GlobalContext.config.type,
            dspec: data.dspec || "",
            uaspec: data.uaspec || "",
            loc: data.loc || "",
            mode:  data.mode || EkstepRendererAPI.getGlobalConfig().mode,
            pageid: data.pageid || EkstepRendererAPI.getCurrentStageId(),

        }
        TelemetryV3Manager.instance.start(config, GlobalContext.config.context.contentId, ver, startData);
    },
    end: function(data) {
        if (this.telemetryStartActive()) {
            this._start.pop();
            data.type = GlobalContext.config.type;
            data.mode = data.mode;
            data.summary = data.summary || [];
            data.pageid = EkstepRendererAPI.getCurrentStageId();
            TelemetryV3Manager.instance.end(data);
        } else {
            console.warn("Telemetry service end is already logged Please log start telemetry again");
        }
    },
    interact: function(type, id, extype, eks, eid) {
        /* if (eks.optionTag)
            TelemetryService.flushEvent(this.itemResponse(eks), TelemetryService.apis.telemetry);
        if (type != "DRAG") {
            var eks = {
                "stageid": eks.stageId ? eks.stageId.toString() : "",
                "type": type,
                "subtype": eks.subtype ? eks.subtype : "",
                "pos": eks.pos ? eks.pos : [],
                "id": id,
                "tid": eks.tid ? eks.tid : "",
                "uri": eks.uri ? eks.uri : "",
                "extype": "",
                "values": eks.values ? eks.values : []
            };
            var eventName = eid ? eid : "OE_INTERACT"
            return this.createEvent(eventName, eks);
        } */
        var data = {
            type: type,
            subtype: "",
            id: id,
            pageid: EkstepRendererAPI.getCurrentStageId(),
            target: "",
            plugin: "",
            extra: {}
        }
        TelemetryV3Manager.instance.interact(data);
    },
    assess: function(qid, subj, qlevel, data) {
        var maxscore;
        subj = subj ? subj : "";
        if (data) {
            maxscore = data.maxscore || 1;
        }
        qlevel = qlevel ? qlevel : "MEDIUM";
        if (qid) {
            var questionItem = {
                id: qid,
                maxscore: data.maxscore || 1,
                exlength: "",
                params: data.params || [],
                uri: data.uri || "",
                desc: data.desc || "",
                title: data.title || "",
                mmc: data.mmc || "",
                mc: data.mc || ""
            }
            var questionData = {
                item: questionItem,
                index: "",
                pass: data.pass || "No",
                score: data.score || (data.pass ? 1 : 0),
                resvalues: data.resvalues || [],
                duration: data.duration || ""
            }
            var eks = {
                qid: qid,
                maxscore: maxscore ,
                params: []
            };
            TelemetryV3Manager.instance.assess(questionData);
        } else {
            console.error("qid is required to create assess event.", qid);
            // TelemetryService.logError("OE_ASSESS", "qid is required to create assess event.")
            return new InActiveEvent();
        }

    },
    error: function(data) {
        /* if (!TelemetryV3Manager.hasRequiredData(data, ["err", "errtype"])) {
            console.error('Invalid error data');
            return;
        } */
        var object = {
            id: data.objectId,
            type: data.objectType || "",
            ver: data.objectVersion || "",
            rollup: data.rollup || {}
        }
        var plugin = {
            id: data.id || "",
            ver: data.ver || "",
            category: data.category || ""
        }
        var errorData = {
            err: data.err,
            errtype: data.type || data.errtype,
            stacktrace: data.stacktrace || "",
            pageid: data.stageId || EkstepRendererAPI.getCurrentStageId(),
            object: data.object || object,
            plugin:plugin
        }
        TelemetryV3Manager.instance.error(errorData);
    },
    interrupt: function(type, id, eid) {
        /* if (!this.instance.hasRequiredData(data, ["type"])) {
            console.error('Invalid interrupt data');
            return;
        } */
        var interruptData = {
            "type": type,
            "pageid": id || stageid  || '',
        };  
        TelemetryV3Manager.instance.interrupt(interruptData);
    },
    exitApp: function() {
        setTimeout(function() {
            navigator.app.exitApp();
        }, 5000);
    },
    navigate: function(stageid, stageto, type, subtype, uri, visit) {
        if (stageto != undefined && stageid != undefined && stageto != stageid) {
            TelemetryV3Manager.instance.impression(stageto || "", type || "workflow", subtype || "Paginate", uri || "", visit || []);
        } else {
            console.error('Invalid impression data');
            return;
        }
    },
    itemResponse: function(data) {
        var type = data.optionTag == "MCQ" ? "CHOOSE" : "MATCH";
        var target = {
            id: data.itemId || "",
            ver: data.ver || "",
            type: data.type || "",
            state: data.state || "",
            parent: data.parent || {}
        }
        var responseData = {
            target: target,
            type: data.type,
            values: _.isEmpty(data.res) ? [] : data.res
        }
        TelemetryV3Manager.instance.response(data);
    },
    sendFeedback: function(data) {
        TelemetryV3Manager.instance.feedback(data);
    },
    telemetryStartActive: function() {
        return (!_.isEmpty(this._start));
    },
    xapi: function(data) {
        var data = {
            type: type,
            data: data
        }
        TelemetryV3Manager.instance.exdata(data);
    },
    hasRequiredData: function(data, mandatoryFields) {
        var isValid = true;
        mandatoryFields.forEach(function(key) {
            if (!data.hasOwnProperty(key)) isValid = false;
        });
        return isValid;
    }
})
