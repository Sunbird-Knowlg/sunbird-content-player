/**
 * this is the Telemetry Interface
 * @author Krushanu Mohapatra <Krushanu.Mohapatra@tarento.com>
 */

(function() {
    this.Telemetry = function() {};

    Telemetry.isActive = false;
    Telemetry.config = undefined;
    
    this._defaultValue = {
        pdataId: "genie",
        pdataVer: "6.5.2567",
        pdataPid: "",

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
    }

    this.setConfig = function(config, contentId, contentVer){
      config = {
            pdata : {
                id: (config && config.pdata) ? config.pdata.id : this._defaultValue.pdataId,
                ver: (config && config.pdata) ? config.pdata.ver : this._defaultValue.pdataVer,
                pid: (config && config.pdata) ? config.pdata.pid : this._defaultValue.pdataPid
            },
            channel : (config && config.channel) ? config.channel : this._defaultValue.channel,
            uid: (config && config.uid) ? config.uid : this._defaultValue.uid,
            did: (config && config.did) ? config.did : this._defaultValue.did,
            authtoken: (config && config.authtoken) ? config.authtoken : this._defaultValue.authtoken,

            sid: (config && config.sid) ? config.sid : this._defaultValue.sid,
            batchsize: (config && config.batchsize) ? config.batchsize : this._defaultValue.batchsize,
            mode: (config && config.mode) ? config.mode : this._defaultValue.mode,
            host: (config && config.host) ? config.host : this._defaultValue.host,
            endpoint: (config && config.endpoint) ? config.endpoint : this._defaultValue.endpoint,
            tags: (config && config.tags) ? config.tags : this._defaultValue.tags,
            cdata: (config && config.cdata) ? config.cdata : this._defaultValue.cdata,

            apislug: (config && config.apislug )? config.apislug : this._defaultValue.apislug
        };

        this.isActive = true;
        Telemetry.config = config;
        console.log("Telemetry config ", Telemetry.config);
    }

    Telemetry.start = function(config, contentId, contentVer, type, data) {
        setConfig(config, contentId, contentVer);
    }

    this.hasRequiredData= function(data, mandatoryFields) {
        var isValid = true;
        mandatoryFields.forEach(function(key) {
            if (!data.hasOwnProperty(key)) isValid = false;
        });
        return isValid;
    }

    Telemetry.impression= function(pageid, type, subtype, data) {
        if (!this.hasRequiredData(data, ["pageid", "type"])) {
            console.error('Invalid impression data');
            return;
        }
        var eksData = {
            "stageid": pageid
            "stageto": (data && data.stageto) ? data.stageto : "",
            "type": type,
            "subtype": subtype ? subtype : ""
        };
        this.getEvent('OE_NAVIGATE', eksData);
    }

    Telemetry.interact= function(data) {
        if (!this.hasRequiredData(data, ["type", "id"])) {
            console.error('Invalid interact data');
            return;
        }
        var eksData = {
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
        this.getEvent('OE_INTERACT', eksData);
    }

    Telemetry.startAssessment= function(qid, data) {
        if (undefined == qid){
            console.error('Invalid interact data');
            return;
        }
        var eksData = {
            qid: qid,
            maxscore: maxscore
        };
        this.getEvent('OE_ASSESS', eksData);
    },

    Telemetry.endAssessment= function(assessStartEvent, data) {
        if (!Telemetry.isActive) {
            return new InActiveEvent();
        }
        return Telemetry.flushEvent(Telemetry.instance.assessEnd(assessStartEvent, data));
    }

    Telemetry.response= function(data) {
        if (!this.hasRequiredData(data, ["target", "qid", "type"])) {
            console.error('Invalid response data');
            return;
        }
        var eksData = {
            "target": data.target,
            "qid": data.qid,
            "type": data.type,
            "state": data.state || "",
            "resvalues": isEmpty(data.values) ? [] : data.values
        }
        this.getEvent('OE_ITEM_RESPONSE', eksData);
    }
    
    Telemetry.interrupt= function(data) {
        if (!this.hasRequiredData(data, ["type"])) {
            console.error('Invalid interrupt data');
            return;
        }
        var eksData = {
            "type": data.type,
            "stageid": data.pageid || ''
        }
        this.getEvent('OE_INTERRUPT', eksData);
    }
    
    Telemetry.error= function(error) {
        if (!this.hasRequiredData(data, ["err", "errtype"])) {
            console.error('Invalid error data');
            return;
        }
        var eksData = {
            err: data.err, 
            "type": data.errtype,
            "env": data.env || '', 
            "stacktrace": data.stacktrace, 
            "stageid": data.stageId || '', 
            "objecttype": data.objectType || '', 
            "objectid": data.objectId || '', 
            "action": data.action || '', 
            "data": data.data || '', 
            "severity": data.severity || ''
        }
        this.getEvent('OE_ERROR', eksData);
    }

    Telemetry.end= function(data) {
        if (!Telemetry.isActive) {
            return new InActiveEvent();
        }
        return this.flushEvent(Telemetry.instance.end(data));
    }

    Telemetry.exdata= function(type, data) {
        if (!Telemetry.isActive) {
            return new InActiveEvent();
        }
        return this.flushEvent(Telemetry.instance.xapi(type, data));
    }
    
    Telemetry.assess= function(data) {
        console.log("This method comes in V3 release");

    }

    Telemetry.feedback= function(data) {
        console.log("This method comes in V3 release");
    }

    Telemetry.share= function(data) {
        console.log("This method comes in V3 release");
    }

    Telemetry.log= function(data) {
        console.log("This method comes in V3 release");
    }

    Telemetry.search= function(data) {
        console.log("This method comes in V3 release");
    }

    this.flushEvent= function(event, apiName) {
        Telemetry._data.push(event);
        if (event)
            event.flush(apiName);
        return event;
    }

    this.getEvent= function(eventId, data) {
        return {
            "eid": eventId,
            "ver": this._version,
            "mid": "",
            "ets": (new Date()).getTime(),
            "channel": this.config.channel,
            "pdata": this.config.pdata,
            "gdata": this.config.gdata,
            "cdata": this.config.cdata, //TODO: No correlation data as of now. Needs to be sent by portal in context
            "uid": this.config.uid, // uuid of the requester
            "sid": this.config.sid,
            "did": this.config.did,
            "edata": { "eks": data },
            "etags": {
                "tags": this.config.tags
            }
        }
    }

    return Telemetry;
})();
