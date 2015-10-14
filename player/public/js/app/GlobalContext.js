GlobalContext = {
    user: {},
    game: {
        id: "",
        ver: ""
    },
    config: {
        origin: "",
        contentId: ""
    },
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
                Promise.all(promises)
                .then(function(result) {
                    resolve(GlobalContext.config);
                });
            } else {
                GlobalContext.config = { origin: "Genie", contentId: ""};
                resolve(GlobalContext.config);
            }
        })
        .then(function(config) {
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
                    // TODO: remove after getting new genie.
                    // if(param == "contentId") {
                    //     contextObj[param] = "org.ekstep.num.addition.by.grouping";   
                    // }
                    resolve(true);
                }
            );
        });
    }

};