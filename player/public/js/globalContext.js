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
                for (var i = 0; i < AppConfig.configFields.length; i++) {
                    promises.push(GlobalContext._getIntentExtra(AppConfig.configFields[i], GlobalContext.config));
                }
                console.log("GlobalContext.configFields: ", GlobalContext.config);
                Promise.all(promises).then(function(result) {
                    setGlobalConfig(GlobalContext.config);
                    org.ekstep.service.renderer.initializeSdk(GlobalContext.config.appQualifier || 'org.ekstep.genieservices');
                    if (GlobalContext.config.appInfo && _.isString(GlobalContext.config.appInfo)) {
                        GlobalContext.config.appInfo = JSON.parse(GlobalContext.config.appInfo);
                        GlobalContext.game.id = GlobalContext.config.appInfo.identifier;
                        GlobalContext.game.ver = GlobalContext.config.appInfo.pkgVersion || "1";
                        GlobalContext.game.contentExtras = GlobalContext.config.contentExtras;

                        GlobalContext._params.sid = GlobalContext.config.sid;
                        GlobalContext._params.uid = GlobalContext.config.uid;
                        GlobalContext._params.did = GlobalContext.config.did;
                        GlobalContext._params.channel = GlobalContext.config.channel;
                        GlobalContext._params.etags = GlobalContext.config.etags;
                        GlobalContext._params.pdata = GlobalContext.config.pdata;
                        GlobalContext._params.cdata = GlobalContext.config.cdata;

                        // GlobalContext.config.contentExtras.switchingUser = true;`
                        // Assuming filter is always an array of strings.
                        GlobalContext.filter = (GlobalContext.config.appInfo.filter)
                            ? JSON.parse(GlobalContext.config.appInfo.filter)
                            : GlobalContext.config.appInfo.filter;
                    }
                }).then(function() {
                    if (GlobalContext.config.appInfo && COLLECTION_MIMETYPE == GlobalContext.config.appInfo.mimeType && null == GlobalContext.filter) {
                        org.ekstep.service.renderer.getContent(GlobalContext.config.appInfo.identifier).then(function(result) {
                            if (result.isAvailable) {
                                GlobalContext.config.appInfo = result.localData || result.serverData;
                                resolve(GlobalContext.config);
                            } else {
                                reject('CONTENT_NOT_FOUND');
                            }
                        }).catch(function(err) {
                            console.error(err);
                            reject('CONTENT_NOT_FOUND');
                        });
                    } else {
                        resolve(GlobalContext.config);
                    }
                });
            } else {
                setGlobalConfig();
                GlobalContext.config = {
                    overlay: AppConfig.overlay,
                    origin: "Genie",
                    showEndPage: AppConfig.showEndPage,
                    contentId: "org.ekstep.num.addition.by.grouping",
                    appInfo: {
                        code: "org.ekstep.quiz.app",
                        mimeType: "application/vnd.android.package-archive",
                        identifier: "org.ekstep.quiz.app"
                    }
                };
                resolve(GlobalContext.config);
            }
        }).then(function(config) {
            // GlobalContext.config = config = { origin: "Genie", contentId: "org.ekstep.num.addition.by.grouping"};
            console.log("Origin value is:::", config);
            if (config && config.origin == 'Genie') {
                return org.ekstep.service.renderer.getCurrentUser();
            } else {
                reject('INVALID_ORIGIN');
            }
        }).then(function(result) {
            console.log(result);
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
                console.log(param + ' intent value: ' + url);
                if (url) {
                    contextObj[param] = url;
                }
                resolve(true);
            }, function() {
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
