GlobalContext = {
    user: {},
    game: {
        id: "",
        ver: ""
    },
    _params: {},
    config: {
        origin: "",
        contentId: "",
        flavor: "",
        appInfo: undefined
    }, 
    registerEval:[],
    filter: undefined,
    init: function(gid, ver) {
        return new Promise(function(resolve, reject) {
            GlobalContext.game.id = gid;
            GlobalContext.game.ver = ver;
            GlobalContext._setGlobalContext(resolve, reject);
        });
    },
    _setGlobalContext: function(resolve, reject) {
        new Promise(function(resolve, reject) {
            if (window.plugins && window.plugins.webintent) {
                var promises = [];
                var configuration = {};
                // for (var i = 0; i < AppConfig.configFields.length; i++) {
                promises.push(GlobalContext._getIntentExtra('playerConfig', configuration));
                // }
                Promise.all(promises).then(function(result) {
                    _.extend(configuration.playerConfig, configuration.playerConfig.context);  // TelemetryEvent is using globalConfig.context.sid/did
                    _.extend(configuration.playerConfig, configuration.playerConfig.config);
                    (typeof configuration.playerConfig.metadata == "string") ? configuration.playerConfig.metadata = JSON.parse(configuration.playerConfig.metadata): "";
                    setGlobalConfig(configuration.playerConfig);
                    var globalConfig = EkstepRendererAPI.getGlobalConfig();
                    org.ekstep.service.renderer.initializeSdk(globalConfig.appQualifier || 'org.ekstep.genieservices');
                    if (globalConfig.metadata) {
                        GlobalContext.game.id = globalConfig.metadata.identifier;
                        GlobalContext.game.ver = globalConfig.metadata.pkgVersion || "1";
                        // GlobalContext.game.contentExtras = GlobalContext.config.contentExtras;
                        for (var i = 0; i < AppConfig.telemetryEventsConfigFields.length; i++) {
                            GlobalContext._params[AppConfig.telemetryEventsConfigFields[i]] = globalConfig.config[AppConfig.telemetryEventsConfigFields[i]];
                        }
                        // GlobalContext.config.contentExtras.switchingUser = true;`
                        // Assuming filter is always an array of strings.
                        GlobalContext.filter = (globalConfig.metadata.filter)
                            ? JSON.parse(globalConfig.metadata.filter)
                            : globalConfig.metadata.filter;
                    }
                    resolve(globalConfig);
                })
            } else {
                // TODO: Only for the local
                if (!isbrowserpreview) {
                    GlobalContext.config = {
                        origin: "Genie",
                        contentId: "org.ekstep.num.addition.by.grouping",
                        appInfo: {
                            code: "org.ekstep.contentplayer",
                            mimeType: "application/vnd.android.package-archive",
                            identifier: "org.ekstep.contentplayer"
                        }
                    };
                    window.globalConfig = mergeJSON(AppConfig, GlobalContext.config);
                    GlobalContext.config = window.globalConfig;
                    setTelemetryEventFields(window.globalConfig);
                    resolve(GlobalContext.config);
                }
            }
        }).then(function(config) {
            if (config.origin == 'Genie') {
                return org.ekstep.service.renderer.getCurrentUser();
            } else {
                reject('INVALID_ORIGIN');
            }
        }).then(function(result) {
            // GlobalContext.user = result;
            // if (result && result.status == 'success') {
            if (result.uid) {
                GlobalContext.user = result;
                GlobalContext._params.user = GlobalContext.user;
                resolve(true);
            } else {
                reject('INVALID_USER');
            }
            // } else {
            //     reject('INVALID_USER');
            // }
        }).catch(function(err) {
            reject(err);
        });
    },
    _getIntentExtra: function(param, contextObj) {
        return new Promise(function(resolve, reject) {
            window.plugins.webintent.getExtra(param, function(url) {
                if (url) {
                    try {
                        contextObj[param] = JSON.parse(url);
                    } catch(e) {
                        contextObj[param] = url;
                    }
                }
                resolve(true);
            }, function(e) {
                console.log('intent value not set for: ' + param);
                resolve(true);
            });
        });
    },
    setParam: function(param, value, incr, max) {
        if (param != 'user') {
            var fval = GlobalContext._params[param];
            if (incr) {
                if (!fval)
                    fval = 0;
                fval = (fval + incr);
            } else {
                fval = value
            }
            if (0 > fval)
                fval = 0;
            if ("undefined" != typeof max && fval >= max)
                fval = 0;
            GlobalContext._params[param] = fval;
        } else {
            console.error('user param can not set');
        }
    },
    getParam: function(param) {
        return GlobalContext._params[param];
    }
};
