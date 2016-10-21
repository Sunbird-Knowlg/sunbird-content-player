genieservice_html = {
    localData: {},
    getCurrentUser: function() {
        return new Promise(function(resolve, reject) {
            var result = {};
            result.status = "success";
            result.data = {
                "avatar": "resource1",
                "gender": "male",
                "handle": "handle1",
                "uid": "8hjh3c4b7b47d570df0ec286bf7adc8ihhnjy",
                "age": 6,
                "standard": -1
            };
            resolve(result);
        });
    },
    getContent: function(id) {
         return new Promise(function(resolve, reject) {
            var result = _.findWhere(genieservice_html.localData.content, {"identifier": id});
            resolve(result);
        });
    },
    getLocalData: function(callback){
       jQuery.getJSON("test/localData.json", function(json) {
            genieservice_html.localData = json;
            console.log("LocalData json loaded", genieservice_html.localData);
            if(callback){
              callback();
            }
        });
    },
    languageSearch: function(inputFilter){
        return new Promise(function(resolve, reject) {
            resolve(genieservice_html.localData.languageSearch);
        });
    },
    launchContent:function(contentId, config){
        if("undefined" == typeof contentId){
            contentId = "do_20045479"
        }

        //Get new content data from GenieService
        var newContent = {};
        genieservice_html.getContent(contentId)
        .then(function(resp){
            newContent.metadata = resp;
            console.log("Launch new HTML content..");
            if (newContent && newContent.metadata.mimeType && newContent.metadata.mimeType == 'application/vnd.ekstep.html-archive') {
              // Launching new content 
              var basePath = (newContent.metadata.path.charAt(newContent.metadata.path.length-1) == '/')? newContent.metadata.path.substring(0, newContent.metadata.path.length-1): newContent.metadata.path;
              var path = "http://"+ location.host + "/" + basePath; 

              newContent.metadata.baseDir =  path;
              var contentUrl =  newContent.metadata.baseDir + '/index.html?cid='+ contentId + "&config="+ config;
              console.log("Opening through window.open");
              window.open(contentUrl, '_self');              
            }else{

            }
        })
        .catch(function(err){
            console.log("Failed", err);
        })
    }
};
genieservice_portal = {
    api: {
        basePath: '/v2/content/',
        getFullAPI: function() {
            return AppConfig[AppConfig.flavor] + this.basePath;
        }
    },
    getCurrentUser: function() {
        return new Promise(function(resolve, reject) {
            var result = {};
            result.status = "success";
            result.data = {
                "avatar": "resource1",
                "gender": "male",
                "handle": "handle1",
                "uid": "8hjh3c4b7b47d570df0ec286bf7adc8ihhnjy",
                "age": 6,
                "standard": -1
            };
            resolve(result);
        });
    },
    getMetaData: function() {
        return new Promise(function(resolve, reject) {
            var result = {};
            result = {
                "flavor": "sandbox",
                "version": "1.0.1"
            };
            resolve(result);
        });
    },
    getContentBody: function(id) {
        return new Promise(function(resolve, reject) {    
        jQuery.get(genieservice_portal.api.getFullAPI() + id + "?fields=body", {"Content-Type" : "application/json"}, function(resp) {
            var result = {};
            if (!resp.error) {
                result.list = resp;
                resolve(resp.result.content);
            } else {
                console.info("err : ", resp.error)
            }
        });
        });
    },
    getContent: function(id){
        return new Promise(function(resolve, reject) {
            if(COLLECTION_MIMETYPE == content.metadata.mimeType) {
                resolve(genieservice.getContentMetadata(id));
            } else {
                if(content) {
                    resolve(content.metadata);
                } 
            }
        });
    },
    getContentMetadata: function(id) {
        return new Promise(function(resolve, reject) {    
        jQuery.get(genieservice_portal.api.getFullAPI() + id, {"Content-Type" : "application/json"}, function(resp) {
            var result = {};
            if (!resp.error) {
                result.list = resp;
                var metadata = resp.result.content;
                var map = {};
                map.identifier = metadata.identifier;
                map.localData = metadata;
                map.mimeType = metadata.mimeType;
                map.isAvailable = true;
                map.path = "stories/" + metadata.code;
                resolve(map);
            } else {
                console.info("err : ", resp.error)
            }
        });
        });
    },
    launchContent:function(contentId){
        if("undefined" == typeof contentId){
            contentId = "do_20045479"
        }

        //Get new content data from GenieService
        var newContent = {};
        genieservice_html.getContent(contentId)
        .then(function(resp){
            newContent.metadata = resp;
            console.log("Launch new HTML content..");
            if (newContent && newContent.metadata.mimeType && newContent.metadata.mimeType == 'application/vnd.ekstep.html-archive') {
              // Launching new content 
              var basePath = (newContent.metadata.path.charAt(newContent.metadata.path.length-1) == '/')? newContent.metadata.path.substring(0, newContent.metadata.path.length-1): newContent.metadata.path;
              var path = "http://"+ location.host + "/" + basePath; 

              newContent.metadata.baseDir =  path;
              var contentUrl =  newContent.metadata.baseDir + '/index.html?eksCid='+ contentId;
              console.log("Opening through window.open");
              window.open(contentUrl, '_self');              
            }
        })
        .catch(function(err){
            console.log("Failed", err);
        })
    }

};
if ("undefined" == typeof cordova) {
    if("undefined" == typeof isbrowserpreview) {
        if("undefined" == typeof AppConfig){
            genieservice = genieservice_html;
            //genieservice.getLocalData();
            console.log("Local genieservice", genieservice);
        }
    }
    else{
        genieservice = genieservice_portal;
         console.log("Portal genieservice", genieservice);
    }
}

telemetry_web = {
    tList: [],
    send: function(string) {
        console.log(string);
        return new Promise(function(resolve, reject) {
            telemetry_web.tList.push(string);
            resolve(true);
        });
    }
};
if ("undefined" == typeof cordova) telemetry = telemetry_web;

function getTime(ms) {
    var v = void 0;
    if ("1.0" == TelemetryService._version) {
        var dte = new Date(ms);
        return dte.setTime(dte.getTime() + 60 * (dte.getTimezoneOffset() + 330) * 1e3), 
        v = dateFormat(dte, "yyyy-mm-dd'T'HH:MM:ss") + "+05:30";
    }
    return v = new Date().getTime();
}

function getCurrentTime() {
    return new Date().getTime();
}

var dateFormat = function() {
    var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g, timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g, timezoneClip = /[^-+\dA-Z]/g, pad = function(val, len) {
        for (val = String(val), len = len || 2; val.length < len; ) val = "0" + val;
        return val;
    };
    return function(date, mask, utc) {
        var dF = dateFormat;
        if (1 != arguments.length || "[object String]" != Object.prototype.toString.call(date) || /\d/.test(date) || (mask = date, 
        date = void 0), date = date ? new Date(date) : new Date(), isNaN(date)) throw SyntaxError("invalid date");
        mask = String(dF.masks[mask] || mask || dF.masks["default"]), "UTC:" == mask.slice(0, 4) && (mask = mask.slice(4), 
        utc = !0);
        var _ = utc ? "getUTC" : "get", d = date[_ + "Date"](), D = date[_ + "Day"](), m = date[_ + "Month"](), y = date[_ + "FullYear"](), H = date[_ + "Hours"](), M = date[_ + "Minutes"](), s = date[_ + "Seconds"](), L = date[_ + "Milliseconds"](), o = utc ? 0 : date.getTimezoneOffset(), flags = {
            d: d,
            dd: pad(d),
            ddd: dF.i18n.dayNames[D],
            dddd: dF.i18n.dayNames[D + 7],
            m: m + 1,
            mm: pad(m + 1),
            mmm: dF.i18n.monthNames[m],
            mmmm: dF.i18n.monthNames[m + 12],
            yy: String(y).slice(2),
            yyyy: y,
            h: H % 12 || 12,
            hh: pad(H % 12 || 12),
            H: H,
            HH: pad(H),
            M: M,
            MM: pad(M),
            s: s,
            ss: pad(s),
            l: pad(L, 3),
            L: pad(L > 99 ? Math.round(L / 10) : L),
            t: 12 > H ? "a" : "p",
            tt: 12 > H ? "am" : "pm",
            T: 12 > H ? "A" : "P",
            TT: 12 > H ? "AM" : "PM",
            Z: utc ? "UTC" : (String(date).match(timezone) || [ "" ]).pop().replace(timezoneClip, ""),
            o: (o > 0 ? "-" : "+") + pad(100 * Math.floor(Math.abs(o) / 60) + Math.abs(o) % 60, 4),
            S: [ "th", "st", "nd", "rd" ][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
        };
        return mask.replace(token, function($0) {
            return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
        });
    };
}();

dateFormat.masks = {
    "default": "ddd mmm dd yyyy HH:MM:ss",
    shortDate: "m/d/yy",
    mediumDate: "mmm d, yyyy",
    longDate: "mmmm d, yyyy",
    fullDate: "dddd, mmmm d, yyyy",
    shortTime: "h:MM TT",
    mediumTime: "h:MM:ss TT",
    longTime: "h:MM:ss TT Z",
    isoDate: "yyyy-mm-dd",
    isoTime: "HH:MM:ss",
    isoDateTime: "yyyy-mm-dd'T'HH:MM:ss",
    isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
}, dateFormat.i18n = {
    dayNames: [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ],
    monthNames: [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ]
}, Date.prototype.format = function(mask, utc) {
    return dateFormat(this, mask, utc);
}, function() {
    var initializing = !1, fnTest = /xyz/.test(function() {
        xyz;
    }) ? /\b_super\b/ : /.*/;
    this.Class = function() {}, Class.extend = function(prop) {
        function Class() {
            !initializing && this.init && this.init.apply(this, arguments);
        }
        var _super = this.prototype;
        initializing = !0;
        var prototype = new this();
        initializing = !1;
        for (var name in prop) prototype[name] = "function" == typeof prop[name] && "function" == typeof _super[name] && fnTest.test(prop[name]) ? function(name, fn) {
            return function() {
                var tmp = this._super;
                this._super = _super[name];
                var ret = fn.apply(this, arguments);
                return this._super = tmp, ret;
            };
        }(name, prop[name]) : prop[name];
        return Class.prototype = prototype, Class.prototype.constructor = Class, Class.extend = arguments.callee, 
        Class;
    };
}(), InActiveEvent = Class.extend({
    init: function() {},
    ext: function() {
        return this;
    },
    flush: function() {},
    __noSuchMethod__: function() {
        return console.log("TelemetryService is inActive"), this;
    }
}), TelemetryEvent = Class.extend({
    createdTime: void 0,
    _isStarted: !1,
    startTime: 0,
    name: void 0,
    event: void 0,
    init: function(eid, version, body, user, gdata) {
        "undefined" != gdata && "undefined" == gdata.ver && (gdata.ver = "1"), this.createdTime = getCurrentTime(), 
        this.name = eid, this.event = {
            ver: version,
            sid: user.uid,
            uid: user.uid,
            did: user.uid,
            edata: {
                eks: body || {}
            },
            eid: eid,
            gdata: gdata
        }, "1.0" == TelemetryService._version ? this.event.ts = getTime(this.createdTime) : this.event.ets = getTime(this.createdTime);
    },
    flush: function(apiName) {
        this.event && ("undefined" != typeof telemetry ? telemetry.send(JSON.stringify(this.event), apiName).then(function() {
            return JSON.stringify(this.event);
        })["catch"](function(err) {
            TelemetryService.logError(this.name, err);
        }) : console.log(JSON.stringify(this.event)));
    },
    ext: function(ext) {
        if (_.isObject(ext)) if (this.event.edata.ext) for (key in ext) this.event.edata.ext[key] = ext[key]; else this.event.edata.ext = ext;
        return this;
    },
    start: function() {
        return this._isStarted = !0, this.startTime = getCurrentTime(), this;
    },
    end: function() {
        if (this._isStarted) return this.event.edata.eks.length = Math.round((getCurrentTime() - this.startTime) / 1e3), 
        this.event.ets = new Date().getTime(), this._isStarted = !1, this;
        throw "can't end event without starting.";
    }
}), TelemetryService = {
    _version: "2.0",
    _baseDir: "EkStep Content App",
    isActive: !1,
    _config: void 0,
    instance: void 0,
    gameOutputFile: void 0,
    _gameErrorFile: void 0,
    _gameData: void 0,
    _data: [],
    _gameIds: [],
    _user: {},
    apis: {
        telemetry: "sendTelemetry",
        feedback: "sendFeedback"
    },
    mouseEventMapping: {
        click: "TOUCH",
        dblclick: "CHOOSE",
        mousedown: "DROP",
        pressup: "DRAG"
    },
    init: function(gameData, user) {
        return TelemetryService.instance ? void console.log("TelemetryService instance is not create") : new Promise(function(resolve, reject) {
            TelemetryService._user = user, TelemetryService.instance = "1.0" == TelemetryService._version ? new TelemetryV1Manager() : new TelemetryV2Manager(), 
            gameData ? (gameData.id && gameData.ver ? (TelemetryService._parentGameData = gameData, 
            TelemetryService._gameData = gameData) : reject("Invalid game data."), TelemetryServiceUtil.getConfig().then(function(config) {
                TelemetryService._config = config, TelemetryService._config.isActive && (TelemetryService.isActive = TelemetryService._config.isActive), 
                resolve(!0);
            })["catch"](function(err) {
                reject(err);
            })) : reject("Game data is empty."), resolve(!0);
        });
    },
    webInit: function(gameData, user) {
        return new Promise(function(resolve, reject) {
            TelemetryService.init(gameData, user).then(function() {
                TelemetryService.start(gameData.id, gameData.ver), resolve(!0);
            })["catch"](function(err) {
                reject(err);
            });
        });
    },
    changeVersion: function(version) {
        TelemetryService._version = version, TelemetryService.instance = "1.0" == TelemetryService._version ? new TelemetryV1Manager() : new TelemetryV2Manager(), 
        console.info("Telemetry Version updated to:", version);
    },
    getDataByField: function(field) {},
    getGameData: function() {
        return TelemetryService.isActive ? TelemetryService._gameData : void 0;
    },
    getInstance: function() {
        return TelemetryService.isActive ? TelemetryService.instance : void 0;
    },
    getMouseEventMapping: function() {
        return TelemetryService.mouseEventMapping;
    },
    getGameId: function() {
        return TelemetryService.isActive ? TelemetryService._gameData.id : void 0;
    },
    getGameVer: function() {
        return TelemetryService.isActive ? TelemetryService._gameData.ver : void 0;
    },
    exitWithError: function(error) {
        var message = "";
        error && (message += " Error: " + JSON.stringify(error)), TelemetryService.instance.exitApp();
    },
    flushEvent: function(event, apiName) {
        return console.log("TelemetryService flushEvent", event), TelemetryService._data.push(event), 
        event && event.flush(apiName), event;
    },
    start: function(id, ver) {
        return TelemetryService.isActive ? (ver = ver ? ver + "" : "1", _.findWhere(TelemetryService.instance._start, {
            id: id
        }) ? new InActiveEvent() : TelemetryService.flushEvent(TelemetryService.instance.start(id, ver), TelemetryService.apis.telemetry)) : (console.log("TelemetryService is not active."), 
        new InActiveEvent());
    },
    end: function() {
        return TelemetryService.isActive ? this.flushEvent(TelemetryService.instance.end(), TelemetryService.apis.telemetry) : new InActiveEvent();
    },
    interact: function(type, id, extype, data) {
        return TelemetryService.isActive ? TelemetryService.flushEvent(TelemetryService.instance.interact(type, id, extype, data), TelemetryService.apis.telemetry) : new InActiveEvent();
    },
    assess: function(qid, subj, qlevel, data) {
        return TelemetryService.isActive ? TelemetryService.instance.assess(qid, subj, qlevel, data) : new InActiveEvent();
    },
    assessEnd: function(event, data) {
        return TelemetryService.isActive ? TelemetryService.flushEvent(TelemetryService.instance.assessEnd(event, data), TelemetryService.apis.telemetry) : new InActiveEvent();
    },
    levelSet: function(eventData) {
        return TelemetryService.isActive ? new InActiveEvent() : void 0;
    },
    interrupt: function(type, id) {
        return TelemetryService.isActive ? TelemetryService.flushEvent(TelemetryService.instance.interrupt(type, id), TelemetryService.apis.telemetry) : new InActiveEvent();
    },
    exitApp: function() {
        setTimeout(function() {
            navigator.app.exitApp();
        }, 5e3);
    },
    navigate: function(stageid, stageto) {
        return TelemetryService.isActive ? "1.0" == TelemetryService._version ? "" : this.flushEvent(TelemetryService.instance.navigate(stageid, stageto), TelemetryService.apis.telemetry) : new InActiveEvent();
    },
    sendFeedback: function(eks) {
        return TelemetryService.isActive ? this.flushEvent(TelemetryService.instance.sendFeedback(eks), TelemetryService.apis.feedback) : new InActiveEvent();
    },
    itemResponse: function(data) {
        return TelemetryService.isActive ? TelemetryService.instance.itemResponse(data) : new InActiveEvent();
    },
    resume: function(newUserId, NewContentId, gameData, user) {
        var previousContentId = TelemetryService._gameData, previousUserId = TelemetryService._user.uid;
        (previousContentId != NewContentId || newUserId != previousUserId) && (TelemetryService.end(), 
        TelemetryService.init(TelemetryService._gameData, TelemetryService._user), TelemetryService.start());
    },
    exit: function() {
        if (TelemetryService.isActive) {
            if (TelemetryService._data = [], !_.isEmpty(TelemetryService.instance._end)) for (var len = TelemetryService.instance._end.length, i = 0; len > i; i++) TelemetryService.end();
            _.isEmpty(TelemetryService.instance._end) && (TelemetryService.isActive = !1);
        }
    },
    logError: function(eventName, error) {
        var data = {
            eventName: eventName,
            message: error,
            time: getCurrentTime()
        };
        console.log("TelemetryService Error:", JSON.stringify(data));
        var $body = angular.element(document.body), $rootScope = $body.scope().$root;
        $rootScope.$broadcast("show-message", {
            message: "Telemetry :" + JSON.stringify(data.message)
        });
    },
    print: function() {
        if (TelemetryService._data.length > 0) {
            var events = TelemetryService._data.cleanUndefined();
            events = _.pluck(events, "event"), console.log(JSON.stringify(events));
        } else console.log("No events to print.");
    }
}, Array.prototype.cleanUndefined = function() {
    for (var i = 0; i < this.length; i++) void 0 == this[i] && (this.splice(i, 1), i--);
    return this;
}, TelemetryServiceUtil = {
    _config: {
        isActive: !0,
        events: {
            OE_INTERACT: {
                eks: {
                    type: {
                        required: !0,
                        values: [ "TOUCH", "DRAG", "DROP", "SPEAK", "LISTEN", "END", "CHOOSE", "OTHER" ]
                    }
                }
            },
            OE_INTERRUPT: {
                eks: {
                    type: {
                        required: !0,
                        values: [ "BACKGROUND", "IDLE", "RESUME", "SLEEP", "CALL", "SWITCH", "LOCK", "OTHER" ]
                    }
                }
            }
        }
    },
    getConfig: function() {
        return new Promise(function(resolve, reject) {
            resolve(TelemetryServiceUtil._config);
        });
    }
}, TelemetryV1Manager = Class.extend({
    _end: void 0,
    init: function() {
        console.info("TelemetryService Version 1 initialized.. ");
    },
    exitWithError: function(error) {
        var message = "";
        error && (message += " Error: " + JSON.stringify(error)), this.exitApp();
    },
    createEvent: function(eventName, body) {
        return new TelemetryEvent(eventName, TelemetryService._version, body, TelemetryService._user, TelemetryService._gameData);
    },
    start: function(id, ver) {
        return TelemetryService._gameData = {
            id: id,
            ver: ver
        }, this._end = this.createEvent("OE_END", {}).start(), this.createEvent("OE_START", {});
    },
    end: function(gameId) {
        return this._end.end();
    },
    interact: function(type, id, extype, data) {
        var ext = {
            stageid: data.stageId,
            x: data.x,
            y: data.y,
            choice_id: data.choice_id,
            drag_id: data.drag_id,
            itemId: data.itemId
        }, eventStr = TelemetryService._config.events.OE_INTERACT;
        _.contains(eventStr.eks.type.values, type) || (ext.type = type, type = "OTHER"), 
        ("PAUSE" == data.subtype || "STOP" == data.subtype) && (type = data.subtype + "_LISTENING"), 
        "STOP_ALL" == data.subtype && (type = data.subtype + "_SOUNDS");
        var eks = {
            type: type ? type : "",
            id: id,
            extype: type,
            uri: ""
        };
        return this.createEvent("OE_INTERACT", eks).ext(ext);
    },
    assess: function(qid, subj, qlevel, data) {
        if (qid && subj && qlevel) {
            var eks = {
                qid: qid,
                subj: subj,
                qlevel: qlevel,
                mmc: [],
                mc: data.mc,
                maxscore: data.maxscore,
                params: []
            };
            return this.createEvent("OE_ASSESS", eks).start();
        }
        return console.error("qid, subject, qlevel is required to create assess event."), 
        new InActiveEvent();
    },
    assessEnd: function(eventObj, data) {
        return eventObj ? (eventObj._isStarted || (eventObj._isStarted = !0), eventObj.event.edata.eks.score = data.score || 0, 
        eventObj.event.edata.eks.pass = data.pass ? "Yes" : "No", eventObj.event.edata.eks.res = data.res || [], 
        eventObj.event.edata.eks.uri = data.uri || "", eventObj.event.edata.eks.qindex = data.qindex || 0, 
        eventObj.end(), eventObj) : void 0;
    },
    interrupt: function(type, id) {
        var eventStr = TelemetryService._config.events.OE_INTERRUPT, eks = {
            type: type,
            id: id || ""
        }, ext = {};
        return _.contains(eventStr.eks.type.values, type) || (ext.type = type, type = "OTHER"), 
        this.createEvent("OE_INTERRUPT", eks).ext(ext);
    },
    exitApp: function() {
        setTimeout(function() {
            navigator.app.exitApp();
        }, 5e3);
    }
}), TelemetryV2Manager = Class.extend({
    _end: new Array(),
    _start: new Array(),
    init: function() {
        console.info("TelemetryService Version 2 initialized..");
    },
    exitWithError: function(error) {
        var message = "";
        error && (message += " Error: " + JSON.stringify(error)), TelemetryServiceV2.exitApp();
    },
    createEvent: function(eventName, body) {
        return new TelemetryEvent(eventName, TelemetryService._version, body, TelemetryService._user, TelemetryService._gameData);
    },
    start: function(id, ver) {
        return TelemetryService._gameData = {
            id: id,
            ver: ver
        }, this._end.push(this.createEvent("OE_END", {}).start()), this._start.push({
            id: id,
            ver: ver
        }), this.createEvent("OE_START", {});
    },
    end: function(gameId) {
        return this._start.pop(), this._end.pop().end();
    },
    interact: function(type, id, extype, eks) {
        if (eks.optionTag && TelemetryService.flushEvent(this.itemResponse(eks), TelemetryService.apis.telemetry), 
        "DRAG" != type) {
            var eks = {
                stageid: eks.stageId ? eks.stageId : "",
                type: type,
                subtype: eks.subtype ? eks.subtype : "",
                pos: eks.pos ? eks.pos : [],
                id: id,
                tid: eks.tid ? eks.tid : "",
                uri: eks.uri ? eks.uri : "",
                extype: "",
                values: []
            };
            return this.createEvent("OE_INTERACT", eks);
        }
    },
    assess: function(qid, subj, qlevel, data) {
        if (subj = subj ? subj : "", qlevel = qlevel ? qlevel : "MEDIUM", qid) {
            var eks = {
                qid: qid,
                params: []
            };
            return this.createEvent("OE_ASSESS", eks).start();
        }
        return console.error("qid is required to create assess event.", qid), new InActiveEvent();
    },
    assessEnd: function(eventObj, data) {
        return eventObj ? (eventObj._isStarted || (eventObj._isStarted = !0), eventObj.event.edata.eks.score = data.score || 0, 
        eventObj.event.edata.eks.pass = data.pass ? "Yes" : "No", eventObj.event.edata.eks.resvalues = _.isEmpty(data.res) ? [] : data.res, 
        eventObj.event.edata.eks.uri = data.uri || "", eventObj.event.edata.eks.qindex = data.qindex || 0, 
        eventObj.event.edata.eks.exlength = 0, _.isArray(eventObj.event.edata.eks.resvalues) ? eventObj.event.edata.eks.resvalues = _.map(eventObj.event.edata.eks.resvalues, function(val) {
            return val = _.isObject(val) ? val : {
                "0": val
            };
        }) : eventObj.event.edata.eks.resvalues = [], eventObj.end(), eventObj) : void 0;
    },
    interrupt: function(type, id) {
        var eks = (TelemetryService._config.events.OE_INTERRUPT, {
            type: type,
            stageid: id || ""
        });
        return this.createEvent("OE_INTERRUPT", eks);
    },
    exitApp: function() {
        setTimeout(function() {
            navigator.app.exitApp();
        }, 5e3);
    },
    navigate: function(stageid, stageto) {
        if (void 0 != stageto && void 0 != stageid && stageto != stageid) {
            var eks = {
                stageid: stageid ? stageid : "",
                stageto: stageto ? stageto : "",
                type: "",
                itype: ""
            };
            return this.createEvent("OE_NAVIGATE", eks);
        }
    },
    itemResponse: function(data) {
        var type = "MCQ" == data.optionTag ? "CHOOSE" : "MATCH", eks = {
            qid: data.itemId ? data.itemId : "",
            type: type ? type : "",
            state: data.state ? data.state : "",
            resvalues: _.isEmpty(data.res) ? [] : data.res
        };
        return this.createEvent("OE_ITEM_RESPONSE", eks);
    },
    sendFeedback: function(eks) {
        return this.createEvent("", eks);
    }
});

var genieServiceBridge = (function(){
  var _callbackFunc;
  function initialize(){

    var isMobile = (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase()));

    if(!isMobile){
      if(("undefined" == typeof AppConfig) && ("undefined" == typeof isbrowserpreview)){
        genieservice.getLocalData(function(){
          _callbackFunc();
        });    
      }    
    }else{
      loadCordova();                
    }
  };

  /* Load Cordova file for mobile only */
  function loadCordova(){
    loadJsFile("///android_asset/www/cordova.js", function(){
      document.addEventListener("deviceready", onDeviceReady, false); 
    });
  }

  /* Load js file */
  function loadJsFile(src, callbackFunc) {
    var fileref = document.createElement('script');
    fileref.setAttribute("type","text/javascript");
    fileref.setAttribute("src", src);
    fileref.onload = function(){
      callbackFunc();
    }
    document.getElementsByTagName("head")[0].appendChild(fileref);
  }

  /* Cordova plugins can access only on device ready state */
  function onDeviceReady(event){
    console.log("onDeviceReady()", event);  
    
    _callbackFunc();
  };

  return{
    init: function(callback){
      _callbackFunc = callback;
      initialize();
    }
  }
})();

