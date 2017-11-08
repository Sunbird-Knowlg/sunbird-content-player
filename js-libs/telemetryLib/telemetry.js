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

    return Telemetry;
})();
