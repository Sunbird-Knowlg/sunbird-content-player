/**
 * Telemetry V3 Library
 * @author Akash Gupta <Akash.Gupta@tarento.com>
 */

var EkTelemetry = (function() {
    this.ektelemetry = function() {};
    var instance = function() {};
    var telemetryInstance = this;
    this.ektelemetry.initialized = false;
    this.ektelemetry.config = undefined;
    this.ektelemetry._version = "3.0";
    dispatcher = undefined;

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

    this.ektelemetry.start = function(config, contentId, contentVer, data) {
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
        data.duration = data.duration || (new Date()).getTime();
        
        if (instance.init(config, contentId, contentVer, data.type)) {
            var startEventObj = instance.getEvent('START', data);
            instance._dispatch(startEventObj)

            // Required to calculate the time spent of content while generating OE_END
            EkTelemetry.startTime = startEventObj.ets;
            return startEventObj;
        }
    }

    this.ektelemetry.end = function(data) {
        if (!EkTelemetry.initialized) {
            console.log("Telemetry is not initialized, Please start telemetry first");
            return;
        }
        if (!instance.hasRequiredData(data, ["type"])) {
            console.error('Invalid end data. Required fields are missing.', data);
            return;
        }
        data.duration = ((new Date()).getTime() - EkTelemetry.startTime)
        instance._dispatch(instance.getEvent('END', data));
        EkTelemetry.initialized = false;
    }

    this.ektelemetry.impression = function(data) {
        if (undefined == data.pageid || undefined == data.type || undefined == data.uri) {
            console.error('Invalid impression data. Required fields are missing.', data);
            return;
        }
        if (data.visits && !instance.checkRequiredField(data.visits, telemetryInstance.visitRequiredFields)) {
            console.error('Invalid visits spec')
            return;
        }
        instance._dispatch(instance.getEvent('IMPRESSION', data));
    }

    this.ektelemetry.interact = function(data) {
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

        instance._dispatch(instance.getEvent('INTERACT', data));
    }

    this.ektelemetry.assess = function(data) {
        if (!instance.hasRequiredData(data, ["item", "pass", "score", "resvalues", "duration"])) {
            console.error('Invalid assess data');
            return;
        }
        if (!instance.checkRequiredField(data.item, telemetryInstance.questionRequiredFields)) {
            console.error('Invalid question spec')
            return;
        }

        instance._dispatch(instance.getEvent('ASSESS', data));
    }

    this.ektelemetry.response = function(data) {
        if (!instance.hasRequiredData(data, ["target", "values", "type"])) {
            console.error('Invalid response data');
            return;
        }
        if (!instance.checkRequiredField(data.target, telemetryInstance.targetRequiredFields)) {
            console.error('Invalid target spec')
            return;
        }

        instance._dispatch(instance.getEvent('RESPONSE', data));
    }

    this.ektelemetry.interrupt = function(data) {
        if (!instance.hasRequiredData(data, ["type"])) {
            console.error('Invalid interrupt data');
            return;
        }

        instance._dispatch(instance.getEvent('INTERRUPT', data));
    }

    this.ektelemetry.feedback = function(data) {
        var eksData = {
            "rating": data.rating || '',
            "comments": data.comments || ''
        }
        instance._dispatch(instance.getEvent('FEEDBACK', eksData));
    }

    //Share
    this.ektelemetry.share = function(data) {
        if (!instance.hasRequiredData(data, ["items"])) {
            console.error('Invalid share data');
            return;
        }
        
        instance._dispatch(instance.getEvent('INTERRUPT', data));
    }

    this.ektelemetry.audit = function(data) {
        if (!instance.hasRequiredData(data, ["props"])) {
            console.error('Invalid audit data');
            return;
        }
        
        instance._dispatch(instance.getEvent('AUDIT', data));
    }

    this.ektelemetry.error = function(data) {
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

        instance._dispatch(instance.getEvent('ERROR', data));
    }

    this.ektelemetry.heartbeat = function(data) {
        instance._dispatch(instance.getEvent('HEARTBEAT', data));
    }

    this.ektelemetry.log = function(data) {
        if (!instance.hasRequiredData(data, ["type", "level", "message"])) {
            console.error('Invalid log data');
            return;
        }
        instance._dispatch(instance.getEvent('LOG', data));
    }

    this.ektelemetry.search = function(data) {
        if (!instance.hasRequiredData(data, ["query", "size", "topn"])) {
            console.error('Invalid search data');
            return;
        }
        
        instance._dispatch(instance.getEvent('SEARCH', data));
    }

    this.ektelemetry.metrics = function(data) {
        instance._dispatch(instance.getEvent('METRICS', data));
    }

    this.ektelemetry.exdata = function(data) {
        instance._dispatch(instance.getEvent('EXDATA', data));
    }

    this.ektelemetry.summary = function(data) {
        if (!instance.hasRequiredData(data, ["type", "starttime", "endtime", "timespent","pageviews","interactions"])) {
            console.error('Invalid summary data');
            return;
        }
        
        instance._dispatch(instance.getEvent('SUMMARY', data));
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
        dispatcher = EkTelemetry.config.dispatcher ? EkTelemetry.config.dispatcher : libraryDispatcher;
        return EkTelemetry.initialized;
    }

    instance._dispatch = function(message) {
        if (EkTelemetry.initialized) {
            message.mid = message.eid + ':' + CryptoJS.MD5(JSON.stringify(message)).toString();
            dispatcher.dispatch(message);
        }
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

    // instance.addEvent = function(telemetryEvent) {
    //     if (EkTelemetry.initialized) {
    //         telemetryEvent.mid = telemetryEvent.eid + '_' + CryptoJS.MD5(JSON.stringify(telemetryEvent)).toString();
    //         var customEvent = new CustomEvent('TelemetryEvent', { detail: telemetryEvent });
    //         console.log("Telemetry Event ", telemetryEvent);
    //         document.dispatchEvent(customEvent);
    //     } else {
    //         console.log("Telemetry is not initialized. Please start Telemetry to log events.");
    //     }
    // }

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

    return this.ektelemetry;
})();

var libraryDispatcher = {
    dispatch: function(event){
        var customEvent = new CustomEvent('TelemetryEvent', { detail: event });
        console.log("Telemetry Event ", event);
        document.dispatchEvent(customEvent);
    }
};