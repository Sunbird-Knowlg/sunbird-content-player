
/**
 * Telemetry V3 Library
 * @author Akash Gupta <Akash.Gupta@tarento.com>
 */

var libraryDispatcher = {
    dispatch: function(event) {
        if (typeof document != 'undefined') {
            //To Support for external user who ever lisenting on this 'TelemetryEvent' event.
            document.dispatchEvent(new CustomEvent('TelemetryEvent', {detail: event }));
        } else {
            TelemetrySyncManager.sendTelemetry({detail: event });
        }
    }
};


var EkTelemetry = (function() {
    this.ektelemetry = function() {};
    var instance = function() {};
    var telemetryInstance = this;
    this.ektelemetry.initialized = false;
    this.ektelemetry.config = {};
    this.ektelemetry._version = "3.0";
    this.dispatcher = libraryDispatcher;
    this._defaultValue = {
        uid: "anonymous",
        authtoken: "",
        batchsize: 20,
        host: "https://api.ekstep.in",
        endpoint: "/data/v3/telemetry",
        apislug: "/action",
    },
    this.telemetryEnvelop = {
        "eid": "",
        "ets": "",
        "ver": "",
        "mid": '',
        "actor": {},
        "context": {},
        "object": {},
        "tags": [],
        "edata": ""
    }
    this._globalContext = {
        "channel": 'in.ekstep',
        "pdata": {id: "in.ekstep", ver: "1.0", pid: ""},
        "env": 'ContentPlayer',
        "sid": "",
        "did": "",
        "cdata": [],
        "rollup": {}
    },
    this._globalObject = {};
    this.startData = [];
    this.deviceSpecRequiredFields = ["os","make","id","mem","idisk","edisk","scrn","camera","cpu","sims","cap"],
    this.userAgentRequiredFields = ["agent","ver","system","platform","raw"],
    this.objectRequiredFields = ["id","type","ver"],
    this.targetRequiredFields = ["id","type","ver"],
    this.pluginRequiredFields = ["id","ver"],
    this.visitRequiredFields = ["objid","objtype"],
    this.questionRequiredFields = ["id","maxscore","exlength","desc","title"],
    this.pdataRequiredFields = ["id"],
    this.targetObjectRequiredFields = ["type","id"],

    /**
     * Which is used to initialize the telemetry event
     * @param  {object} config - Configurations for the telemetry lib to initialize the service. " Example: config = { batchsize:10,host:"" } "
     */
    this.ektelemetry.initialize = function(config){
        instance.init(config);
    }

    /**
     * Which is used to start and initialize the telemetry event. 
     * If the telemetry is already initialzed then it will trigger only start event.
     * @param  {object} config     [Telemetry lib configurations]
     * @param  {string} contentId  [Content Identifier]
     * @param  {string} contentVer [Content version]
     * @param  {object} data       [Can have userAgent,device spec object]
     * @param  {object} options    [It can have `context, object, actor` can be explicitly passed in this event]
     */
    this.ektelemetry.start = function(config, contentId, contentVer, data, options) {
        if (!instance.hasRequiredData(data, ["type"])) {
            console.error('Invalid start data');
            return;
        }
        if (data.dspec && !instance.hasRequiredData(data.dspec, telemetryInstance.deviceSpecRequiredFields)) {
            console.error('Invalid device spec')
            return;
        }
        if (data.uaspec && !instance.hasRequiredData(data.uaspec, telemetryInstance.userAgentRequiredFields)) {
            console.error('Invalid user agent spec')
            return;
        }
        data.duration = data.duration || (new Date()).getTime();
        if(contentId && contentVer){
            telemetryInstance._globalObject.id =  contentId;
            telemetryInstance._globalObject.ver = contentVer;
        }

        if (!EkTelemetry.initialized && config) {
            instance.init(config, contentId, contentVer, data.type, function() {
                instance.updateValues(options);
                var startEventObj = instance.getEvent('START', data);
                instance._dispatch(startEventObj)
                telemetryInstance.startData.push(JSON.parse(JSON.stringify(startEventObj)));
            });
        } else {
            instance.updateValues(options);
            var startEventObj = instance.getEvent('START', data);
            instance._dispatch(startEventObj)
            telemetryInstance.startData.push(JSON.parse(JSON.stringify(startEventObj)));
        }
    }

    /**
     * Which is used to log the impression telemetry event.
     * @param  {object} data       [data which is need to pass in this event ex: {"type":"player","mode":"ContentPlayer","pageid":"splash"}]
     * @param  {object} options    [It can have `context, object, actor` can be explicitly passed in this event]
     */
    this.ektelemetry.impression = function(data, options) {
        if (undefined == data.pageid || undefined == data.type || undefined == data.uri) {
            console.error('Invalid impression data. Required fields are missing.', data);
            return;
        }
        if (data.visits && !instance.hasRequiredData(data.visits, telemetryInstance.visitRequiredFields)) {
            console.error('Invalid visits spec')
            return;
        }
        instance.updateValues(options);
        instance._dispatch(instance.getEvent('IMPRESSION', data));
    }

    /**
     * Which is used to log the interact telemetry event.
     * @param  {object} data       [data which is need to pass in this event ex: {"type":"player","mode":"ContentPlayer","pageid":"splash"}]
     * @param  {object} options    [It can have `context, object, actor` can be explicitly passed in this event]
     */
    this.ektelemetry.interact = function(data, options) {
        if (!instance.hasRequiredData(data, ["type", "id"])) {
            console.error('Invalid interact data');
            return;
        }
        if (data.target && !instance.hasRequiredData(data.target, telemetryInstance.targetRequiredFields)) {
            console.error('Invalid target spec')
            return;
        }
        if (data.plugin && !instance.hasRequiredData(data.plugin, telemetryInstance.pluginRequiredFields)) {
            console.error('Invalid plugin spec')
            return;
        }
        instance.updateValues(options);
        instance._dispatch(instance.getEvent('INTERACT', data));
    }

    /**
     * Which is used to log the assess telemetry event.
     * @param  {object} data       [data which is need to pass in this event ex: {"type":"player","mode":"ContentPlayer","pageid":"splash"}]
     * @param  {object} options    [It can have `context, object, actor` can be explicitly passed in this event]
     */
    this.ektelemetry.assess = function(data, options) {
        if (!instance.hasRequiredData(data, ["item", "pass", "score", "resvalues", "duration"])) {
            console.error('Invalid assess data');
            return;
        }
        if (!instance.hasRequiredData(data.item, telemetryInstance.questionRequiredFields)) {
            console.error('Invalid question spec')
            return;
        }
        instance.updateValues(options);
        instance._dispatch(instance.getEvent('ASSESS', data));
    }

    /**
     * Which is used to log the response telemetry event.
     * @param  {object} data       [data which is need to pass in this event ex: {"type":"player","mode":"ContentPlayer","pageid":"splash"}]
     * @param  {object} options    [It can have `context, object, actor` can be explicitly passed in this event]
     */
    this.ektelemetry.response = function(data, options) {
        if (!instance.hasRequiredData(data, ["target", "values", "type"])) {
            console.error('Invalid response data');
            return;
        }
        if (!instance.hasRequiredData(data.target, telemetryInstance.targetRequiredFields)) {
            console.error('Invalid target spec')
            return;
        }
        instance.updateValues(options);
        instance._dispatch(instance.getEvent('RESPONSE', data));
    }

    /**
     * Which is used to log the interrupt telemetry event.
     * @param  {object} data       [data which is need to pass in this event ex: {"type":"player","mode":"ContentPlayer","pageid":"splash"}]
     * @param  {object} options    [It can have `context, object, actor` can be explicitly passed in this event]
     */
    this.ektelemetry.interrupt = function(data, options) {
        if (!instance.hasRequiredData(data, ["type"])) {
            console.error('Invalid interrupt data');
            return;
        }
        instance.updateValues(options);
        instance._dispatch(instance.getEvent('INTERRUPT', data));
    }

    /**
     * Which is used to log the feedback telemetry event.
     * @param  {object} data       [data which is need to pass in this event ex: {"type":"player","mode":"ContentPlayer","pageid":"splash"}]
     * @param  {object} options    [It can have `context, object, actor` can be explicitly passed in this event]
     */
    this.ektelemetry.feedback = function(data, options) {
        var eksData = {
            "rating": data.rating || '',
            "comments": data.comments || ''
        }
        instance.updateValues(options);
        instance._dispatch(instance.getEvent('FEEDBACK', eksData));
    }

    /**
     * Which is used to log the share telemetry event.
     * @param  {object} data       [data which is need to pass in this event ex: {"type":"player","mode":"ContentPlayer","pageid":"splash"}]
     * @param  {object} options    [It can have `context, object, actor` can be explicitly passed in this event]
    */
    this.ektelemetry.share = function(data, options) {
        if (!instance.hasRequiredData(data, ["items"])) {
            console.error('Invalid share data');
            return;
        }
        instance.updateValues(options);
        instance._dispatch(instance.getEvent('INTERRUPT', data));
    }

    /**
     * Which is used to log the audit telemetry event.
     * @param  {object} data       [data which is need to pass in this event ex: {"type":"player","mode":"ContentPlayer","pageid":"splash"}]
     * @param  {object} options    [It can have `context, object, actor` can be explicitly passed in this event]
     */
    this.ektelemetry.audit = function(data, options) {
        if (!instance.hasRequiredData(data, ["props"])) {
            console.error('Invalid audit data');
            return;
        }
        instance.updateValues(options);
        instance._dispatch(instance.getEvent('AUDIT', data));
    }

    /**
     * Which is used to log the error telemetry event.
     * @param  {object} data       [data which is need to pass in this event ex: {"type":"player","mode":"ContentPlayer","pageid":"splash"}]
     * @param  {object} options    [It can have `context, object, actor` can be explicitly passed in this event]
     */
    this.ektelemetry.error = function(data, options) {
        if (!instance.hasRequiredData(data, ["err", "errtype", "stacktrace"])) {
            console.error('Invalid error data');
            return;
        }
        if (data.object && !instance.hasRequiredData(data.object, telemetryInstance.objectRequiredFields)) {
            console.error('Invalid object spec')
            return;
        }
        if (data.plugin && !instance.hasRequiredData(data.plugin, telemetryInstance.pluginRequiredFields)) {
            console.error('Invalid plugin spec')
            return;
        }
        instance.updateValues(options);
        instance._dispatch(instance.getEvent('ERROR', data));
    }

    /**
     * Which is used to log the heartbeat telemetry event.
     * @param  {object} data       [data which is need to pass in this event ex: {"type":"player","mode":"ContentPlayer","pageid":"splash"}]
     * @param  {object} options    [It can have `context, object, actor` can be explicitly passed in this event]
     */
    this.ektelemetry.heartbeat = function(data, options) {
        instance.updateValues(options);
        instance._dispatch(instance.getEvent('HEARTBEAT', data));
    }

    /**
     * Which is used to log the log event.
     * @param  {object} data       [data which is need to pass in this event ex: {"type":"player","mode":"ContentPlayer","pageid":"splash"}]
     * @param  {object} options    [It can have `context, object, actor` can be explicitly passed in this event]
     */
    this.ektelemetry.log = function(data, options) {
        if (!instance.hasRequiredData(data, ["type", "level", "message"])) {
            console.error('Invalid log data');
            return;
        }
        instance.updateValues(options);
        instance._dispatch(instance.getEvent('LOG', data));
    }

    /**
     * Which is used to log the search event.
     * @param  {object} data       [data which is need to pass in this event ex: {"type":"player","mode":"ContentPlayer","pageid":"splash"}]
     * @param  {object} options    [It can have `context, object, actor` can be explicitly passed in this event]
     */
    this.ektelemetry.search = function(data, options) {
        if (!instance.hasRequiredData(data, ["query", "size", "topn"])) {
            console.error('Invalid search data');
            return;
        }
        instance.updateValues(options);
        instance._dispatch(instance.getEvent('SEARCH', data));
    }

    /**
     * Which is used to log the metrics event.
     * @param  {object} data       [data which is need to pass in this event ex: {"type":"player","mode":"ContentPlayer","pageid":"splash"}]
     * @param  {object} options    [It can have `context, object, actor` can be explicitly passed in this event]
     */
    this.ektelemetry.metrics = function(data, options) {
        instance.updateValues(options);
        instance._dispatch(instance.getEvent('METRICS', data));
    }

    /**
     * Which is used to log the exdata event.
     * @param  {object} data       [data which is need to pass in this event ex: {"type":"player","mode":"ContentPlayer","pageid":"splash"}]
     * @param  {object} options    [It can have `context, object, actor` can be explicitly passed in this event]
     */
    this.ektelemetry.exdata = function(data, options) {
        instance.updateValues(options);
        instance._dispatch(instance.getEvent('EXDATA', data));
    }

    /**
     * Which is used to log the summary event.
     * @param  {object} data       [data which is need to pass in this event ex: {"type":"player","mode":"ContentPlayer","pageid":"splash"}]
     * @param  {object} options    [It can have `context, object, actor` can be explicitly passed in this event]
     */
    this.ektelemetry.summary = function(data, options) {
        if (!instance.hasRequiredData(data, ["type", "starttime", "endtime", "timespent","pageviews","interactions"])) {
            console.error('Invalid summary data');
            return;
        }
        instance.updateValues(options);
        instance._dispatch(instance.getEvent('SUMMARY', data));
    } 

    /**
     * Which is used to log the end telemetry event.
     * @param  {object} data       [data which is need to pass in this event ex: {"type":"player","mode":"ContentPlayer","pageid":"splash"}]
     * @param  {object} options    [It can have `context, object, actor` can be explicitly passed in this event]
     */
    this.ektelemetry.end = function(data, options) {
        if (!instance.hasRequiredData(data, ["type"])) {
            console.error('Invalid end data. Required fields are missing.', data);
            return;
        }
        if(telemetryInstance.startData.length){
            var startEventObj = telemetryInstance.startData.pop();
            data.duration = ((new Date()).getTime() - startEventObj.ets)
            instance.updateValues(options);
            instance._dispatch(instance.getEvent('END', data));
        }else{
            console.info("Please invoke start before invoking end event.")
        }
    }

    /**
     * Which is used to know the whether telemetry is initialized or not. 
     * @return {Boolean} 
     */
    this.ektelemetry.isInitialized = function(){
        return EkTelemetry.initialized;
    } 

    /**
     * Which is used to reset the current context
     * @param  {object} context [Context value]
     */
    this.ektelemetry.resetContext = function(context){
        telemetryInstance._currentContext = context || {};
    }

    /**
     * Which is used to reset the current object value.
     * @param  {object} object [Object value]
     */
    this.ektelemetry.resetObject = function(object){
        telemetryInstance._currentObject = object || {};
    },

    /**
     * Which is used to reset the current actor value.
     * @param  {object} object [Object value]
     */
    this.ektelemetry.resetActor = function(actor){
        telemetryInstance._currentActor = actor || {};
    }


    /**
     * Which is used to reset the current actor value.
     * @param  {object} object [Object value]
     */
    this.ektelemetry.resetTags = function(tags){
        telemetryInstance._currentTags = tags || [];
    }     

    /**
     * Which is used to initialize the telemetry in globally.
     * @param  {object} config     [Telemetry configurations]
     * @param  {string} contentId  [Identifier value]
     * @param  {string} contentVer [Version]
     * @param  {object} type       [object type]
     */
    instance.init = function(config, contentId, contentVer, type, cb) {
        if (EkTelemetry.initialized) {
            console.log("Telemetry is already initialized..");
            return;
        }
        !config && (config = {})
        if (config.pdata && !instance.hasRequiredData(config.pdata, telemetryInstance.pdataRequiredFields)) {
            console.error('Invalid pdata spec in config')
            return;
        }
        if (config.object && !instance.hasRequiredData(config.object, telemetryInstance.targetObjectRequiredFields)) {
            console.error('Invalid target object spec in config')
            return;
        }
        contentId && (telemetryInstance._globalObject.id = contentId);
        contentVer && (telemetryInstance._globalObject.ver = contentVer);
        type && (telemetryInstance._globalObject.type = type);
        if (!instance.hasRequiredData(config, ["pdata", "channel", "uid", "env"])) {
            console.error('Invalid start data');
            EkTelemetry.initialized = false;
            return;
        }
        config.batchsize = config.batchsize ? (config.batchsize < 10 ? 10 : (config.batchsize > 1000 ? 1000 : config.batchsize)) : _defaultValue.batchsize;
        EkTelemetry.config = Object.assign(_defaultValue, config);
        EkTelemetry.initialized = true;
        telemetryInstance.dispatcher = EkTelemetry.config.dispatcher ? EkTelemetry.config.dispatcher : libraryDispatcher;
        if (!config.did) {
            new Fingerprint2().get(function(result, components) {
                config.did = result;
                instance.updateConfigurations(config);
                if(cb) cb()
            })
        } else {
            instance.updateConfigurations(config);
            if(cb) cb();
        }
        console.info("Telemetry is initialized.")
    }

    /**
     * Which is used to dispatch a telemetry events.
     * @param  {object} message [Telemetry event object]
     */
    instance._dispatch = function(message) {
        message.mid = message.eid + ':' + CryptoJS.MD5(JSON.stringify(message)).toString();
        dispatcher.dispatch(message);
    }

    /**
     * Which is used to get the telemetry envelop data
     * @param  {string} eventId [Name of the event]
     * @param  {object} data    [Event data]
     * @return {object}         [Telemetry envelop data]
     */
    instance.getEvent = function(eventId, data) {
        telemetryInstance.telemetryEnvelop.eid =  eventId;
        telemetryInstance.telemetryEnvelop.ets = (new Date()).getTime();
        telemetryInstance.telemetryEnvelop.ver = EkTelemetry._version;
        telemetryInstance.telemetryEnvelop.mid = '';
        telemetryInstance.telemetryEnvelop.actor = Object.assign({}, {"id": EkTelemetry.config.uid || 'anonymous', "type": 'User'},instance.getUpdatedValue('actor'));
        telemetryInstance.telemetryEnvelop.context = Object.assign({}, instance.getGlobalContext(), instance.getUpdatedValue('context'));
        telemetryInstance.telemetryEnvelop.object = Object.assign({}, instance.getGlobalObject(), instance.getUpdatedValue('object'));
        telemetryInstance.telemetryEnvelop.tags = Object.assign([], EkTelemetry.config.tags, instance.getUpdatedValue('tags'));
        telemetryInstance.telemetryEnvelop.edata = data;
        return telemetryInstance.telemetryEnvelop;
    }

    /**
     * Which is used to validate the object
     * @param  {object}  data            [Object which is need to be validate]
     * @param  {object}  mandatoryFields [required fields should be present in the object]
     * @return {Boolean}                  
     */
    instance.hasRequiredData = function(data, mandatoryFields) {
        var isValid = true;
        mandatoryFields.forEach(function(key) {
            if (data) {
                if (!data.hasOwnProperty(key)) isValid = false;
            } else {
                isValid = false
            }
        });
        return isValid;
    }

    /**
     * Which is used to assing to globalObject and globalContext value from the telemetry configurations.
     * @param  {object} config [Telemetry configurations]
     */
    instance.updateConfigurations = function(config) {
        config.object && (telemetryInstance._globalObject = config.object);
        config.channel && (telemetryInstance._globalContext.channel = config.channel);
        config.env && (telemetryInstance._globalContext.env = config.env);
        config.rollup && (telemetryInstance._globalContext.rollup = config.rollup);
        config.sid && (telemetryInstance._globalContext.sid = config.sid);
        config.did && (telemetryInstance._globalContext.did = config.did);
        config.cdata && (telemetryInstance._globalContext.cdata = config.cdata);

    }

    /**
     * Which is used to get the current updated global context value.
     * @return {object} 
     */
    instance.getGlobalContext = function() {
       return telemetryInstance._globalContext;
    }

    /**
     * Which is used to get the current global object value.
     * @return {object} 
     */
    instance.getGlobalObject = function(){
        return telemetryInstance._globalObject;
    }

    /**
     * Which is used to update the both context and object vlaue.
     * For any event explicitly context and object value can be passed.
     * @param  {object} context [Context value object]
     * @param  {object} object  [Object value]
     */
    instance.updateValues = function(options) {
        if (options) {
            options.context && (telemetryInstance._currentContext = options.context);
            options.object && (telemetryInstance._currentObject = options.object);
            options.actor && (telemetryInstance._currentActor = options.actor);
            options.tags && (telemetryInstance._currentTags = options.tags);
        }
    }
    
    /**
     * Which is used to get the value of 'context','actor','object'
     * @param  {string} key [ Name of object which we is need to get ]
     * @return {object}     
     */
    instance.getUpdatedValue = function(key) {
        switch (key.toLowerCase()) {
            case 'context':
                return telemetryInstance._currentContext || {};
                break;
            case 'object':
                return telemetryInstance._currentObject || {};
                break;
            case 'actor':
                return telemetryInstance._currentActor || {};
                break;
            case 'tags':
                return telemetryInstance._currentTags || [];
                break;    
        }
    }

    /**
     * Which is used to support for lower end deviecs.
     * If any of the devices which is not supporting ECMAScript 6 version
     */
    instance.objectAssign = function() {
        Object.assign = function(target) {
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
        instance.objectAssign();
    }

    return this.ektelemetry;
})();

/**
 * Name space which is being fallowed
 * @type {[type]}
 */
window.Telemetry = window.$t = EkTelemetry;
