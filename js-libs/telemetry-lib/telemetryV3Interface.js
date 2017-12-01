/**
 * this is the Telemetry V3 Interface
 * @author Akash Gupta <Akash.Gupta@tarento.com>
 */

var EkTelemetry = (function() {
    this.telemetry = function() {};
    var instance = function() {};
    var telemetryInstance = this;
    this.telemetry.initialized = false;
    this.telemetry.config = undefined;
    this.telemetry._version = "3.0";

    this.startTime = 0;
    this._defaultValue = {
        pdata: {
            id: "in.ekstep",
            ver: "1.0",
            pid: ""
        },
        channel: "in.ekstep",
        uid: "anonymous",
        did: "",
        authtoken: "",
        sid: "",
        batchsize: 20,
        host: "https://api.ekstep.in",
        endpoint: "/data/v3/telemetry",
        tags: [],
        cdata: [],
        apislug: "/action"
    },
    this.deviceSpecRequiredFields = ["os","make","id","mem","idisk","edisk","scrn","camera","cpu","sims","cap"],
    this.userAgentRequiredFields = ["agent","ver","system","platform","raw"],
    this.objectRequiredFields = ["id","type","ver"],
    this.targetRequiredFields = ["id","type","ver"],
    this.pluginRequiredFields = ["id","ver"],
    this.visitRequiredFields = ["objid","objtype"],
    this.questionRequiredFields = ["id","maxscore","exlength","desc","title"],
    this.pdataRequiredFields = ["id"],
    this.targetObjectRequiredFields = ["type","id"],

    this.telemetry.start = function(config, contentId, contentVer, data) {
        if (EkTelemetry.initialized) {
            console.log("Telemetry is already initialized..");
            return;
        }
        if (!instance.hasRequiredData(data, ["type"])) {
            console.error('Invalid start data');
            return;
        }
        if (data.dspec && !instance.checkRequiredField(data.dspec, telemetryInstance.deviceSpecRequiredFields)) {
            console.error('Invalid device spec')
            return;
        }
        if (data.uaspec && !instance.checkRequiredField(data.uaspec, telemetryInstance.userAgentRequiredFields)) {
            console.error('Invalid user agent spec')
            return;
        }
        var eksData = {
            "type": data.type,
            "dspec": data.dspec || "",
            "uaspec": data.uaspec || "",
            "loc": data.loc || "",
            "mode": data.mode || "",
            "duration": data.duration,
            "pageid": (data && data.stageto) ? data.stageto : ""
        }
        if (instance.init(config, contentId, contentVer, data.type)) {
            var startEventObj = instance.getEvent('START', eksData);
            instance.addEvent(startEventObj)

            // Required to calculate the time spent of content while generating OE_END
            EkTelemetry.startTime = startEventObj.ets;
            return startEventObj;
        }
    }

    this.telemetry.end = function(data) {
        if (!EkTelemetry.initialized) {
            console.log("Telemetry is not initialized, Please start telemetry first");
            return;
        }
        if (!instance.hasRequiredData(data, ["type", "pageid"])) {
            console.error('Invalid end data');
            return;
        }
        var eksData = {
            "type": data.type,
            "mode": data.mode || '',
            "duration" : ((new Date()).getTime() - EkTelemetry.startTime),
            "pageid": (data && data.stageto) ? data.stageto : "",
            "summary": data.summary || ''
        } 
        instance.addEvent(instance.getEvent('END', eksData));
        EkTelemetry.initialized = false;
    }

    this.telemetry.impression = function(pageid, type, subtype, uri, visit) {
        if (!EkTelemetry.initialized) {
            console.log("Telemetry is not initialized, Please start telemetry first");
            return;
        }
        if (undefined == pageid || undefined == type || undefined == uri) {
            console.error('Invalid impression data');
            return;
        }
        if (data.visits && !instance.checkRequiredField(data.visits, telemetryInstance.visitRequiredFields)) {
            console.error('Invalid visits spec')
            return;
        }
        var eksData = {
            "type": type,
            "subtype": subtype || '',
            "pageid": pageid,
            "uri": uri,
            "visits": data.visit || ''
        }
        instance.addEvent(instance.getEvent('IMPRESSION', eksData));
    }

    this.telemetry.interact = function(data) {
        if (!EkTelemetry.initialized) {
            console.log("Telemetry is not initialized, Please start telemetry first");
            return;
        }
        if (!instance.hasRequiredData(data, ["type", "id"])) {
            console.error('Invalid interact data');
            return;
        }
        if (data.target && !instance.checkRequiredField(data.target, telemetryInstance.targetRequiredFields)) {
            console.error('Invalid target spec')
            return;
        }
        if (data.plugin && !instance.checkRequiredField(data.plugin, telemetryInstance.pluginRequiredFields)) {
            console.error('Invalid plugin spec')
            return;
        }
        var eksData = {
            "type": data.type,
            "subtype": data.subtype || '',
            "id": data.id,
            "pageid": data.stageId ? data.stageId.toString() : "",
            "target": data.target || '',
            "plugin": data.plugin || '',
            "extra": {
              "pos": (data.extra && data.extra.pos) ? data.extra.pos : [],
              "values": (data.extra && data.extra.values) ? data.extra.values : []
            }
        }
        instance.addEvent(instance.getEvent('INTERACT', eksData));
    }

    this.telemetry.assess = function(data) {
        if (!EkTelemetry.initialized) {
            console.log("Telemetry is not initialized, Please start telemetry first");
            return;
        }
        if (!instance.hasRequiredData(data, ["item", "pass", "score", "resvalues", "duration"])) {
            console.error('Invalid assess data');
            return;
        }
        if (!instance.checkRequiredField(data.item, telemetryInstance.questionRequiredFields)) {
            console.error('Invalid question spec')
            return;
        }
        var eksData = {
            "item": data.item,
            "index": data.index || '',
            "pass": data.pass || 'No',
            "score": data.score || 0,
            "resvalues": data.resvalues,
            "duration": data.duration
        }
        instance.addEvent(instance.getEvent('ASSESS', eksData));
    }

    this.telemetry.response = function(data) {
        if (!EkTelemetry.initialized) {
            console.log("Telemetry is not initialized, Please start telemetry first");
            return;
        }
        if (!instance.hasRequiredData(data, ["target", "values", "type"])) {
            console.error('Invalid response data');
            return;
        }
        if (!instance.checkRequiredField(data.target, telemetryInstance.targetRequiredFields)) {
            console.error('Invalid target spec')
            return;
        }
        var eksData = {
            "target": data.target,
            "type": data.values,
            "values": data.type
        }
        instance.addEvent(instance.getEvent('RESPONSE', eksData));
    }

    this.telemetry.interrupt = function(data) {
        if (!EkTelemetry.initialized) {
            console.log("Telemetry is not initialized, Please start telemetry first");
            return;
        }
        if (!instance.hasRequiredData(data, ["type"])) {
            console.error('Invalid interrupt data');
            return;
        }
        var eksData = {
            "type": data.type,
            "pageid": data.stageid || ''
        }
        instance.addEvent(instance.getEvent('INTERRUPT', eksData));
    }

    this.telemetry.feedback = function(data) {
        if (!EkTelemetry.initialized) {
            console.log("Telemetry is not initialized, Please start telemetry first");
            return;
        }
        var eksData = {
            "rating": data.rating || '',
            "comments": data.comments || ''
        }
        instance.addEvent(instance.getEvent('FEEDBACK', eksData));
    }

    //Share
    this.telemetry.share = function(data) {
        if (!EkTelemetry.initialized) {
            console.log("Telemetry is not initialized, Please start telemetry first");
            return;
        }
        if (!instance.hasRequiredData(data, ["items"])) {
            console.error('Invalid share data');
            return;
        }
        var eksData = {
            "dir": data.dir || '',
            "type": data.type || '',
            "items": data.items
        }
        instance.addEvent(instance.getEvent('INTERRUPT', eksData));
    }

    this.telemetry.audit = function(data) {
        if (!EkTelemetry.initialized) {
            console.log("Telemetry is not initialized, Please start telemetry first");
            return;
        }
        if (!instance.hasRequiredData(data, ["props"])) {
            console.error('Invalid audit data');
            return;
        }
        var eksData = {
            "props": data.props,
            "state": data.state || '',
            "prevstate": data.prevstate || ''
        }
        instance.addEvent(instance.getEvent('AUDIT', eksData));
    }

    this.telemetry.error = function(data) {
        if (!EkTelemetry.initialized) {
            console.log("Telemetry is not initialized, Please start telemetry first");
            return;
        }
        if (!instance.hasRequiredData(data, ["err", "errtype", "stacktrace"])) {
            console.error('Invalid error data');
            return;
        }
        if (data.object && !instance.checkRequiredField(data.object, telemetryInstance.objectRequiredFields)) {
            console.error('Invalid object spec')
            return;
        }
        if (data.plugin && !instance.checkRequiredField(data.plugin, telemetryInstance.pluginRequiredFields)) {
            console.error('Invalid plugin spec')
            return;
        }
        var eksData = {
            "err": data.err,
            "errtype": data.errtype,
            "stacktrace": data.stacktrace,
            "pageid": data.stageId || '',
            "object": data.object || '',
            "plugin": data.plugin || ''
        }
        instance.addEvent(instance.getEvent('ERROR', eksData));
    }

    this.telemetry.heartbeat = function(data) {
        if (!EkTelemetry.initialized) {
            console.log("Telemetry is not initialized, Please start telemetry first");
            return;
        }
        instance.addEvent(instance.getEvent('HEARTBEAT', data));
    }

    this.telemetry.log = function(data) {
        if (!EkTelemetry.initialized) {
            console.log("Telemetry is not initialized, Please start telemetry first");
            return;
        }
        if (!instance.hasRequiredData(data, ["type", "level", "message"])) {
            console.error('Invalid log data');
            return;
        }
        var eksData = {
            "type": data.type,
            "level": data.level,
            "message": data.message,
            "pageid": data.stageid || '',
            "params": data.params || ''
        }
        instance.addEvent(instance.getEvent('LOG', eksData));
    }

    this.telemetry.search = function(data) {
        if (!EkTelemetry.initialized) {
            console.log("Telemetry is not initialized, Please start telemetry first");
            return;
        }
        if (!instance.hasRequiredData(data, ["query", "size", "topn"])) {
            console.error('Invalid search data');
            return;
        }
        var eksData = {
            "type": data.type || '',
            "query": data.query,
            "filters": data.filters || {},
            "sort": data.sort || {},
            "correlationid": data.correlationid || "",
            "size": data.size,
            "topn": data.type || []
        }
        instance.addEvent(instance.getEvent('SEARCH', eksData));
    }

    this.telemetry.metrics = function(data) {
        if (!EkTelemetry.initialized) {
            console.log("Telemetry is not initialized, Please start telemetry first");
            return;
        }
        instance.addEvent(instance.getEvent('METRICS', data));
    }

    this.telemetry.exdata = function(type, data) {
        if (!EkTelemetry.initialized) {
            console.log("Telemetry is not initialized, Please start telemetry first");
            return;
        }
        var eksData = {
            "type": type || '',
            "data": data || ''
        }
        instance.addEvent(instance.getEvent('EXDATA', eksData));
    }

    this.telemetry.summary = function(data) {
        if (!EkTelemetry.initialized) {
            console.log("Telemetry is not initialized, Please start telemetry first");
            return;
        }
        if (!instance.hasRequiredData(data, ["type", "starttime", "endtime", "timespent","pageviews","interactions"])) {
            console.error('Invalid summary data');
            return;
        }
        var eksData = {
            "type": data.type,
            "mode": data.mode || '',
            "starttime": data.starttime,
            "endtime": data.endtime,
            "timespent": data.timespent,
            "pageviews": data.pageviews,
            "interactions": data.interactions,
            "envsummary": data.envsummary || [],
            "eventssummary": data.eventssummary || [],
            "pagesummary": data.pagesummary || []
        }
        instance.addEvent(instance.getEvent('SUMMARY', eksData));
    }    

    instance.init = function(config, contentId, contentVer, type) {
        if (EkTelemetry.initialized) {
            console.log("Telemetry is already initialized..");
            return;
        }
        if (config.pdata && !instance.checkRequiredField(config.pdata, telemetryInstance.pdataRequiredFields)) {
            console.error('Invalid pdata spec in config')
            return;
        }
        if (config.object && !instance.checkRequiredField(config.object, telemetryInstance.targetObjectRequiredFields)) {
            console.error('Invalid target object spec in config')
            return;
        }

        var requiredData = Object.assign(config, { "contentId": contentId, "contentVer": contentVer, "type": type });

        if (!instance.hasRequiredData(requiredData, ["contentId", "contentVer", "pdata", "channel", "uid", "env"])) {
            console.error('Invalid start data');
            EkTelemetry.initialized = false;
            return EkTelemetry.initialized;
        }

        _defaultValue.gdata = {
            "id": contentId,
            "ver": contentVer
        }
        config.batchsize = config.batchsize ? (config.batchsize < 10 ? 10 : (config.batchsize > 1000 ? 1000 : config.batchsize)) : _defaultValue.batchsize;
        EkTelemetry.config = Object.assign(_defaultValue, config);
        EkTelemetry.initialized = true;
        return EkTelemetry.initialized;
    }

    instance.getEvent = function(eventId, data) {
        var eventObj = {
            "eid": eventId,
            "ets": (new Date()).getTime(),
            "ver": EkTelemetry._version,
            "mid": '',
            "actor": {
                "id": EkTelemetry.config.uid,
                "type": 'User'
            },
            "context": {
                "channel": EkTelemetry.config.channel,
                "pdata": EkTelemetry.config.pdata,
                "env": EkTelemetry.config.env,
                "sid": EkTelemetry.config.sid,
                "did": EkTelemetry.config.did,
                "cdata": EkTelemetry.config.cdata, //TODO: No correlation data as of now. Needs to be sent by portal in context
                "rollup": EkTelemetry.config.rollup || {}
            },
            "object": EkTelemetry.config.object,
            "tags": EkTelemetry.config.tags,
            "edata": data
        }
        return eventObj;
    }

    instance.addEvent = function(telemetryEvent) {
        if (EkTelemetry.initialized) {
            telemetryEvent.mid = telemetryEvent.edata.eks + '_' + CryptoJS.MD5(JSON.stringify(telemetryEvent)).toString();
            var customEvent = new CustomEvent('TelemetryEvent', { detail: telemetryEvent });
            console.log("Telemetry Event ", telemetryEvent);
            document.dispatchEvent(customEvent);
        } else {
            console.log("Telemetry is not initialized. Please start Telemetry to log events.");
        }
    }

    instance.hasRequiredData = function(data, mandatoryFields) {
        var isValid = true;
        mandatoryFields.forEach(function(key) {
            if (!data.hasOwnProperty(key)) isValid = false;
        });
        return isValid;
    }

    instance.checkRequiredField = function(data, defaultKeys) {
        var returnValue = true;
        defaultKeys.forEach(function(key) {
            if (!data.hasOwnProperty(key)) {
                returnValue = false
            }
        })
        return returnValue;
    }

    // For device which dont support ECMAScript 6
    instance.objectAssign = function() {
        Object.assign = function(target) {
            'use strict';
            if (target == null) {
                throw new TypeError('Cannot convert undefined or null to object');
            }

            target = Object(target);
            for (var index = 1; index < arguments.length; index++) {
                var source = arguments[index];
                if (source != null) {
                    for (var key in source) {
                        if (Object.prototype.hasOwnProperty.call(source, key)) {
                            target[key] = source[key];
                        }
                    }
                }
            }
            return target;
        }
    }

    if (typeof Object.assign != 'function') {
        instance.objectAssign();
    }

    return this.telemetry;
})();