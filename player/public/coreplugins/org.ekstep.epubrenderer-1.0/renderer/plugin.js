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
    _constants: {
        mimeType: ["application/epub"],
        events: {
            launchEvent: "renderer:launch:epub"
        }
    },
    initLauncher: function () {
        var instance = this;
        EkstepRendererAPI.addEventListener(this._constants.events.launchEvent, this.start, this);
        EkstepRendererAPI.dispatchEvent('renderer:stagereload:hide');
        EkstepRendererAPI.addEventListener('nextClick', function () {
            if (this.sleepMode) return;
            EkstepRendererAPI.dispatchEvent('sceneEnter',instance);
            if (instance.lastPage) {
                EkstepRendererAPI.dispatchEvent('renderer:content:end');
                instance.removeProgressElements();
            } else {
                instance.book.nextPage();
            }
        }, this);

        EkstepRendererAPI.addEventListener('previousClick', function () {
            if (this.sleepMode) return;
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

        EkstepRendererAPI.addEventListener('actionContentClose', function () {
            if (this.sleepMode) return;
            instance.logTelemetryInteract(instance.currentPage.toString());
            instance.removeProgressElements();
        });
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
        if (window.cordova || !isbrowserpreview) {
            var regex = new RegExp("^(http|https)://", "i");
            if(!regex.test(globalConfigObj.basepath)){
                var prefix_url = globalConfigObj.basepath || '';
                epubPath = prefix_url + "/" + data.artifactUrl;
            }else
                epubPath = data.streamingUrl;
        } else {
            epubPath = data.artifactUrl;
        }

        org.ekstep.pluginframework.resourceManager.loadResource(epubPath, 'TEXT', function (err, data) {
            if (err) {
                err.message = 'Unable to open the content.'
                instance.throwError(err)
            } else {
                EkstepRendererAPI.dispatchEvent("renderer:splash:hide");
                EkstepRendererAPI.dispatchEvent('renderer:overlay:show');

                var obj = {"tempName": ""};
                EkstepRendererAPI.dispatchEvent("renderer:navigation:load", obj);
                instance.renderEpub(epubPath);
            }
        });
    },
    renderEpub: function (epubPath) {
        jQuery('#gameArea').css({left: '10%', top: '0px', width: "80%", height: "90%", margin: "5% 0 0 0"});
        var epubOptions = {
            width: document.getElementById('gameArea').offsetWidth,
            height: document.getElementById('gameArea').offsetHeight,
            spreads: false
        };
        setTimeout(function() {
            jQuery('previous-navigation').show();
            jQuery('next-navigation').show();
            jQuery('custom-previous-navigation').hide();
            jQuery('custom-next-navigation').hide();
        }, 100);
        this.book = ePub(epubPath, epubOptions);
        this.book.setStyle("padding-right", "1px");
        this.book.setStyle("padding-left", "1px");
        this.book.setStyle("height", "100%");
        this.book.setStyle("overflow", "auto");
        this.book.forceSingle(true);
        this.book.renderTo(this.manifest.id);
        this.addEventHandlers();
        this.initProgressElements();
    },
    addEventHandlers: function () {
        var instance = this;
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
        if (this.sleepMode) return;
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
    contentPlaySummary: function () {
        var playSummary =  [
            {
              "totallength":  parseInt(this.totalPages)
            },
            {
              "visitedlength": parseInt(_.max(this.stageId))
            },
            {
              "visitedcontentend": (this.totalPages == Math.max.apply(Math, this.stageId)) ? true : false
            },
            {
              "totalseekedlength": parseInt(this.totalPages) - _.size(_.uniq(this.stageId))
            }
        ]
        return playSummary;
    },

    // use this methos to send additional content statistics
    additionalContentSummary: function () {
        return
    },
    
    cleanUp: function() {
        if (this.sleepMode) return; 
        this.sleepMode = true;
        this.removeProgressElements();
        EkstepRendererAPI.removeEventListener('actionNavigateNext', undefined, undefined, true);
        EkstepRendererAPI.removeEventListener('actionNavigatePrevious', undefined, undefined, true);
        EkstepRendererAPI.removeEventListener('renderer:launcher:clean', this.cleanUp, this);
    }
});
//# sourceURL=ePubRendererPlugin.js