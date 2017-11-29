/**
 * this is the Telemetry V3 Interface
 * @author Akash Gupta <Akash.Gupta@tarento.com>
 */

var Telemetry = (function() {
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
        mode: "play",
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
    this.configRequiredFields = ["eid","actor","channel","env"],
    this.actorRequiredFields = ["id","type"],
    this.pdataRequiredFields = ["id"],
    this.cdataRequiredFields = ["type","id"],
    this.targetObjectRequiredFields = ["type","id"],

    this.telemetry.start = function(config, contentId, contentVer, type, data) {
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
        data.duration = (((new Date()).getTime() - Telemetry.startTime) / 1000);
        if (instance.init(config, contentId, contentVer, type)) {
            var startEventObj = instance.getEvent('START', data);
            instance.addEvent(startEventObj)

            // Required to calculate the time spent of content while generating OE_END
            Telemetry.startTime = startEventObj.ets;
        }
    }

    this.telemetry.end = function(data) {
        if (!instance.hasRequiredData(data, ["type", "pageid"])) {
            console.error('Invalid end data');
            return;
        }
        data.duration = (((new Date()).getTime() - Telemetry.startTime) / 1000);
        instance.addEvent(instance.getEvent('END', data));
        Telemetry.initialized = false;
    }

    this.telemetry.impression = function(pageid, type, subtype, uri, visit) {
        if (undefined == pageid || undefined == type || undefined == uri) {
            console.error('Invalid impression data');
            return;
        }
        if (data.visits && !instance.checkRequiredField(data.visits, telemetryInstance.visitRequiredFields)) {
            console.error('Invalid visits spec')
            return;
        }
        instance.addEvent(instance.getEvent('IMPRESSION', data));
    }

    this.telemetry.interact = function(data) {
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
        instance.addEvent(instance.getEvent('INTERACT', data));
    }

    this.telemetry.assess = function(data) {
        if (!instance.hasRequiredData(data, ["item", "pass", "score", "resvalues", "duration"])) {
            console.error('Invalid assess data');
            return;
        }
        if (!instance.checkRequiredField(data.item, telemetryInstance.questionRequiredFields)) {
            console.error('Invalid question spec')
            return;
        }
        instance.addEvent(instance.getEvent('ASSESS', data));
    }

    this.telemetry.response = function(data) {
        if (!instance.hasRequiredData(data, ["target", "values", "type"])) {
            console.error('Invalid response data');
            return;
        }
        if (!instance.checkRequiredField(data.target, telemetryInstance.targetRequiredFields)) {
            console.error('Invalid target spec')
            return;
        }
        instance.addEvent(instance.getEvent('RESPONSE', data));
    }

    this.telemetry.interrupt = function(data) {
        if (!instance.hasRequiredData(data, ["type"])) {
            console.error('Invalid interrupt data');
            return;
        }
        instance.addEvent(instance.getEvent('INTERRUPT', data));
    }

    this.telemetry.feedback = function(data) {
        instance.addEvent(instance.getEvent('FEEDBACK', data));
    }

    //Share
    this.telemetry.share = function(data) {
        console.log("This method comes in V3 release");
    }

    this.telemetry.audit = function(data) {
        if (!instance.hasRequiredData(data, ["prop"])) {
            console.error('Invalid audit data');
            return;
        }
        instance.addEvent(instance.getEvent('AUDIT', data));
    }

    this.telemetry.error = function(data) {
        if (!instance.hasRequiredData(data, ["err", "errtype", "stacktrace"])) {
            console.error('Invalid error data');
            return;
        }
        if (!instance.checkRequiredField(data.object, telemetryInstance.objectRequiredFields)) {
            console.error('Invalid object spec')
            return;
        }
        if (!instance.checkRequiredField(data.plugin, telemetryInstance.pluginRequiredFields)) {
            console.error('Invalid plugin spec')
            return;
        }
        instance.addEvent(instance.getEvent('ERROR', data));
    }

    this.telemetry.heartbeat = function(data) {
        instance.addEvent(instance.getEvent('HEARTBEAT', data));
    }

    this.telemetry.log = function(data) {
        if (!instance.hasRequiredData(data, ["type", "level", "message"])) {
            console.error('Invalid log data');
            return;
        }
        instance.addEvent(instance.getEvent('LOG', data));
    }

    this.telemetry.search = function(data) {
        if (!instance.hasRequiredData(data, ["query", "size", "topn"])) {
            console.error('Invalid search data');
            return;
        }
        instance.addEvent(instance.getEvent('SEARCH', data));
    }

    this.telemetry.metrics = function(data) {
        instance.addEvent(instance.getEvent('METRICS', data));
    }

    this.telemetry.exdata = function(type, data) {
        instance.addEvent(instance.getEvent('EXDATA', data));
    }

    this.telemetry.summary = function(type, data) {
        if (!instance.hasRequiredData(data, ["type", "starttime", "endtime", "timespent","pageviews","interactions"])) {
            console.error('Invalid summary data');
            return;
        }
        instance.addEvent(instance.getEvent('SUMMARY', data));
    }    

    instance.init = function(config, contentId, contentVer, type) {
        if (Telemetry.initialized) {
            console.log("Telemetry is already initialized..");
            return false;
        }
        // Validating Required fields for config
        if (!instance.checkRequiredField(config, telemetryInstance.configRequiredFields)) {
            console.error('Invalid config spec')
            return;
        }
        if (!instance.checkRequiredField(config.actor, telemetryInstance.actorRequiredFields)) {
            console.error('Invalid actor spec in config')
            return;
        }
        if (config.pdata && !instance.checkRequiredField(config.pdata, telemetryInstance.actorRequiredFields)) {
            console.error('Invalid pdata spec in config')
            return;
        }
        if (config.cdata && !instance.checkRequiredField(config.cdata, telemetryInstance.cdataRequiredFields)) {
            console.error('Invalid cdata spec in config')
            return;
        }
        if (config.object && !instance.checkRequiredField(config.object, telemetryInstance.targetObjectRequiredFields)) {
            console.error('Invalid target object spec in config')
            return;
        }

        var requiredData = Object.assign(config, { "contentId": contentId, "contentVer": contentVer, "type": type });

        if (!instance.hasRequiredData(requiredData, ["contentId", "contentVer", "pdata", "channel", "uid", "authtoken"])) {
            console.error('Invalid start data');
            Telemetry.initialized = false;
            return Telemetry.initialized;
        }

        _defaultValue.gdata = {
            "id": contentId,
            "ver": contentVer
        }
        config.batchsize = config.batchsize ? (config.batchsize < 10 ? 10 : (config.batchsize > 1000 ? 1000 : config.batchsize)) : _defaultValue.batchsize;
        Telemetry.config = Object.assign(_defaultValue, config);
        Telemetry.initialized = true;
        return Telemetry.initialized;
    }

    instance.getEvent = function(eventId, data) {
        var eventObj = {
            "eid": eventId,
            "ets": (new Date()).getTime(),
            "ver": Telemetry._version,
            "mid": '',
            "actor": {
                "id": Telemetry.config.actor.id,
                "type": Telemetry.config.actor.type
            },
            "context": {
                "channel": Telemetry.config.channel,
                "pdata": Telemetry.config.pdata,
                "env": Telemetry.config.env,
                "sid": Telemetry.config.sid,
                "did": Telemetry.config.did,
                "cdata": Telemetry.config.cdata, //TODO: No correlation data as of now. Needs to be sent by portal in context
                "rollup": Telemetry.config.rollup || {}
            },
            "object": Telemetry.config.object,
            "tags": Telemetry.config.tags,
            "edata": data
        }
        return eventObj;
    }

    instance.addEvent = function(telemetryEvent) {
        if (Telemetry.initialized) {
            telemetryEvent.mid = CryptoJS.MD5(JSON.stringify(telemetryEvent)).toString();
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