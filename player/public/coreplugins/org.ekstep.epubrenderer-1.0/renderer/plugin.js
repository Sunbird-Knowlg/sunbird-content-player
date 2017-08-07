/**
 * This plugin is used to render ePub content
 * @class epubRenderer
 * @extends baseLauncher
 * @author Manoj Chandrashekar <manoj.chandrashekar@tarento.com>
 */

org.ekstep.contentrenderer.baseLauncher.extend({
    book: undefined,
    start: undefined,
    currentPage: 1,
    totalPages: 0,
    initialize: function () {
        EkstepRendererAPI.addEventListener('content:load:application/vnd.ekstep.epub-archive', this.launch, this);
        EkstepRendererAPI.addEventListener('renderer:content:replay', this.resetContent, this);
        this.initContent();
    },
    initContent: function (event, data) {
        var instance = this;
        data = content;

        var epubURL = isbrowserpreview ? this.getAssetURL(data) : data.baseDir;
        var epubPath = epubURL + '/index.epub';

        org.ekstep.pluginframework.resourceManager.loadResource(epubPath, 'TEXT', function (err, data) {
            if (err) {
                showToaster("error", "Unable to open eBook!", {timeOut: 200000})
            } else {
                EkstepRendererAPI.dispatchEvent("renderer:splash:hide");
                instance.renderEpub(epubPath);
            }
        });
    },
    renderEpub: function (epubPath) {
        jQuery('#gameCanvas').remove();
        jQuery('#gameArea').css({left: '10%', top: '0px', width: "80%", height: "90%", margin: "5% 0 5% 0"});
        var epubOptions = {
            width: document.getElementById('gameArea').offsetWidth,
            height: document.getElementById('gameArea').offsetHeight
        };
        this.book = ePub(epubPath, epubOptions);
        this.book.renderTo('gameArea');
        EkstepRendererAPI.dispatchEvent('renderer:overlay:show');
        this.addEventHandlers();
    },
    addEventHandlers: function () {
        var instance = this;
        EventBus.addEventListener('nextClick', function () {
            instance.book.nextPage();
        });

        EventBus.addEventListener('previousClick', function () {
            instance.book.prevPage();
        });

        instance.book.getToc().then(function(toc){
            instance.start = toc[0].href;
        });

        instance.book.generatePagination().then(function (data) {
            instance.totalPages = data.length;
        });

        instance.book.on('book:pageChanged', function (data) {
            instance.logTelemetryInteract({currentPage: instance.currentPage});
            instance.logTelemetryNavigate({fromPage: instance.currentPage, toPage: data.anchorPage});
            instance.currentPage = data.anchorPage;
        });
    },
    getAssetURL: function (content) {
        var content_type = "epub/";
        var globalConfig = EkstepRendererAPI.getGlobalConfig();
        var path = window.location.origin + globalConfig.s3ContentHost + content_type;
        path += content.status == "Live" ? content.identifier + "-latest" : content.identifier + "-snapshot";
        return path;
    },
    resetContent: function () {
        this.relaunch();
        this.gotoStart();
    },
    gotoStart: function () {
        if(this.start) {
            this.book.goto(this.start);
        }
    },
    logTelemetryInteract: function (data) {
        var oeInteractData = {
            type: "TOUCH",
            id: "",
            extype: "",
            eks: {
                stageId: data.currentPage,
                type: "TOUCH",
                subtype: "",
                extype: "",
                pos: [],
                values: [],
                id: "",
                tid: "",
                uri: ""
            }
        };
        TelemetryService.interact(oeInteractData.type, oeInteractData.id, oeInteractData.extype, oeInteractData.eks);
    },
    logTelemetryNavigate: function (data) {
        TelemetryService.navigate(data.fromPage, data.toPage);
    }
});
//# sourceURL=ePubRendererPlugin.js
