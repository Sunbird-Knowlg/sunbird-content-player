/**
 * this is the Telemetry Interface
 * @author Krushanu Mohapatra <Krushanu.Mohapatra@tarento.com>
 */

Telemetry = {
    _version: "2.1",
    isActive: false,
    config: undefined,
    instance: undefined,
    _data: [],
    user: {},

    start: function(config, contentId, contentVer, type, data) {
        config = {
            pdata : {
                id: (config && config.pdata) ? config.pdata.id : "genie",
                ver: (config && config.pdata) ? config.pdata.ver : "6.5.2567",
                pid: (config && config.pdata) ? config.pdata.pid : ""
            },
            channel : (config && config.channel) ? config.channel : "in.ekstep",
            uid: (config && config.uid) ? config.uid : "anonymous",
            did: config.did,
            authtoken: (config && config.authtoken) ? config.authtoken : "",

            sid: (config && config.sid) ? config.sid : "",
            batchsize: (config && config.batchsize) ? config.batchsize : 20,
            mode: (config && config.mode) ? config.mode : "play",
            host: (config && config.host) ? config.host : "https://api.ekstep.in",
            endpoint: (config && config.endpoint) ? config.endpoint : "/data/v3/telemetry",
            tags: (config && config.tags) ? config.tags : [],
            cdata: (config && config.cdata) ? config.cdata : [],

            apislug: (config && config.apislug )? config.apislug : "/action"
        };

        Telemetry.user = { uid: config.uid };

        if ("undefined" == typeof Telemetry.config) Telemetry.config = config;
        TelemetrySyncManager.updateConfig();

        return new Promise(function(resolve, reject) {
            if (!Telemetry.instance && 'undefined' != typeof Telemetry.config.pdata && 'undefined' != typeof Telemetry.config.channel && 'undefined' != typeof Telemetry.config.uid && 'undefined' != typeof Telemetry.config.did && 'undefined' != typeof Telemetry.config.authtoken) {
                Telemetry.instance = new TelemetryV2Manager();
                TelemetryServiceUtil.getConfig().then(function(config) {
                    Telemetry.config.events = config.events;
                    if (config.isActive) Telemetry.isActive = config.isActive;
                    resolve(true);
                }).catch(function(err) {
                    reject(err);
                });
                if (config.cData && !isEmpty(config.cData)) {
                    Telemetry._correlationData = config.cData;
                };

                if (data.otherData && !isEmpty(data.otherData)) {
                    Telemetry._otherData = data.otherData;
                };

                // data.contentVer = (contentVer) ? contentVer + "" : "1"; // setting default ver to 1
                if (findWhere(Telemetry.instance._start, {
                        contentId: contentId
                    }))
                    return new InActiveEvent();
                else
                    return Telemetry.flushEvent(Telemetry.instance.start(contentId, contentVer, data));

                resolve(true);
            } else {
                resolve(true)
                console.log("Telemetry instance is not create")
            }
        });
    },

    impression: function(pageid, type, subtype, data) {
        if (!Telemetry.isActive) {
            return new InActiveEvent();
        }
        return this.flushEvent(Telemetry.instance.navigate(pageid, type, subtype));
    },

    interact: function(data) {
        if (!Telemetry.isActive) {
            return new InActiveEvent();
        }
        return Telemetry.flushEvent(Telemetry.instance.interact(data));
    },

    assess: function(data) {
        // what is this ?? doubt

    },

    startAssessment: function(qid, subject, qlevel, data) {
        if (!Telemetry.isActive) {
            return new InActiveEvent();
        }
        return Telemetry.instance.assess(qid, subject, qlevel, data);
    },

    endAssessment: function(assessStartEvent, data) {
        if (!Telemetry.isActive) {
            return new InActiveEvent();
        }
        return Telemetry.flushEvent(Telemetry.instance.assessEnd(assessStartEvent, data));
    },

    response: function(data) {
        if (!Telemetry.isActive) {
            return new InActiveEvent();
        }
        return Telemetry.instance.itemResponse(data);
    },

    interrupt: function(data) {
        if (!Telemetry.isActive) {
            return new InActiveEvent();
        }
        return Telemetry.flushEvent(Telemetry.instance.interrupt(data));
    },

    error: function(error) {
        if (!Telemetry.isActive) {
            return new InActiveEvent();
        }
        return Telemetry.flushEvent(Telemetry.instance.error(error));
    },

    feedback: function(data) {
        // no scope of feedback

    },

    end: function(data) {
        if (!Telemetry.isActive) {
            return new InActiveEvent();
        }
        return this.flushEvent(Telemetry.instance.end(data));
    },

    share: function(data) {
        // V2 does not have a share event

    },

    log: function(data) {
        // V2 doesnot have a log method

    },

    search: function(data) {
        // V2 does not have a search event

    },

    exdata: function(type, data) {
        if (!Telemetry.isActive) {
            return new InActiveEvent();
        }
        return this.flushEvent(Telemetry.instance.xapi(type, data));
    },

    flushEvent: function(event, apiName) {
        Telemetry._data.push(event);
        if (event)
            event.flush(apiName);
        return event;
    }
}
