GlobalContext = {
    user: {},
    game: {
        id: "",
        ver: ""
    },
    config: {
        origin: "",
        contentId: "",
        flavor: "",
        appInfo: undefined
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
                promises.push(GlobalContext._getIntentExtra('appInfo', GlobalContext.config));
                Promise.all(promises)
                .then(function(result) {
                    // TODO: need to remove the hard coded GlobalContext.config.appInfo.
                    // GlobalContext.config.appInfo = "{\"name\": \"Addition by Grouping\", \"identifier\": \"org.ekstep.num.addition.by.grouping\", \"description\": \"Akshara numeracy worksheet for Grade4 and Grade5 children\", \"launchUrl\": \"org.ekstep.num.addition.by.grouping\", \"downloadUrl\": \"https://ekstep-public.s3-ap-southeast-1.amazonaws.com/content/haircut_story_1443694487449.zip\", \"pkgVersion\": 2, \"activity_class\": \".MainActivity\", \"code\": \"org.ekstep.num.addition.by.grouping\", \"osId\": \"org.ekstep.num.addition.by.grouping\", \"communication_scheme\": \"INTENT\"}";
                    if (GlobalContext.config.appInfo && _.isString(GlobalContext.config.appInfo)) {
                        GlobalContext.config.appInfo = JSON.parse(GlobalContext.config.appInfo);
                    }
                    resolve(GlobalContext.config);
                });
            } else {
                GlobalContext.config = { origin: "Genie", contentId: "org.ekstep.num.addition.by.grouping", appInfo: {"code":"org.ekstep.quiz.app"}};
                // GlobalContext.config.appInfo = "{\"name\": \"Addition by Grouping\", \"identifier\": \"org.ekstep.num.addition.by.grouping\", \"description\": \"Akshara numeracy worksheet for Grade4 and Grade5 children\", \"launchUrl\": \"org.ekstep.num.addition.by.grouping\", \"downloadUrl\": \"https://ekstep-public.s3-ap-southeast-1.amazonaws.com/content/haircut_story_1443694487449.zip\", \"pkgVersion\": 2, \"activity_class\": \".MainActivity\", \"code\": \"org.ekstep.num.addition.by.grouping\", \"osId\": \"org.ekstep.num.addition.by.grouping\", \"communication_scheme\": \"INTENT\", \"baseDir\": \"stories/haircut_story\"}";
                // if (GlobalContext.config.appInfo && _.isString(GlobalContext.config.appInfo)) {
                //     GlobalContext.config.appInfo = JSON.parse(GlobalContext.config.appInfo);
                // }
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
    }
};