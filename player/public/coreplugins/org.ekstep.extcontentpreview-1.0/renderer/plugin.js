org.ekstep.contentrenderer.baseLauncher.extend({
    initLauncher: function () {
        var instance = this;
        this.start();
    },
    start: function () {
        var instance = this;
        this._super();
        data = content;
        this.reset();
        jQuery(this.manifest.id).remove();
        var iframediv = document.createElement('div');
        this.getPreviewFromURL(data.artifactUrl, function (err, htmlString) {
            iframediv.innerHTML = htmlString;
            jQuery(iframediv).click(function (event) {
                urlArray = window.parent.location.pathname.split('/');
                setTimeout(function () {
                    var newWindow = window.open(window.location.origin + window.top.location.pathname +
                        '/learn/redirect', '_blank');
                    if (urlArray.length > 5 && urlArray[1] === 'learn' && urlArray[2] === 'course') {
                        newWindow.redirectUrl = ((data.artifactUrl) + '#&courseId=' + urlArray[3] + '#&batchId=' + urlArray[4] + '#&contentId='
                            + data.identifier + '#&uid' + "")
                    } else {
                        newWindow.redirectUrl = ((data.artifactUrl) + '#&contentId=' + data.identifier)
                    }
                    newWindow.timetobethere = 500
                }, 200)
            });
            EkstepRendererAPI.dispatchEvent("renderer:splash:hide");
            instance.addToGameArea(iframediv);
        });
    },
    getPreviewFromURL: function (url, cb) {
        var instance = this;
        org.ekstep.service.web.getExtUrlMeta(url).then(function (resp) {
            if (resp && resp.result) {
                cb(null, instance.generatePreview(resp.result));
            }
            else {
                cb(null, instance.generatePreview({}));
            }
        }).catch(function (err) {
            console.error("Failed: getExtUrlMeta()", err);
        });
    },
    generatePreview: function (data) {
        var previewHtml = "<div class='no-preview'><p> No Preview available </p></div>";
        if (data && (data["og:title"] && data["og:description"])) {
            image = data["og:image"] ? "<img src='" + data["og:image"] + "' />" : "";
            previewHtml = "<div class='item preview-link-content'>" +
                "<div class='left-content'><h2 class='grey-text'>" + data["og:site_name"] + "</h2><a class='calm'><span class='header'>" + data["og:title"] +
                "</span></a><p align='left'>" + data["og:description"] + "</p></div>" +
                "<div class='right-content'>" + image + "</div></div>";
        }
        return previewHtml;
    },

    reset: function () {
        this.currentIndex = 20;
        this.totalIndex = 100;
    }
});
//# sourceURL=extcontentpreview.js
