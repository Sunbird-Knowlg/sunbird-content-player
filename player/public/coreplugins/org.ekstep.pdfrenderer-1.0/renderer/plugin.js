org.ekstep.contentrenderer.baseLauncher.extend({
    _manifest: undefined,
    CURRENT_PAGE: undefined,
    CANVAS: undefined,
    TOTAL_PAGES: undefined,
    PAGE_RENDERING_IN_PROGRESS: undefined,
    PDF_DOC: undefined,
    CANVAS_CTX: undefined,
    context: undefined,
    stageId: [],
    heartBeatData: {},
    enableHeartBeatEvent: true,
    previousScale: undefined,
    pinchType :undefined,
    headerTimer: undefined,
    _constants: {
        mimeType: ["application/pdf"],
        events: {
            launchEvent: "renderer:launch:pdf"
        }
    },
    initLauncher: function(manifestData) {
        console.log("222222222222222",manifestData);
        console.info('PDF Renderer init', manifestData)
        EkstepRendererAPI.addEventListener(this._constants.events.launchEvent, this.start, this);
        this._manifest = manifestData;
        EkstepRendererAPI.addEventListener('nextClick', this.nextNavigation, this);
        EkstepRendererAPI.addEventListener('previousClick', this.previousNavigation, this);
    },
    enableOverly: function () {
        EkstepRendererAPI.dispatchEvent("renderer:overlay:show");
        EkstepRendererAPI.dispatchEvent('renderer:stagereload:hide');
        $('#pdf-buttons').css({
            display: 'none'
        });
    },
    start: function() {
        this._super();
        context = this;
        var data = _.clone(content);
        console.log(data);
        this.initContentProgress();
        var path = undefined;
        var globalConfigObj = EkstepRendererAPI.getGlobalConfig();
        if (window.cordova || !isbrowserpreview) {
            var regex = new RegExp("^(http|https)://", "i");
            if(!regex.test(globalConfigObj.basepath)){
                var prefix_url = globalConfigObj.basepath || '';
                path = prefix_url + "/" + data.artifactUrl + "?" + new Date().getSeconds();
            }else
                path = data.streamingUrl;
        } else {
            path = data.artifactUrl + "?" + new Date().getSeconds();
        }
        console.log("path pdf is ", path);
        var div = document.createElement('div');
        div.src = path;
        context.addToGameArea(div);
        context.renderPDF(path, document.getElementById(this.manifest.id), this.manifest);
        setTimeout(function() {
            context.enableOverly();
        }, 100);
        context.onScrollEvents();

    },
    onScrollEvents: function() {
        var timeout = null;
        var context = this;
        $('#' + this.manifest.id).bind('scroll', function() {
            clearTimeout(timeout);
            timeout = setTimeout(function() {
               context.logInteractEvent('SCROLL', 'page', '', {
                    stageId: context.CURRENT_PAGE.toString(),
                    subtype: ''
                });
            }, 50);
        });
    },
    replay: function() {
        if (this.sleepMode) return;
        this._super();
        this.enableOverly();
    },

    renderCurrentScaledPage: function() {
        var instance = this;
        context.PDF_DOC.getPage(context.CURRENT_PAGE).then(function(page) {
            if(instance.headerTimer) clearTimeout(instance.headerTimer);    
            // Get viewport of the page at required scale
            
            var viewport = page.getViewport(previousScale);
            // Set canvas height
            context.CANVAS.height = viewport.height;
            var renderContext = {
                canvasContext: context.CANVAS_CTX,
                viewport: viewport
            };

            // Render the page contents in the canvas
            page.render(renderContext).then(function() {
                context.PAGE_RENDERING_IN_PROGRESS = 0;
            });
        });
    },


    renderPDF: function(path, canvasContainer) {
        EkstepRendererAPI.dispatchEvent("renderer:splash:hide");
        var pdfMainContainer = document.createElement("div");
        pdfMainContainer.id = "pdf-main-container";

        var pdfLoader = document.createElement("div");
        pdfLoader.id = "pdf-loader";
        pdfLoader.textContent = "Loading document ...";

        var pdfNoPage = document.createElement("div");
        pdfNoPage.id = "pdf-no-page";
        pdfNoPage.textContent = "No Page Found";

        var pdfContents = document.createElement("div");
        pdfContents.id = "pdf-contents";

        var pdfMetaData = document.createElement("div");
        pdfMetaData.id = "pdf-meta";

        var pdfButtons = document.createElement("div");
        pdfButtons.id = "pdf-buttons";

        var pdfPrevButton = document.createElement("button");
        pdfPrevButton.id = "pdf-prev";
        pdfPrevButton.textContent = "Previous";

        var pdfNextButton = document.createElement("button");
        pdfNextButton.id = "pdf-next";
        pdfNextButton.textContent = "Next";

        var pdfSearchContainer = document.createElement("div");
        pdfSearchContainer.id = "pdf-search-container";

        var findTextField = document.createElement("input");
        findTextField.type = "number";
        findTextField.id = "pdf-find-text";
        findTextField.placeholder = "Enter page number";
        findTextField.min = 1;

        var findSubmit = document.createElement("button");
        findSubmit.id = "pdf-find";
        findSubmit.textContent = "Go";

        pdfSearchContainer.appendChild(findTextField);
        pdfSearchContainer.appendChild(findSubmit);

        if (!window.cordova){
            this.addDownloadButton(path, pdfSearchContainer);
        }

        pdfButtons.appendChild(pdfPrevButton);
        pdfButtons.appendChild(pdfNextButton);

        var pageCountContainer = document.createElement("div");
        pageCountContainer.id = "page-count-container";

        var pageName = document.createElement("span");
        pageName.textContent = "Page ";

        var pdfCurrentPage = document.createElement("span");
        pdfCurrentPage.id = "pdf-current-page";

        var ofText = document.createElement("span");
        ofText.textContent = " of ";

        var pdfTotalPages = document.createElement("span");
        pdfTotalPages.id = "pdf-total-pages";

        pageCountContainer.appendChild(pageName);
        pageCountContainer.appendChild(pdfCurrentPage);
        pageCountContainer.appendChild(ofText);
        pageCountContainer.appendChild(pdfTotalPages);


        pdfMetaData.appendChild(pdfButtons);
        pdfMetaData.appendChild(pdfSearchContainer);
        pdfMetaData.appendChild(pageCountContainer);

        var pdfCanvas = document.createElement("canvas");
        pdfCanvas.id = "pdf-canvas";
        pdfCanvas.width = "700";
        pdfCanvas.style = "maxHeight:100px";

        var pageLoader = document.createElement("div");
        pageLoader.id = "page-loader";
        pageLoader.textContent = "Loading page ...";


        pdfContents.appendChild(pdfMetaData);
        pdfContents.appendChild(pdfCanvas);

        var mc = new Hammer(pdfContents);
        mc.get('pinch').set({ enable: true });

        mc.on("pinchin", function (ev) {
            pinchType = 'pinchIn';
        });
        mc.on("pinchout", function (ev) {
            pinchType = 'pinchOut';
        });
        mc.on("pinchend", function (ev) {
            if (pinchType === 'pinchIn') {
                previousScale = previousScale - 0.25;
            } else if (pinchType === 'pinchOut') {
                previousScale = previousScale + 0.25;
            }
            context.renderCurrentScaledPage();
            pinchType = undefined;
        }); 
    
        pdfContents.appendChild(pageLoader);
        pdfContents.appendChild(pdfNoPage);

        pdfMainContainer.appendChild(pdfLoader);
        pdfMainContainer.appendChild(pdfContents);


        canvasContainer.appendChild(pdfMainContainer);

        document.getElementById(this.manifest.id).style.overflow = "auto";

        context.PDF_DOC = 0;
        context.CURRENT_PAGE = 0;
        context.TOTAL_PAGES = 0;
        context.PAGE_RENDERING_IN_PROGRESS = 0;
        context.CANVAS = $('#pdf-canvas').get(0);
        context.CANVAS_CTX = context.CANVAS.getContext('2d');

        console.log("CANVAS", context.CANVAS);

        $("#pdf-find").on('click', function() {
          previousScale = previousScale - 0.25;
          context.renderCurrentScaledPage();
        });

        $('#pdf-prev').on('click', function() {
            context.logInteractEvent("TOUCH", "previous", "TOUCH", {
                stageId: context.CURRENT_PAGE.toString()
            });
            context.previousNavigation();
        });
        $('#pdf-next').on('click', function() {
            context.logInteractEvent("TOUCH", "next", "TOUCH", {
                stageId: context.CURRENT_PAGE.toString()
            });
            context.nextNavigation();
        });
        this.heartBeatData.stageId = context.CURRENT_PAGE.toString();
        context.showPDF(path, context.manifest);
    },

    addDownloadButton: function(path, pdfSearchContainer){
        if(!path.length) return false;
        var instance = this;
        var downloadBtn = document.createElement("img");
        downloadBtn.id = "download-btn"; 
        downloadBtn.src = "assets/icons/download.png";
        downloadBtn.className = "pdf-download-btn";
        downloadBtn.onclick = function(){
            previousScale = previousScale + 0.25;
            instance.renderCurrentScaledPage();
        };
        pdfSearchContainer.appendChild(downloadBtn);
    },
    nextNavigation: function() {
        if (this.sleepMode) return;
        context.logInteractEvent("TOUCH", "next", null, {
            stageId: context.CURRENT_PAGE.toString()
        });
        //EkstepRendererAPI.getTelemetryService().navigate(context.CURRENT_PAGE.toString(), (context.CURRENT_PAGE + 1).toString());
        if (context.CURRENT_PAGE != context.TOTAL_PAGES) {
            context.showPage(++context.CURRENT_PAGE);
        } else if (context.CURRENT_PAGE == context.TOTAL_PAGES) {
            EkstepRendererAPI.dispatchEvent('renderer:content:end');
        }
    },
    previousNavigation: function() {
        if (this.sleepMode) return;
        context.logInteractEvent("TOUCH", "previous", null, {
            stageId: context.CURRENT_PAGE.toString()
        });
        //EkstepRendererAPI.getTelemetryService().navigate(context.CURRENT_PAGE.toString(), (context.CURRENT_PAGE - 1).toString());
        if(context.CURRENT_PAGE == 1) {
            contentExitCall();
        }
        if (context.CURRENT_PAGE != 1)
            context.showPage(--context.CURRENT_PAGE);
    },
    showPDF: function(pdf_url) {
        console.log("11111111111111");
        $("#pdf-loader").show(); // use rendere loader
        PDFJS.disableWorker = true;
        console.log("MANIFEST DATA", this.manifest)

        // use api to resolve the plugin resource
        PDFJS.workerSrc = org.ekstep.pluginframework.pluginManager.resolvePluginResource(this.manifest.id, this.manifest.ver, "renderer/libs/pdf.worker.js");
        PDFJS.getDocument({
            url: pdf_url
        }).then(function(pdf_doc) {
            context.PDF_DOC = pdf_doc;
            context.TOTAL_PAGES = context.PDF_DOC.numPages;

            // Hide the pdf loader and show pdf container in HTML
            $("#pdf-loader").hide();
            $("#pdf-contents").show();
            context.CANVAS.width = $('#pdf-contents').width();
            $("#pdf-total-pages").text(context.TOTAL_PAGES);

            // Show the first page
            context.showPage(1);
        }).catch(function(error) {
            // If error re-show the upload button
            $("#pdf-loader").hide();
            $("#upload-button").show();
            error.message = "Missing PDF"
            context.throwError(error);
        });
    },
    showPage: function(page_no) {
        console.log("23333333333333333333333333333");
        var instance = this;

        /** To log telemetyr impression event **/
        var navigateStageId = context.CURRENT_PAGE;
        var navigateStageTo = page_no;

        EkstepRendererAPI.dispatchEvent("sceneEnter", context);
        EkstepRendererAPI.dispatchEvent("overlayPrevious", true);
        if(page_no == 1) {
            EkstepRendererAPI.dispatchEvent("renderer:previous:show");
        }
        if (page_no <= context.TOTAL_PAGES && page_no > 0) {

            context.PAGE_RENDERING_IN_PROGRESS = 1;
            context.CURRENT_PAGE = this.heartBeatData.stageId = page_no;

            // Disable Prev & Next buttons while page is being loaded
            $("#pdf-next, #pdf-prev").attr('disabled', 'disabled');

            // While page is being rendered hide the canvas and show a loading message
            $("#pdf-canvas").hide();
            $("#pdf-no-page").hide();
            $("#page-loader").show();

            // Update current page in HTML
            $("#pdf-current-page").text(page_no);

            // Fetch the page
            context.PDF_DOC.getPage(page_no).then(function(page) {
                if(instance.headerTimer) clearTimeout(instance.headerTimer);
                // As the canvas is of a fixed width we need to set the scale of the viewport accordingly
                var scale_required = context.CANVAS.width / page.getViewport(1).width;
                previousScale = scale_required
                //scale_required = scale_required + 0.75;
                // Get viewport of the page at required scale
                var viewport = page.getViewport(scale_required);

                // Set canvas height
                context.CANVAS.height = viewport.height;

                var renderContext = {
                    canvasContext: context.CANVAS_CTX,
                    viewport: viewport
                };

                // Render the page contents in the canvas
                page.render(renderContext).then(function() {
                    context.PAGE_RENDERING_IN_PROGRESS = 0;

                    // Re-enable Prev & Next buttons
                    $("#pdf-next, #pdf-prev").removeAttr('disabled');

                    // Show the canvas and hide the page loader
                    $("#pdf-canvas").show();
                    $("#page-loader").hide();

                    instance.logImpressionEvent(navigateStageId, navigateStageTo);

                    instance.applyOpacityToNavbar(true);
                    instance.headerTimer = setTimeout(function() {
                        clearTimeout(instance.headerTimer);
                        instance.applyOpacityToNavbar(false);
                    }, 2000);

                    $("#pdf-meta").on("mouseover click", function() {
                        if($("#pdf-meta").hasClass("loweropacity"))
                            instance.applyOpacityToNavbar(true);
                    });

                    $("#pdf-meta").on("mouseleave scroll", function() {
                        if($("#pdf-meta").hasClass("higheropacity"))
                            instance.applyOpacityToNavbar(false);
                    });

                });
            });
        } else {
            showToaster('error', "Page not found");
            //$("#pdf-no-page").show();
            $("#page-loader").hide();
            //$("#pdf-canvas").hide();
        }
    },
    applyOpacityToNavbar: function(opacity) {
        if (!opacity) {
            $("#pdf-meta, #page-count-container, #pdf-search-container").removeClass('higheropacity');
            $("#pdf-meta, #page-count-container, #pdf-search-container").addClass('loweropacity');
        } else {
            $("#pdf-meta, #page-count-container, #pdf-search-container").removeClass('loweropacity');
            $("#pdf-meta, #page-count-container, #pdf-search-container").addClass('higheropacity');
        }
    },
    initContentProgress: function() {
        var instance = this;
        EkstepRendererAPI.addEventListener("sceneEnter", function(event) {
            if (this.sleepMode) return;
            instance.stageId.push(event.target.CURRENT_PAGE);
        });
    },
    contentProgress: function() {
        var totalStages = this.TOTAL_PAGES;
        var currentStageIndex = _.size(_.uniq(this.stageId)) || 1;
        return this.progres(currentStageIndex, totalStages);
    },
    logInteractEvent: function(type, id, extype, eks, eid){
        window.PLAYER_STAGE_START_TIME = Date.now()/1000;
        EkstepRendererAPI.getTelemetryService().interact(type, id, extype, eks,eid);
    },
    logImpressionEvent: function(stageId, stageTo){
        EkstepRendererAPI.getTelemetryService().navigate(stageId, stageTo, {
            "duration": (Date.now()/1000) - window.PLAYER_STAGE_START_TIME
        });
    }
});

//# sourceURL=PDFRenderer.js
