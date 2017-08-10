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
    lastPage: false,
    initialize: function () {
        EkstepRendererAPI.addEventListener('content:load:application/vnd.ekstep.epub-archive', this.launch, this);
        EkstepRendererAPI.addEventListener('renderer:content:replay', this.resetContent, this);
        EkstepRendererAPI.dispatchEvent('renderer:overlay:show');
        EkstepRendererAPI.dispatchEvent('renderer:stagereload:hide');
        EkstepRendererAPI.dispatchEvent('renderer:contentclose:show');
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
            height: document.getElementById('gameArea').offsetHeight,
            spreads: false
        };
        this.book = ePub(epubPath, epubOptions);
        this.book.forceSingle(true);
        this.book.renderTo('gameArea');
        this.addEventHandlers();
        this.initProgressElements();
    },
    addEventHandlers: function () {
        var instance = this;
        EventBus.addEventListener('nextClick', function () {
            if (instance.lastPage) {
                EkstepRendererAPI.dispatchEvent('renderer:content:end');
                instance.removeProgressElements();
            } else {
                instance.book.nextPage();
            }
        });

        EventBus.addEventListener('previousClick', function () {
            if(instance.currentPage === 2) {
                // This is needed because some ePubs do not go back to the cover page on `book.prevPage()`
                instance.gotoStart();
                instance.logTelemetryNavigate("2", "1");
            } else {
                instance.book.prevPage();
            }
            instance.lastPage = false;
        });

        EventBus.addEventListener('actionContentClose', function () {
            instance.logTelemetryInteract(instance.currentPage.toString());
            instance.removeProgressElements();
        });

        instance.book.generatePagination().then(function (data) {
            instance.start = data[0].cfi;
            instance.totalPages = data.length;
            instance.updateProgressElements();
        });

        instance.book.on('book:pageChanged', function (data) {
            instance.logTelemetryInteract(instance.currentPage.toString());
            instance.logTelemetryNavigate(instance.currentPage.toString(), data.anchorPage.toString());
            instance.currentPage = data.pageRange[1];
            instance.updateProgressElements();
            if (instance.book.pagination.lastPage === data.anchorPage || instance.book.pagination.lastPage === data.pageRange[1]) {
                instance.lastPage = true;
            }
        });
    },
    getAssetURL: function (content) {
        var content_type = "epub/";
        var globalConfig = EkstepRendererAPI.getGlobalConfig();
        var path = window.location.origin + globalConfig.s3ContentHost + content_type;
        path += content.status === "Live" ? content.identifier + "-latest" : content.identifier + "-snapshot";
        return path;
    },
    resetContent: function () {
        this.relaunch();
        this.gotoStart();
    },
    gotoStart: function () {
        if (this.start) {
            this.book.gotoCfi(this.start);
            this.currentPage = 1;
            this.lastPage = false;
            EkstepRendererAPI.dispatchEvent('renderer:overlay:hide');
            EkstepRendererAPI.dispatchEvent('renderer:overlay:show');
            this.removeProgressElements();
            this.initProgressElements();
        }
    },
    logTelemetryInteract: function (stageId) {
        var oeInteractData = {
            type: "TOUCH",
            id: "",
            extype: "",
            eks: {
                stageId: stageId,
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
    logTelemetryNavigate: function (fromPage, toPage) {
        TelemetryService.navigate(fromPage, toPage);
    },
    initProgressElements: function () {
        // Add page number display container
        var $pageDiv = jQuery('<div>', {id: 'page'}).css({
            position: 'absolute',
            top: '5px',
            width: '40%',
            height: '30px',
            overflow: 'hidden',
            margin: '0 auto',
            left: 0,
            right: 0,
            'text-align': 'center'
        });
        jQuery('#gameArea').parent().append($pageDiv);

        // Add progress bar
        var $progressDiv = jQuery('<div>', {id: 'progress-container'}).css({
            width: '80%',
            margin: '0 auto',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
        });
        var $progressContainer = jQuery('<div>', {id: 'progress'}).css({
            overflow: 'hidden',
            height: '0.33em',
            'background-color': '#e5e5e5'
        });
        var $progressBar = jQuery('<div>', {id: 'bar'}).css({
            width: '0%',
            height: '0.33em',
            'background-color': '#7f7f7f'
        });
        $progressContainer.append($progressBar);
        $progressDiv.append($progressContainer);
        jQuery('#gameArea').parent().append($progressDiv);
        this.updateProgressElements();
    },
    removeProgressElements: function () {
        jQuery('#page').remove();
        jQuery('#progress-container').remove();
    },
    updateProgressElements: function () {
        jQuery('#page').html(this.currentPage + ' of ' + this.totalPages);
        jQuery('#bar').css({width: ((this.currentPage / this.totalPages) * 100) + '%'});
    }
});
//# sourceURL=ePubRendererPlugin.js