TelemetryEvent = Class.extend({
    createdTime: undefined,
    _isStarted: false,
    startTime: 0,
    name: undefined,
    event: undefined,
    init: function(eid, version, body, user, gdata) {
        this.createdTime = Date.now();
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
            gdata: gdata
        };
        TelemetryService._version == "1.0" ? this.event.ts = getTime(this.createdTime) : this.event.ets = getTime(this.createdTime);
    },
    flush: function() {
        if (this.event) {
            if (telemetry) {
                telemetry.send(JSON.stringify(this.event)).then(function() {
                    return JSON.stringify(this.event);
                }).catch(function(err) {
                    TelemetryService.logError(this.name, err);
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
        this.startTime = Date.now();
        return this;
    },
    end: function() {
        if (this._isStarted) {
            this.event.edata.eks.length = Math.round((new Date().getTime() - this.startTime ) / 1000);
            this.event.ets = new Date().getTime();
            return this;
        } else {
            throw "can't end event without starting.";
        }
    }
});