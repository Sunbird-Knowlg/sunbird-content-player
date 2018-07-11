/**
 * This plugin is used to render ePub content
 * @class epubRenderer
 * @extends baseLauncher
 * @author Manoj Chandrashekar <manoj.chandrashekar@tarento.com>
 */

org.ekstep.contentrenderer.baseLauncher.extend({
    book: undefined,
    _start: undefined,
    currentPage: 1,
    totalPages: 0,
    lastPage: false,
    stageId:[],
    enableHeartBeatEvent: false,
    initLauncher: function () {
        EkstepRendererAPI.addEventListener('content:load:application/vnd.ekstep.epub-archive', this.launch, this);
        EkstepRendererAPI.dispatchEvent('renderer:stagereload:hide');
        this.start();
    },
    start: function (event, data) {
        this._super()
        var instance = this;
        data = content;
        var epubPath = undefined;
        var globalConfigObj = EkstepRendererAPI.getGlobalConfig();
        this.initContentProgress();
        var div = document.createElement('div');
        div.id = this.manifest.id;
        this.addToGameArea(div);
        if (window.cordova) {
          // For device index.epub will be extracted/unziped to folder. So point to the folder
            epubPath = globalConfigObj.basepath + "/";
        } else {
          // For local and portal, read index.epub file
          epubPath = isbrowserpreview ? data.artifactUrl : data.baseDir + "/" + data.artifactUrl;
        }
        org.ekstep.pluginframework.resourceManager.loadResource(epubPath, 'TEXT', function (err, data) {
            if (err) {
                err.message = 'Unable to open the content.'
                instance.throwError(err)
            } else {
                EkstepRendererAPI.dispatchEvent("renderer:splash:hide");
                EkstepRendererAPI.dispatchEvent('renderer:overlay:show');
                instance.renderEpub(epubPath);
            }
        });
    },
    renderEpub: function (epubPath) {
        // jQuery('#gameCanvas').remove();
        jQuery('#gameArea').css({left: '10%', top: '0px', width: "80%", height: "90%", margin: "5% 0 0 0"});
        var epubOptions = {
            width: document.getElementById('gameArea').offsetWidth,
            height: document.getElementById('gameArea').offsetHeight,
            spreads: false
        };
        this.book = ePub(epubPath, epubOptions);
        this.book.setStyle("padding-right", "1px");
        this.book.setStyle("padding-left", "1px");
        this.book.forceSingle(true);
        this.book.renderTo(this.manifest.id);
        this.addEventHandlers();
        this.initProgressElements();
    },
    addEventHandlers: function () {
        var instance = this;
        EventBus.addEventListener('nextClick', function () {
            EkstepRendererAPI.dispatchEvent('sceneEnter',instance);
            if (instance.lastPage) {
                EkstepRendererAPI.dispatchEvent('renderer:content:end');
                instance.removeProgressElements();
            } else {
                instance.book.nextPage();
            }
        }, this);

        EventBus.addEventListener('previousClick', function () {
            EkstepRendererAPI.dispatchEvent('sceneEnter',instance);
            if(instance.currentPage === 2) {
                // This is needed because some ePubs do not go back to the cover page on `book.prevPage()`
                instance.book.gotoPage(1);
                instance.logTelemetryNavigate("2", "1");
            } else {
                instance.book.prevPage();
            }
            instance.lastPage = false;
        }, this);

        EventBus.addEventListener('actionContentClose', function () {
            instance.logTelemetryInteract(instance.currentPage.toString());
            instance.removeProgressElements();
        });

        instance.book.generatePagination().then(function (data) {
            instance._start = data[0].cfi;
            instance.totalPages = data.length;
            instance.updateProgressElements();
        });

        instance.book.on('book:pageChanged', function (data) {
            instance.logTelemetryInteract(instance.currentPage.toString());
            instance.logTelemetryNavigate(instance.currentPage.toString(), data.anchorPage.toString());
            instance.currentPage = data.anchorPage;
            instance.updateProgressElements();
            if (instance.book.pagination.lastPage === data.anchorPage || instance.book.pagination.lastPage === data.pageRange[1]) {
                instance.lastPage = true;
            }
        });
    },
    replay:function(){
        this.stageId = [];
        this.lastPage = false;
        this.currentPage = 1;
        this.removeProgressElements();
        this._super();
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
            width: '100%',
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
    },
    initContentProgress: function(){
        var instance = this;
        EkstepRendererAPI.addEventListener("sceneEnter",function(event){
            instance.stageId.push(event.target.currentPage);
        });
    },
    contentProgress:function(){
        var totalStages = this.totalPages;
        var currentStageIndex = _.size(_.uniq(this.stageId)) || 1;
        return this.progres(currentStageIndex + 1, totalStages);
    },
    cleanUp: function() {
        this.removeProgressElements();
        EkstepRendererAPI.removeEventListener('actionNavigateNext', undefined, undefined, true);
        EkstepRendererAPI.removeEventListener('actionNavigatePrevious', undefined, undefined, true);
    }
});
//# sourceURL=ePubRendererPlugin.js