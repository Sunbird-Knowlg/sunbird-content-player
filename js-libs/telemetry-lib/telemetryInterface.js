/**
 * this is the Telemetry Interface
 * @author Krushanu Mohapatra <Krushanu.Mohapatra@tarento.com>
 */

(function() {
    this.Telemetry = function() {};

    Telemetry.initialized = true;
    Telemetry.config = undefined;
    Telemetry._version = "2.2";
    
    this.startTime = 0;
    this._defaultValue = {
        pdata:{
            id: "genie",
            var: "6.5.2567",
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

    Telemetry.start = function(config, contentId, contentVer, type, data) {
        var requiredData = Object.assign(config, {"contentId": contentId, "contentVer": contentVer, "type": type});

        if (!hasRequiredData(requiredData, ["contentId", "contentVer", "pdata", "channel", "uid", "authtoken"])) {
            console.error('Invalid start data');
            Telemetry.initialized = false;
            return;
        }
        init(config, contentId, contentVer);
        
        var startEventObj = getEvent('OE_START', data);
        addEvent(startEventObj)

        // Required to calculate the time spent of content while generating OE_END
        startTime = startEventObj.ets;
    }

    Telemetry.impression = function(pageid, type, subtype, data) {
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
        addEvent(getEvent('OE_NAVIGATE', eksData));
    }

    Telemetry.interact = function(data) {
        if (!hasRequiredData(data, ["type", "id"])) {
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
        addEvent(getEvent('OE_INTERACT', eksData));
    }

    Telemetry.startAssessment = function(qid, data) {
        if (undefined == qid){
            console.error('Invalid interact data');
            return;
        }
        var eksData = {
            qid: qid,
            maxscore: data.maxscore || 1
        };
        return getEvent('OE_ASSESS', eksData);
    },

    Telemetry.endAssessment = function(assessStartEvent, data) {
        if (!hasRequiredData(data, ["qtitle", "qdesc", "mmc", "mc"])) {
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
        addEvent(getEvent('OE_ASSESS', endeks));
    }

    Telemetry.response= function(data) {
        if (!hasRequiredData(data, ["target", "qid", "type"])) {
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
        addEvent(getEvent('OE_ITEM_RESPONSE', eksData));
    }
    
    Telemetry.interrupt= function(data) {
        if (!hasRequiredData(data, ["type"])) {
            console.error('Invalid interrupt data');
            return;
        }
        var eksData = {
            "type": data.type,
            "stageid": data.pageid || ''
        }
        addEvent(getEvent('OE_INTERRUPT', eksData));
    }
    
    Telemetry.error = function(data) {
        if (!hasRequiredData(data, ["err", "errtype"])) {
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
        addEvent(getEvent('OE_ERROR', eksData));
    }

    Telemetry.end = function(data) {
      var eksData = {
        "progress": data.progress || 50,
        "stageid": data.pageid || '',
        "length": (((new Date()).getTime() - startTime) / 1000)
      };
     
      addEvent(getEvent('OE_END', eksData));
    }

    Telemetry.exdata = function(type, data) {
        getEvent('OE_XAPI', {
            "xapi": data
        });
        addEvent(getEvent('OE_XAPI', eksData));
    }
    
    Telemetry.assess = function(data) {
        console.log("This method comes in V3 release");
    }

    Telemetry.feedback = function(data) {
        console.log("This method comes in V3 release");
    }

    Telemetry.share = function(data) {
        console.log("This method comes in V3 release");
    }

    Telemetry.log = function(data) {
        console.log("This method comes in V3 release");
    }

    Telemetry.search = function(data) {
        console.log("This method comes in V3 release");
    }

    this.init = function(config, contentId, contentVer){
        _defaultValue.gdata = {
            "id": contentId,
            "ver": contentVer
        }
        config.batchsize = config.batchsize ? (config.batchsize < 10 ? 10 : (config.batchsize > 1000 ? 1000 : config.batchsize)) : _defaultValue.batchsize;
        Telemetry.config = Object.assign(_defaultValue, config);
        console.log("Telemetry config ", Telemetry.config);
    }

    this.getEvent = function(eventId, data) {
        var eventObj = {
            "eid": eventId,
            "ver": Telemetry._version,
            "mid": "",
            "ets": (new Date()).getTime(),
            "channel": Telemetry.config.channel,
            "pdata": Telemetry.config.pdata,
            "gdata": Telemetry.config.gdata,
            "cdata": Telemetry.config.cdata, //TODO: No correlation data as of now. Needs to be sent by portal in context
            "uid": Telemetry.config.uid, // uuid of the requester
            "sid": Telemetry.config.sid,
            "did": Telemetry.config.did,
            "edata": { "eks": data },
            "etags": {
                "tags": Telemetry.config.tags
            }
          }
        return eventObj;
    }

    this.addEvent = function(telemetryEvent){
        if(Telemetry.initialized){
            telemetryEvent.mid = 'OE_' + CryptoJS.MD5(JSON.stringify(telemetryEvent)).toString();
            var customEvent = new CustomEvent('TelemetryEvent', {detail: telemetryEvent});
            document.dispatchEvent(customEvent);
        }
    }

    this.hasRequiredData = function(data, mandatoryFields) {
        var isValid = true;
        mandatoryFields.forEach(function(key) {
            if (!data.hasOwnProperty(key)) isValid = false;
        });
        return isValid;
    }

    this.objectAssign = function(){      
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


    return Telemetry;
})();
