TelemetryEvent = Class.extend({
    createdTime: undefined,
    _isStarted: false,
    startTime: 0,
    name: undefined,
    event: undefined,
    init: function(eid, version, body, user, gdata, cdata, otherData) {
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
        if (otherData) {
            var otherKeys = Object.keys(otherData);
            for (var i=0; i<otherKeys.length; i++) {
                var keyName = otherKeys[i];

                var sourceObj = this.event[keyName];
                var targetObj = otherData[keyName];
                if ('undefined' != typeof sourceObj) {
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
                } else if('undefined' != typeof targetObj){
                    // Data is not present
                    this.event[keyName] = targetObj;
                }
            }
        }
        this.event.ets = getCurrentTime(this.createdTime);
    },
    flush: function(apiName) {
        var instance = this;
        if (this.event) {

            var eve = new CustomEvent("telemetryEvent", { "detail": this.event });
            document.dispatchEvent(eve);

            console.log(JSON.stringify(this.event));
        }
    },
    ext: function(ext) {
        if ("object" == typeof ext) {
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
            if('undefined' != typeof data && 'undefined' != typeof data.progress) {
                eks.progress = data.progress; // Default progress value is 50 later we need to remove
            }
            if ('undefined' != typeof data && 'undefined' != typeof data.stageid) {
                eks.stageid = data.stageid; // attach stage id to eks
            }
            this.event.edata.eks.length = Math.round((getCurrentTime() - this.startTime ) / 1000);
            this.event.edata.eks.progress = eks.progress || undefined;
            this.event.edata.eks.stageid = eks.stageid || undefined;
            this.event.ets = new Date().getCurrentTime();
            this._isStarted = false;
            return this;
        } else {
            throw "can't end event without starting.";
        }
    }
});
