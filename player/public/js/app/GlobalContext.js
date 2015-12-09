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
            if(window.plugins && window.plugins.webintent) {
                var promises = [];
                promises.push(GlobalContext._getIntentExtra('origin', GlobalContext.config));
                promises.push(GlobalContext._getIntentExtra('contentId', GlobalContext.config));
                promises.push(GlobalContext._getIntentExtra('appInfo', GlobalContext.config));
                Promise.all(promises)
                .then(function(result) {
                    if (GlobalContext.config.appInfo && _.isString(GlobalContext.config.appInfo)) {
                        GlobalContext.config.appInfo = JSON.parse(GlobalContext.config.appInfo);
                        GlobalContext.filter = GlobalContext.config.appInfo.filter;
                    }
                    resolve(GlobalContext.config);
                });
            } else {
                GlobalContext.config = { origin: "Genie", contentId: "org.ekstep.num.addition.by.grouping", appInfo: {"code":"org.ekstep.quiz.app"}};
                resolve(GlobalContext.config);
            }
        })
        .then(function(config) {
            // GlobalContext.config = config = { origin: "Genie", contentId: "org.ekstep.num.addition.by.grouping"};
            console.log("Origin value is:::", config);
            if(config && config.origin == 'Genie') {
                return GenieService.getCurrentUser();
            } else {
                reject(false);
            }
        })
        .then(function(result) {
            if (result && result.status == 'success') {
                if (result.data.uid) {
                    GlobalContext.user = result.data;
                    GlobalContext._params.user = GlobalContext.user;
                    resolve(true);
                } else {
                    reject(false);
                }
            } else {
                reject(false);
            }
        });
    },
    _getIntentExtra: function(param, contextObj) {
        return new Promise(function(resolve, reject) {
            window.plugins.webintent.getExtra(param,
                function(url) {
                    console.log(param + ' intent value: ' + url);
                    if (url) {
                        contextObj[param] = url;
                    }
                    resolve(true);
                }, function() {
                    console.log('intent value not set for: ' + param);
                    resolve(true);
                }
            );
        });
    },
    setParam: function(param, value) {
        if(param != 'user') {
            GlobalContext._params[param] = value;
        } else {
            console.error('user param can not set');
        }
    },
    getParam: function(param) {
        return GlobalContext._params[param];
    }
};