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
                setTimeout(function () {
                    var newWindow = window.open(window.location.origin + '/learn/redirect', '_blank')

                    newWindow.redirectUrl = ((data.artifactUrl) +
                        '#&contentId=' + data.identifier)
                    newWindow.timetobethere = 500
                }, 200)
            });
            EkstepRendererAPI.dispatchEvent("renderer:splash:hide");
            instance.addToGameArea(iframediv);
        });
    },
    fetchUrlMeta: function (url, cb) {
        return jQuery.ajax({
            url: window.location.origin + '/url/v1/fetchmeta',
            type: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                "request": {
                    "url": url
                }
            })
        });
    },
    getPreviewFromURL: function (url, cb) {
        var instance = this;
        this.fetchUrlMeta(url).done(function (resp) {
            if (resp && resp.result) {
                cb(null, instance.generatePreview(resp.result));
            }
            else {
                cb(null, instance.generatePreview({}));
            }
        }).fail(function (error, textStatus, errorThrown) {
            cb(null, instance.generatePreview({}))
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
