function getTime(a) {
    var b = void 0;
    return "1.0" == TelemetryService._version ? (b = dateFormat(new Date(a), "yyyy-mm-dd'T'HH:MM:ssZ").replace("GMT", ""), 
    b.insert(-2, ":")) : b = Date.now();
}

var dateFormat = function() {
    var a = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g, b = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g, c = /[^-+\dA-Z]/g, d = function(a, b) {
        for (a = String(a), b = b || 2; a.length < b; ) a = "0" + a;
        return a;
    };
    return function(e, f, g) {
        var h = dateFormat;
        if (1 != arguments.length || "[object String]" != Object.prototype.toString.call(e) || /\d/.test(e) || (f = e, 
        e = void 0), e = e ? new Date(e) : new Date(), isNaN(e)) throw SyntaxError("invalid date");
        f = String(h.masks[f] || f || h.masks["default"]), "UTC:" == f.slice(0, 4) && (f = f.slice(4), 
        g = !0);
        var i = g ? "getUTC" : "get", j = e[i + "Date"](), k = e[i + "Day"](), l = e[i + "Month"](), m = e[i + "FullYear"](), n = e[i + "Hours"](), o = e[i + "Minutes"](), p = e[i + "Seconds"](), q = e[i + "Milliseconds"](), r = g ? 0 : e.getTimezoneOffset(), s = {
            d: j,
            dd: d(j),
            ddd: h.i18n.dayNames[k],
            dddd: h.i18n.dayNames[k + 7],
            m: l + 1,
            mm: d(l + 1),
            mmm: h.i18n.monthNames[l],
            mmmm: h.i18n.monthNames[l + 12],
            yy: String(m).slice(2),
            yyyy: m,
            h: n % 12 || 12,
            hh: d(n % 12 || 12),
            H: n,
            HH: d(n),
            M: o,
            MM: d(o),
            s: p,
            ss: d(p),
            l: d(q, 3),
            L: d(q > 99 ? Math.round(q / 10) : q),
            t: 12 > n ? "a" : "p",
            tt: 12 > n ? "am" : "pm",
            T: 12 > n ? "A" : "P",
            TT: 12 > n ? "AM" : "PM",
            Z: g ? "UTC" : (String(e).match(b) || [ "" ]).pop().replace(c, ""),
            o: (r > 0 ? "-" : "+") + d(100 * Math.floor(Math.abs(r) / 60) + Math.abs(r) % 60, 4),
            S: [ "th", "st", "nd", "rd" ][j % 10 > 3 ? 0 : (j % 100 - j % 10 != 10) * j % 10]
        };
        return f.replace(a, function(a) {
            return a in s ? s[a] : a.slice(1, a.length - 1);
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
}, Date.prototype.format = function(a, b) {
    return dateFormat(this, a, b);
}, function() {
    var a = !1, b = /xyz/.test(function() {
        xyz;
    }) ? /\b_super\b/ : /.*/;
    this.Class = function() {}, Class.extend = function(c) {
        function d() {
            !a && this.init && this.init.apply(this, arguments);
        }
        var e = this.prototype;
        a = !0;
        var f = new this();
        a = !1;
        for (var g in c) f[g] = "function" == typeof c[g] && "function" == typeof e[g] && b.test(c[g]) ? function(a, b) {
            return function() {
                var c = this._super;
                this._super = e[a];
                var d = b.apply(this, arguments);
                return this._super = c, d;
            };
        }(g, c[g]) : c[g];
        return d.prototype = f, d.prototype.constructor = d, d.extend = arguments.callee, 
        d;
    };
}(), FilewriterService = Class.extend({
    init: function() {
        this.initWriter();
    },
    initWriter: function() {
        throw "Subclasses of FilewriterService should implement this function";
    },
    createBaseDirectory: function(a, b) {
        throw "Subclasses of FilewriterService should implement this function";
    },
    createFile: function(a, b, c) {
        throw "Subclasses of FilewriterService should implement this function";
    },
    write: function(a, b, c, d) {
        throw "Subclasses of FilewriterService should implement this function";
    },
    length: function(a) {
        throw "Subclasses of FilewriterService should implement this function";
    },
    getData: function(a) {
        throw "Subclasses of FilewriterService should implement this function";
    }
}), InActiveEvent = Class.extend({
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
    init: function(a, b, c, d, e) {
        this.createdTime = Date.now(), this.name = a, this.event = {
            ets: getTime(this.createdTime),
            ver: b,
            sid: d.uid,
            uid: d.uid,
            did: d.uid,
            edata: {
                eks: c || {}
            },
            eid: a,
            gdata: e
        };
    },
    flush: function() {
        this.event && (telemetry ? telemetry.send(JSON.stringify(this.event)).then(function() {
            return JSON.stringify(this.event);
        })["catch"](function(a) {
            TelemetryService.logError(this.name, a);
        }) : console.log(JSON.stringify(this.event)));
    },
    ext: function(a) {
        if (_.isObject(a)) if (this.event.edata.ext) for (key in a) this.event.edata.ext[key] = a[key]; else this.event.edata.ext = a;
        return this;
    },
    start: function() {
        return this._isStarted = !0, this.startTime = Date.now(), this;
    },
    end: function() {
        if (this._isStarted) return this.event.edata.eks.length = Math.round((Date.now() - this.event.ets) / 1e3), 
        this.event.ets = Date.now(), this;
        throw "can't end event without starting.";
    }
}), TelemetryService = {
    _version: "1.0",
    _baseDir: "EkStep Content App",
    isActive: !1,
    _config: void 0,
    instance: void 0,
    gameOutputFile: void 0,
    _gameErrorFile: void 0,
    _gameData: void 0,
    _data: [],
    _user: {},
    mouseEventMapping: {
        click: "TOUCH",
        dblclick: "CHOOSE",
        mousedown: "DROP",
        pressup: "DRAG"
    },
    init: function(a, b) {
        return TelemetryService.instance ? void 0 : new Promise(function(c, d) {
            TelemetryService._user = b, TelemetryService.instance = "1.0" == TelemetryService._version ? new TelemetryV1Manager() : new TelemetryV2Manager(), 
            a ? (a.id && a.ver ? (TelemetryService._parentGameData = a, TelemetryService._gameData = a) : d("Invalid game data."), 
            TelemetryServiceUtil.getConfig().then(function(a) {
                TelemetryService._config = a, TelemetryService._config.isActive && (TelemetryService.isActive = TelemetryService._config.isActive), 
                c(!0);
            })["catch"](function(a) {
                d(a);
            })) : d("Game data is empty."), c(!0);
        });
    },
    getDataByField: function(a) {},
    getGameData: function() {
        return TelemetryService._gameData;
    },
    getInstance: function() {
        return TelemetryService.instance;
    },
    getMouseEventMapping: function() {
        return TelemetryService.mouseEventMapping;
    },
    getGameId: function() {
        return TelemetryService._gameData.id;
    },
    getGameVer: function() {
        return TelemetryService._gameData.ver;
    },
    exitWithError: function(a) {
        var b = "";
        a && (b += " Error: " + JSON.stringify(a)), TelemetryService.instance.exitApp();
    },
    flushEvent: function(a) {
        return TelemetryService._data.push(a), a && a.flush(), a;
    },
    start: function(a, b) {
        return TelemetryService.isActive ? TelemetryService.flushEvent(TelemetryService.instance.start(a, b)) : new InActiveEvent();
    },
    end: function() {
        return TelemetryService.isActive ? this.flushEvent(TelemetryService.instance.end()) : new InActiveEvent();
    },
    interact: function(a, b, c, d) {
        return TelemetryService.isActive ? TelemetryService.flushEvent(TelemetryService.instance.interact(a, b, c, d)) : new InActiveEvent();
    },
    assess: function(a, b, c, d) {
        return TelemetryService.isActive ? TelemetryService.instance.assess(a, b, c, d) : new InActiveEvent();
    },
    assessEnd: function(a, b) {
        return TelemetryService.isActive ? TelemetryService.instance.assessEnd(a, b) : new InActiveEvent();
    },
    levelSet: function(a) {
        if (TelemetryService.isActive) {
            return new InActiveEvent();
        }
    },
    interrupt: function(a, b) {
        return TelemetryService.isActive ? TelemetryService.instance.interrupt(a, b) : new InActiveEvent();
    },
    logError: function(a, b) {
        var c = {
            eventName: a,
            message: b,
            time: Date().now()
        };
        console.log("TelemetryService Error:", JSON.stringify(c));
    },
    exitApp: function() {
        setTimeout(function() {
            navigator.app.exitApp();
        }, 5e3);
    },
    navigate: function(a, b) {
        return TelemetryService.isActive ? "1.0" == TelemetryService._version ? "" : this.flushEvent(TelemetryService.instance.navigate(a, b)) : new InActiveEvent();
    },
    itemResponse: function(a) {
        return TelemetryService.isActive ? TelemetryService.instance.itemResponse(a) : new InActiveEvent();
    },
    resume: function(a, b, c, d) {
        var e = TelemetryService._gameData, f = TelemetryService._user.uid;
        (e != b || a != f) && (TelemetryService.end(), TelemetryService.init(TelemetryService._gameData, TelemetryService._user), 
        TelemetryService.start());
    },
    exit: function(a, b) {
        TelemetryService._data = [], TelemetryService.instance._gameData && TelemetryService.end(a, b);
    }
}, TelemetryServiceUtil = {
    _config: void 0,
    getConfig: function() {
        return new Promise(function(a, b) {
            TelemetryServiceUtil._config ? a(TelemetryServiceUtil._config) : $.getJSON("json/telemetryConfig.json", {}, function(c) {
                c ? ("string" == typeof c ? TelemetryServiceUtil._config = JSON.parse(c) : TelemetryServiceUtil._config = c, 
                a(TelemetryServiceUtil._config)) : b(null);
            }).error(function(a) {
                console.log("Error:", a), b(a);
            });
        });
    }
}, String.prototype.insert = function(a, b) {
    var c = 0 > a ? this.length + a : a;
    return this.substring(0, c) + b + this.substring(c, this.length);
}, TelemetryV1Manager = Class.extend({
    _end: void 0,
    init: function() {
        console.info("TelemetryService Version 1 initialized.. ");
    },
    exitWithError: function(a) {
        var b = "";
        a && (b += " Error: " + JSON.stringify(a)), this.exitApp();
    },
    createEvent: function(a, b) {
        return new TelemetryEvent(a, TelemetryService._version, b, TelemetryService._user, TelemetryService._gameData);
    },
    start: function(a, b) {
        return TelemetryService._gameData = {
            id: a,
            ver: b
        }, this._end = this.createEvent("OE_END", {}).start(), this.createEvent("OE_START", {});
    },
    end: function(a) {
        return console.log("genieservice_web.tList : " + genieservice_web.tList), this._end.end();
    },
    interact: function(a, b, c, d) {
        var e = {
            stageid: d.stageId,
            x: d.x,
            y: d.y,
            choice_id: d.choice_id,
            drag_id: d.drag_id,
            itemId: d.itemId
        }, f = TelemetryService._config.events.OE_INTERACT;
        _.contains(f.eks.type.values, a) || (e.type = a, a = "OTHER");
        var g = {
            type: a ? a : "",
            id: b,
            extype: c,
            uri: ""
        };
        return this.createEvent("OE_INTERACT", g).ext(e);
    },
    assess: function(a, b, c, d) {
        if (a && b && c) {
            var e = {
                qid: a,
                subj: b,
                qlevel: c,
                mmc: [],
                mc: d.mc,
                maxscore: d.maxscore,
                params: []
            };
            return this.createEvent("OE_ASSESS", e);
        }
        return console.error("qid, subject, qlevel is required to create assess event."), 
        new InActiveEvent();
    },
    assessEnd: function(a, b) {
        return a && a._isStarted ? (a.event.edata.eks.score = b.score || 0, a.event.edata.eks.pass = b.pass ? "Yes" : "No", 
        a.event.edata.eks.res = b.res || [], a.event.edata.eks.uri = b.uri || "", a.end(), 
        a.flush(), a) : void 0;
    },
    levelSet: function(a) {
        if (TelemetryService.isActive) {
            return new InActiveEvent();
        }
    },
    interrupt: function(a, b) {
        var c = TelemetryService._config.events.OE_INTERRUPT;
        return _.contains(c.eks.type.values, a) || (edata.ext.type = a, a = "OTHER"), edata.eks = {
            type: a,
            id: b || ""
        }, this.createEvent("OE_INTERRUPT", eks);
    },
    logError: function(a, b) {
        var c = {
            eventName: a,
            message: b,
            time: Date.now()
        };
        console.log("TelemetryServiceV1 Error:", JSON.stringify(c));
    },
    exitApp: function() {
        setTimeout(function() {
            navigator.app.exitApp();
        }, 5e3);
    }
}), TelemetryV2Manager = Class.extend({
    _end: void 0,
    init: function() {
        console.info("TelemetryService Version 2 initialized..");
    },
    exitWithError: function(a) {
        var b = "";
        a && (b += " Error: " + JSON.stringify(a)), TelemetryServiceV2.exitApp();
    },
    createEvent: function(a, b) {
        return new TelemetryEvent(a, TelemetryService._version, b, TelemetryService._user, TelemetryService._gameData);
    },
    start: function(a, b) {
        return TelemetryService._gameData = {
            id: a,
            ver: b
        }, this._end = this.createEvent("OE_END", {}).start(), this.createEvent("OE_START", {});
    },
    end: function(a) {
        return console.log("genieservice_web.tList : " + genieservice_web.tList), this._end.end();
    },
    interact: function(a, b, c, d) {
        if (d.optionTag) {
            console.log("inside interact option tag....");
            var e = this.itemResponse(d);
            e.flush();
        }
        if ("DRAG" != a) {
            var d = {
                stageid: d.stageId ? d.stageId : "",
                type: a,
                subtype: d.subtype ? d.subtype : "",
                pos: d.pos ? d.pos : [],
                id: b,
                tid: d.tid ? d.tid : "",
                uri: d.uri ? d.uri : ""
            };
            return this.createEvent("OE_INTERACT", d);
        }
        return new InActiveEvent();
    },
    assess: function(a, b, c, d) {
        if (a && b && c) {
            var e = {
                qid: a,
                params: []
            };
            return this.createEvent("OE_ASSESS", e);
        }
        return console.error("qid, subject, qlevel is required to create assess event.", a, b, c), 
        new InActiveEvent();
    },
    assessEnd: function(a, b) {
        return a && a._isStarted ? (a.event.edata.eks.score = b.score || 0, a.event.edata.eks.pass = b.pass ? "Yes" : "No", 
        a.event.edata.eks.res = b.res || [], a.event.edata.eks.uri = b.uri || "", a.end(), 
        a.flush(), a) : void 0;
    },
    interrupt: function(a, b) {
        var c = TelemetryService.manager._config.events[name], d = {
            type: a,
            stageid: b || ""
        };
        return _.contains(c.eks.type.values, a) || (edata.eks.type = a, a = "OTHER"), this.createEvent("OE_INTERRUPT", d);
    },
    logError: function(a, b) {
        var c = {
            eventName: a,
            message: b,
            time: toGenieDateTime(new Date().getTime())
        };
        console.log("TelemetryServiceV2 Error:", JSON.stringify(c));
        var d = angular.element(document.body), e = d.scope().$root;
        e.$broadcast("show-message", {
            message: "Telemetry :" + JSON.stringify(c.message.errors)
        });
    },
    exitApp: function() {
        setTimeout(function() {
            navigator.app.exitApp();
        }, 5e3);
    },
    navigate: function(a, b) {
        if (void 0 != b && void 0 != a && b != a) {
            var c = {
                stageid: a ? a : "",
                stageto: b ? b : ""
            };
            return this.createEvent("OE_NAVIGATE", c);
        }
    },
    itemResponse: function(a) {
        var b = "MCQ" == a.optionTag ? "CHOOSE" : "MATCH", c = {
            qid: a.itemId ? a.itemId : "",
            type: b ? b : "",
            state: a.state ? a.state : "",
            res: a.res ? a.res : []
        };
        return this.createEvent("OE_ITEM_RESPONSE", c);
    },
    levelSet: function(a) {
        return new InActiveEvent();
    }
});