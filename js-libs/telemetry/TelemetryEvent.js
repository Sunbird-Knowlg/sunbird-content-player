TelemetryEvent = Class.extend({
    createdTime: undefined,
    _isStarted: false,
    startTime: 0,
    name: undefined,
    event: undefined,
    omitV3Fields: {'object': true, 'dispatcher': true, 'contentId': true, 'contentVer': true, 'type': true, 'batchsize': true,  'tags': true,  'rollup': true, "env": true, "cdata": true},
    init: function(eid, version, body, user, gdata, cdata, otherData) {
        if("undefined" != gdata && "undefined" == gdata.ver)
            gdata.ver = "1";

        if (otherData) {
            var defaultChannel =  "in.ekstep" ;
           if (undefined == otherData.channel){
                 otherData.channel = defaultChannel;
           } else if(otherData.channel == "") {
                 otherData.channel = defaultChannel;
           }
        }
        this.createdTime = getCurrentTime();
        this.name = eid;

        this.event = {
            ver: version,
            uid: user.uid,
            sid: (otherData) ? (otherData.sid || "") : "",
            did: (otherData) ? (otherData.did || "") : "",
            edata: {
                eks: body || {}
            },
            eid: eid,
            gdata: gdata,
            cdata: cdata
        };
        if(otherData){
            var otherKeys = Object.keys(otherData);
            for (var i=0; i<otherKeys.length; i++) {
                var keyName = otherKeys[i];

                if(this.omitV3Fields[keyName]) continue;

                var sourceObj = this.event[keyName];
                var targetObj = otherData[keyName];
                if (!_.isUndefined(sourceObj)) {
                    // data is already present
                    if(typeof(sourceObj) === 'object'){
                        // data is of type object or Array
                        if(Array.isArray(sourceObj)){
                            sourceObj.push(targetObj);;
                        } else {
                            Object.assign(sourceObj, targetObj);
                        }
                    } else {
                        // Data is of type 'string' or number
                        sourceObj = targetObj;
                    }
                } else if(!_.isUndefined(targetObj)){
                    // Data is not present
                    this.event[keyName] = targetObj;
                }
            }
        }
        TelemetryService._version == "1.0" ? this.event.ts = getTime(this.createdTime) : this.event.ets = getTime(this.createdTime);
    },
    flush: function(apiName) {
        var instance = this;
        if (this.event) {
            if ("undefined" != typeof telemetry) {
                var eventStr = JSON.stringify(this.event);
                console.log("V2 Telemetry event - ", eventStr);
                TelemetryService.eventDispatcher('telemetryEvent', eventStr);
                return eventStr;
                // telemetry.send(JSON.stringify(this.event), apiName).then(function() {
                //     return JSON.stringify(this.event);
                // }).catch(function(err) {
                //     if(instance.event.uid){    // TODO Find the Unknow events from(Jquery/cordova/ionic)
                //          TelemetryService.logError(instance.name, err);
                //     }else{
                //         console.warn("uid is not Present",instance.event);
                //     }
                // });
            } else {
                console.log(JSON.stringify(this.event));
            }
        }
    },
    ext: function(ext) {
        if (_.isObject(ext)) {
            if (this.event.edata.ext) {
                for (key in ext)
                    this.event.edata.ext[key] = ext[key];
            } else {
                this.event.edata.ext = ext;
            }
        }
        return this;
    },
    start: function() {
        this._isStarted = true;
        this.startTime = getCurrentTime();
        return this;
    },
    end: function(data) {
        if (this._isStarted) {
            var eks= {};
            // This method is called for access end as well. For OE_ASSESS it should not log "progress" data
            if(!_.isUndefined(data) && !_.isUndefined(data.progress)) {
                eks.progress = data.progress; // Default progress value is 50 later we need to remove
            }
            if (!_.isUndefined(data) && !_.isUndefined(data.stageid)) {
                eks.stageid = data.stageid; // attach stage id to eks
            }
            this.event.edata.eks.length = Math.round((getCurrentTime() - this.startTime ) / 1000);
            this.event.edata.eks.progress = eks.progress || undefined;
            this.event.edata.eks.stageid = eks.stageid || undefined;
            this.event.ets = new Date().getTime();
            this._isStarted = false;
            return this;
        } else {
            throw "can't end event without starting.";
        }
    }
});
