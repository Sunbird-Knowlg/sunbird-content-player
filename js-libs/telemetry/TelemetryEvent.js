TelemetryEvent = Class.extend({
    createdTime: undefined,
    _isStarted: false,
    startTime: 0,
    name: undefined,
    event: undefined,
    init: function(eid, version, body, user, gdata, cdata, otherData) {
        if("undefined" != gdata && "undefined" == gdata.ver)
            gdata.ver = "1";
        this.createdTime = getCurrentTime();
        this.name = eid;

        this.event = {
            ver: version,
            sid: user.uid,
            uid: user.uid,
            did: user.uid,
            edata: {
                eks: body || {}
            },
            eid: eid,
            gdata: gdata,
            cdata: cdata
        };
        if(otherData){
            var otherKeys = Object.keys(otherData);
            for(var i=0; i<otherKeys.length; i++){
                var keyName = otherKeys[i];

                var sourceObj = this.event[keyName];
                var targetObj = otherData[keyName];
                if(sourceObj){
                    // dtat is already present
                    if(typeof(sourceObj) === 'object'){
                        // data is of type object or Array
                        if(Array.isArray(sourceObj)){
                            sourceObj.append(targetObj);;
                        } else {
                            Object.assign(sourceObj, targetObj);
                        }
                    } else {
                        // Data is of type 'string' or number
                        sourceObj = targetObj;
                    }
                } else {
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
                telemetry.send(JSON.stringify(this.event), apiName).then(function() {
                    return JSON.stringify(this.event);
                }).catch(function(err) {
                    if(instance.event.uid){    // TODO Find the Unknow events from(Jquery/cordova/ionic)
                         TelemetryService.logError(instance.name, err);
                    }else{
                        console.warn("uid is not Present",instance.event);
                    }
                });
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
    end: function() {
        if (this._isStarted) {
            this.event.edata.eks.length = Math.round((getCurrentTime() - this.startTime ) / 1000);
            this.event.ets = new Date().getTime();
            this._isStarted = false;
            return this;
        } else {
            throw "can't end event without starting.";
        }
    }
});
