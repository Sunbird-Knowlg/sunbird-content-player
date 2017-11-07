/**
 * this is the Telemetry Interface
 * @author Krushanu Mohapatra <Krushanu.Mohapatra@tarento.com>
 */

Telemetry = Class.extend({
    _version: "2.1",
    isActive: false,
    config: undefined,
    instance: undefined,
    _data: [],
    user: {},
    _defaultValue: {
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


    start: function(config, contentId, contentVer, type, data) {
        config = {
            pdata : {
                id: (config && config.pdata) ? config.pdata.id : Telemetry._defaultValue.pdataId,
                ver: (config && config.pdata) ? config.pdata.ver : Telemetry._defaultValue.pdataVer,
                pid: (config && config.pdata) ? config.pdata.pid : Telemetry._defaultValue.pdataPid
            },
            channel : (config && config.channel) ? config.channel : Telemetry._defaultValue.channel,
            uid: (config && config.uid) ? config.uid : Telemetry._defaultValue.uid,
            did: (config && config.did) ? config.did : Telemetry._defaultValue.did,
            authtoken: (config && config.authtoken) ? config.authtoken : Telemetry._defaultValue.authtoken,

            sid: (config && config.sid) ? config.sid : Telemetry._defaultValue.sid,
            batchsize: (config && config.batchsize) ? config.batchsize : Telemetry._defaultValue.batchsize,
            mode: (config && config.mode) ? config.mode : Telemetry._defaultValue.mode,
            host: (config && config.host) ? config.host : Telemetry._defaultValue.host,
            endpoint: (config && config.endpoint) ? config.endpoint : Telemetry._defaultValue.endpoint,
            tags: (config && config.tags) ? config.tags : Telemetry._defaultValue.tags,
            cdata: (config && config.cdata) ? config.cdata : Telemetry._defaultValue.cdata,

            apislug: (config && config.apislug )? config.apislug : Telemetry._defaultValue.apislug
        };

        Telemetry.user = { uid: config.uid };

        if ("undefined" == typeof Telemetry.config) Telemetry.config = config;
        TelemetrySyncManager.updateConfig();

        return new Promise(function(resolve, reject) {
            if (!Telemetry.instance && 'undefined' != typeof Telemetry.config.pdata && 'undefined' != typeof Telemetry.config.channel && 'undefined' != typeof Telemetry.config.uid && 'undefined' != typeof Telemetry.config.did && 'undefined' != typeof Telemetry.config.authtoken) {
                if (Telemetry._version == "2.1") {
                    Telemetry.instance = new TelemetryV2Manager();
                } else {
                    // Telemetry v3 instance gets assigned here to "Telemetry.instance"
                }
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
        console.log("This method comes in V3 release");

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
        console.log("This method comes in V3 release");
    },

    end: function(data) {
        if (!Telemetry.isActive) {
            return new InActiveEvent();
        }
        return this.flushEvent(Telemetry.instance.end(data));
    },

    share: function(data) {
        console.log("This method comes in V3 release");
    },

    log: function(data) {
        console.log("This method comes in V3 release");
    },

    search: function(data) {
        console.log("This method comes in V3 release");
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
});
