org.ekstep.service.extcontent = new (org.ekstep.service.mainService.extend({
    init: function () {
    },
    initialize: function () {
    },
    api: {
        extContentMetaPath: '/v1/url/fetchmeta',
        getExtUrlMetaAPI: function () {
            return this.extContentMetaPath;
        },
    },
    getExtUrlMeta: function (url) {
        var instance = this;
        return new Promise(function (resolve, reject) {
            var headersParam = {};
            data = JSON.stringify({
                "request": {
                    "url": url
                }
            })
            var extContentMetaPath = instance.api.getExtUrlMetaAPI();
            org.ekstep.service.renderer.callApi(extContentMetaPath, 'POST', headersParam, data, function (resp) {
                var result = {};
                if (!resp.error) {
                    resolve(resp);
                } else {
                    console.info("err getExtUrlMeta() : ", resp.error)
                }
            });
        });
    }
}));
org.ekstep.service.exturlrenderer = org.ekstep.service.extcontent;
