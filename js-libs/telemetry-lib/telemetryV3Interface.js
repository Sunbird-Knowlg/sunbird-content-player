
/**
 * Telemetry V3 Library
 * @author Akash Gupta <Akash.Gupta@tarento.com>
 */

// To support for node server environment 
if (typeof require === "function") {
    var Ajv = require('ajv')
}


var libraryDispatcher = {
    dispatch: function(event) {
        if (typeof document != 'undefined') {
            //To Support for external user who ever lisenting on this 'TelemetryEvent' event.
            // IT  WORKS ONLY FOR CLIENT SIDE
            document.dispatchEvent(new CustomEvent('TelemetryEvent', {detail: event }));
        } else {
            console.info("Library dispatcher supports only for client side.");
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
    this.ektelemetry.fingerPrintId = undefined;
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
        "env": "contentplayer",
        "sid": "",
        "did": "",
        "cdata": [],
        "rollup": {}
    },
    this.runningEnv = 'client';
    this.enableValidation = false;
    this._globalObject = {};
    this.startData = [];
    this.ajv = new Ajv({schemas: telemetrySchema});

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
        data.duration = data.duration || 0;
        if(contentId && contentVer){
            telemetryInstance._globalObject.id =  contentId;
            telemetryInstance._globalObject.ver = contentVer;
        }

        if (!EkTelemetry.initialized && config) {
            instance.init(config, contentId, contentVer)

        }
        instance.updateValues(options);
        var startEventObj = instance.getEvent('START', data);
        instance._dispatch(startEventObj)
        telemetryInstance.startData.push(JSON.parse(JSON.stringify(startEventObj)));
    }

    /**
     * Which is used to log the impression telemetry event.
     * @param  {object} data       [data which is need to pass in this event ex: {"type":"player","mode":"ContentPlayer","pageid":"splash"}]
     * @param  {object} options    [It can have `context, object, actor` can be explicitly passed in this event]
     */
    this.ektelemetry.impression = function(data, options) {
        instance.updateValues(options);
        instance._dispatch(instance.getEvent('IMPRESSION', data));
    }

    /**
     * Which is used to log the interact telemetry event.
     * @param  {object} data       [data which is need to pass in this event ex: {"type":"player","mode":"ContentPlayer","pageid":"splash"}]
     * @param  {object} options    [It can have `context, object, actor` can be explicitly passed in this event]
     */
    this.ektelemetry.interact = function(data, options) {
        instance.updateValues(options);
        instance._dispatch(instance.getEvent('INTERACT', data));
    }

    /**
     * Which is used to log the assess telemetry event.
     * @param  {object} data       [data which is need to pass in this event ex: {"type":"player","mode":"ContentPlayer","pageid":"splash"}]
     * @param  {object} options    [It can have `context, object, actor` can be explicitly passed in this event]
     */
    this.ektelemetry.assess = function(data, options) {
        instance.updateValues(options);
        // assess event telemetry version changes
        var assessEventObj = instance.getEvent('ASSESS', data);
        assessEventObj.ver = EkTelemetry._version;
        if(data.item && data.item.eventVer){
            assessEventObj.ver = data.item.eventVer;
            delete assessEventObj.edata.item.eventVer;
        }
        instance._dispatch(assessEventObj);
    }

    /**
     * Which is used to log the response telemetry event.
     * @param  {object} data       [data which is need to pass in this event ex: {"type":"player","mode":"ContentPlayer","pageid":"splash"}]
     * @param  {object} options    [It can have `context, object, actor` can be explicitly passed in this event]
     */
    this.ektelemetry.response = function(data, options) {
        instance.updateValues(options);
        instance._dispatch(instance.getEvent('RESPONSE', data));
    }

    /**
     * Which is used to log the interrupt telemetry event.
     * @param  {object} data       [data which is need to pass in this event ex: {"type":"player","mode":"ContentPlayer","pageid":"splash"}]
     * @param  {object} options    [It can have `context, object, actor` can be explicitly passed in this event]
     */
    this.ektelemetry.interrupt = function(data, options) {
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
            "rating": data.rating,
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
        instance.updateValues(options);
        instance._dispatch(instance.getEvent('SHARE', data));
    }

    /**
     * Which is used to log the audit telemetry event.
     * @param  {object} data       [data which is need to pass in this event ex: {"type":"player","mode":"ContentPlayer","pageid":"splash"}]
     * @param  {object} options    [It can have `context, object, actor` can be explicitly passed in this event]
     */
    this.ektelemetry.audit = function(data, options) {
        instance.updateValues(options);
        instance._dispatch(instance.getEvent('AUDIT', data));
    }

    /**
     * Which is used to log the error telemetry event.
     * @param  {object} data       [data which is need to pass in this event ex: {"type":"player","mode":"ContentPlayer","pageid":"splash"}]
     * @param  {object} options    [It can have `context, object, actor` can be explicitly passed in this event]
     */
    this.ektelemetry.error = function(data, options) {
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
        instance.updateValues(options);
        instance._dispatch(instance.getEvent('LOG', data));
    }

    /**
     * Which is used to log the search event.
     * @param  {object} data       [data which is need to pass in this event ex: {"type":"player","mode":"ContentPlayer","pageid":"splash"}]
     * @param  {object} options    [It can have `context, object, actor` can be explicitly passed in this event]
     */
    this.ektelemetry.search = function(data, options) {
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
        instance.updateValues(options);
        instance._dispatch(instance.getEvent('SUMMARY', data));
    } 

    /**
     * Which is used to log the end telemetry event.
     * @param  {object} data       [data which is need to pass in this event ex: {"type":"player","mode":"ContentPlayer","pageid":"splash"}]
     * @param  {object} options    [It can have `context, object, actor` can be explicitly passed in this event]
     */
    this.ektelemetry.end = function(data, options) {
        if(telemetryInstance.startData.length){
            var startEventObj = telemetryInstance.startData.pop();
            data.duration = Math.round(((new Date()).getTime() - startEventObj.ets) * 0.001); // Converting duration miliSeconds to seconds
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

    this.ektelemetry.syncEvents = function(){
    	if(typeof TelemetrySyncManager != 'undefined'){
    		TelemetrySyncManager.syncEvents();
    	}
    }      

    /**
     * Which is used to initialize the telemetry in globally.
     * @param  {object} config     [Telemetry configurations]
     * @param  {string} contentId  [Identifier value]
     * @param  {string} contentVer [Version]
     * @param  {object} type       [object type]
     */
    instance.init = function(config, contentId, contentVer) {
        if (EkTelemetry.initialized) {
            console.log("Telemetry is already initialized..");
            return;
        }
        !config && (config = {})
        contentId && (telemetryInstance._globalObject.id = contentId);
        contentVer && (telemetryInstance._globalObject.ver = contentVer);
        config.runningEnv && (telemetryInstance.runningEnv = config.runningEnv);
        if (typeof config.enableValidation !== 'undefined') {
            telemetryInstance.enableValidation = config.enableValidation;
        }
        config.batchsize = config.batchsize ? (config.batchsize < 10 ? 10 : (config.batchsize > 1000 ? 1000 : config.batchsize)) : _defaultValue.batchsize;
        EkTelemetry.config = Object.assign(_defaultValue, config);
        EkTelemetry.initialized = true;
        telemetryInstance.dispatcher = EkTelemetry.config.dispatcher ? EkTelemetry.config.dispatcher : libraryDispatcher;
        instance.updateConfigurations(config);
        console.info("Telemetry is initialized.")
    }

    /**
     * Which is used to dispatch a telemetry events.
     * @param  {object} message [Telemetry event object]
     */
    instance._dispatch = function(message) {
        message.mid = message.eid + ':' + CryptoJS.MD5(JSON.stringify(message)).toString();
        if(telemetryInstance.enableValidation){
	        var validate = ajv.getSchema('http://api.ekstep.org/telemetry/' + message.eid.toLowerCase())
	        var valid = validate(message)
	        if (!valid) { 
               console.error('Invalid ' + message.eid + ' Event: ' +ajv.errorsText(validate.errors))
               return
	        }
    	}
        if (telemetryInstance.runningEnv === 'client') {
            if (!message.context.did) {
                if (!EkTelemetry.fingerPrintId) {
                    EkTelemetry.getFingerPrint(function(result, components) {
                        message.context.did = result;
                        EkTelemetry.fingerPrintId = result;
                        dispatcher.dispatch(message);
                    })
                } else {
                    message.context.did = EkTelemetry.fingerPrintId;
                    dispatcher.dispatch(message);
                }
            } else {
                dispatcher.dispatch(message);
            }
        } else {
            dispatcher.dispatch(message);
        }
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
        config.pdata && (telemetryInstance._globalContext.pdata = config.pdata);


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
            options.runningEnv && (telemetryInstance.runningEnv = options.runningEnv);
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

    this.ektelemetry.getFingerPrint = function(cb) {
        new Fingerprint2().get(function(result, components) {
            if (cb) cb(result, components)
        })
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
Telemetry = $t = EkTelemetry;


/**
 * To support for the node backEnd, So any node developer can import this telemetry lib.
 */
if(typeof module != 'undefined'){
    module.exports = Telemetry;
}
