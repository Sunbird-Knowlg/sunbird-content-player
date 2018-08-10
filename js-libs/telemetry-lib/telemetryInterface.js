/**
 * this is the Telemetry Interface
 * @author Krushanu Mohapatra <Krushanu.Mohapatra@tarento.com>
 */

var Telemetry = (function() {
    this.telemetry = function(){ };
    var instance = function(){ };
    this.telemetry.initialized = false;
    this.telemetry.config = undefined;
    this.telemetry._version = "2.2";
    
    this.startTime = 0;
    this._defaultValue = {
        pdata:{
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
    }

    this.telemetry.start = function(config, contentId, contentVer, type, data) {        
        if(instance.init(config, contentId, contentVer, type)){
            var startEventObj = instance.getEvent('OE_START', data);
            instance.addEvent(startEventObj)

            // Required to calculate the time spent of content while generating OE_END
            Telemetry.startTime = startEventObj.ets;          
        }        
    }

    this.telemetry.impression = function(pageid, type, subtype, data) {
        if (undefined == pageid ||  undefined == type) {
            console.error('Invalid impression data');
            return;
        }
        var eksData = {
            "stageid": pageid,
            "stageto": (data && data.stageto) ? data.stageto : "",
            "type": type,
            "subtype": subtype ? subtype : ""
        };
        instance.addEvent(instance.getEvent('OE_NAVIGATE', eksData));
    }

    this.telemetry.interact = function(data) {
        if (!instance.hasRequiredData(data, ["type", "id"])) {
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
        instance.addEvent(instance.getEvent('OE_INTERACT', eksData));
    }

    this.telemetry.startAssessment = function(qid, data) {
        if (undefined == qid){
            console.error('Invalid interact data');
            return;
        }
        var eksData = {
            qid: qid,
            maxscore: data.maxscore || 1
        };
        return instance.getEvent('OE_ASSESS', eksData);
    },

    this.telemetry.endAssessment = function(assessStartEvent, data) {
        if (!instance.hasRequiredData(data, ["qtitle", "qdesc", "mmc", "mc"])) {
            console.error('Invalid end assessment data');
            return;
        }
        if (undefined == assessStartEvent) {
            console.error('Invalid end assessment data');
            return;
        }
        var resvalues = data.res ? [] : data.res;
        resvalues = Array.isArray(resvalues) ? resvalues.map(function(val) {
            val = ("object" == typeof val) ? val :{"0" : val};
            return val;
        }) : [];

        var endeks = Object.assign(assessStartEvent.edata.eks, {
            "score": data.score || 0,
            "pass": data.pass ? 'Yes' : 'No',
            "resvalues": resvalues,
            "uri": data.uri || "",
            "qindex": data.qindex || 0,
            "exlength": 0,
            "qtitle": data.qtitle,
            "qdesc": data.qdesc.substr(0,140),
            "mmc": data.mmc,
            "mc": data.mc,
            "length": Math.round(((new Date()).getTime() - assessStartEvent.ets ) / 1000)
        })
        instance.addEvent(instance.getEvent('OE_ASSESS', endeks));
    }

    this.telemetry.response= function(data) {
        if (!instance.hasRequiredData(data, ["target", "qid", "type"])) {
            console.error('Invalid response data');
            return;
        }
        var eksData = {
            "target": data.target,
            "qid": data.qid,
            "type": data.type,
            "state": data.state || "",
            "resvalues": data.values ? [] : data.values
        }
        instance.addEvent(instance.getEvent('OE_ITEM_RESPONSE', eksData));
    }
    
    this.telemetry.interrupt= function(data) {
        if (!instance.hasRequiredData(data, ["type"])) {
            console.error('Invalid interrupt data');
            return;
        }
        var eksData = {
            "type": data.type,
            "stageid": data.pageid || ''
        }
        instance.addEvent(instance.getEvent('OE_INTERRUPT', eksData));
    }
    
    this.telemetry.error = function(data) {
        if (!instance.hasRequiredData(data, ["err", "errtype"])) {
            console.error('Invalid error data');
            return;
        }
        var eksData = {
            "err": data.err, 
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
        instance.addEvent(instance.getEvent('OE_ERROR', eksData));
    }

    this.telemetry.end = function(data) {
      var eksData = {
        "progress": data.progress || 50,
        "stageid": data.pageid || '',
        "length": (((new Date()).getTime() - Telemetry.startTime) / 1000)
      };
     
      instance.addEvent(instance.getEvent('OE_END', eksData));
      Telemetry.initialized = false;
    }

    this.telemetry.exdata = function(type, data) {
        instance.getEvent('OE_XAPI', {
            "xapi": data
        });
        instance.addEvent(instance.getEvent('OE_XAPI', eksData));
    }
    
    this.telemetry.assess = function(data) {
        console.log("This method comes in V3 release");
    }

    this.telemetry.feedback = function(data) {
        console.log("This method comes in V3 release");
    }

    this.telemetry.share = function(data) {
        console.log("This method comes in V3 release");
    }

    this.telemetry.log = function(data) {
        console.log("This method comes in V3 release");
    }

    this.telemetry.search = function(data) {
        console.log("This method comes in V3 release");
    }

    instance.init = function(config, contentId, contentVer, type){
        if(Telemetry.initialized){
            console.log("Telemetry is already initialized..");
            return false;
        }

        var requiredData = Object.assign(config, {"contentId": contentId, "contentVer": contentVer, "type": type});

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
        //pid is rquired for V3 spec. Hence we are deleting from pdata of V2.
        if(Telemetry.config.pdata.pid != undefined)
            delete Telemetry.config.pdata.pid;

        return Telemetry.initialized;
    }

    instance.getEvent = function(eventId, data) {
        var eventObj = {
            "eid": eventId,
            "ver": Telemetry._version,
            "mid": "",
            "ets": (new Date()).getTime(),
            "channel": Telemetry.config.channel,
            "pdata": Telemetry.config.pdata,
            "gdata": Telemetry.config.gdata,
            "cdata": Telemetry.config.cdata,
            "uid": Telemetry.config.uid, // uuid of the requester
            "sid": Telemetry.config.sid,
            "did": Telemetry.config.did,
            "edata": { "eks": data },
            "etags": {
                "partner": Telemetry.config.tags
            }
          }
        return eventObj;
    }

    instance.addEvent = function(telemetryEvent){
        if(Telemetry.initialized){
            telemetryEvent.mid = 'OE_' + CryptoJS.MD5(JSON.stringify(telemetryEvent)).toString();
            var customEvent = new CustomEvent('TelemetryEvent', {detail: telemetryEvent});
            console.log("Telemetry Event ", telemetryEvent);
            document.dispatchEvent(customEvent);
        }else{
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

    instance.objectAssign = function(){      
      Object.assign = function (target) {
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
      objectAssign();
    }

    return this.telemetry;
})();
