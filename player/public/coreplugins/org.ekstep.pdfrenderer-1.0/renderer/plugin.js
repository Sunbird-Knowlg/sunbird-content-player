 org.ekstep.contentrenderer.baseLauncher.extend({
     _manifest: undefined,
     CURRENT_PAGE: undefined,
     CANVAS: undefined,
     TOTAL_PAGES: undefined,
     PAGE_RENDERING_IN_PROGRESS: undefined,
     PDF_DOC: undefined,
     CANVAS_CTX: undefined,
     context: undefined,
     stageId:[],
     initLauncher: function(manifestData) {
         console.info('PDF Renderer init', manifestData)
         EkstepRendererAPI.addEventListener('nextClick', this.nextNavigation, this);
         EkstepRendererAPI.addEventListener('previousClick', this.previousNavigation, this);
         this._manifest = manifestData
         this.start(manifestData);

     },
     enableOverly: function() {
         EkstepRendererAPI.dispatchEvent("renderer:overlay:show");
         EkstepRendererAPI.dispatchEvent('renderer:stagereload:hide');
         $('#pdf-buttons').css({
             display: 'none'
         });
     },
     start: function(manifestData) {
        this._super();
        context = this;
        var data = _.clone(content);
        this.initContentProgress();
        this.manifestData = manifestData;
         var path = undefined;
        if (window.cordova || !isbrowserpreview) {
            var prefix_url = data.baseDir || '';
            path = prefix_url + "/" + data.artifactUrl;
        } else {
            path = data.artifactUrl;
        }
         console.log("path pdf ", path);
         var div = document.createElement('div');
         div.src = path;
         context.addToGameArea(div);
         context.renderPDF(path, document.getElementById(this.manifest.id), manifestData);
         setTimeout(function() {
             context.enableOverly();
         }, 100);
         context.onScrollEvents();

     },
     onScrollEvents: function() {
         var timeout = null;
         $('#' + this.manifest.id).bind('scroll', function() {
             clearTimeout(timeout);
             timeout = setTimeout(function() {
                 EkstepRendererAPI.getTelemetryService().interact('SCROLL', 'page', '', {
                     stageId: context.CURRENT_PAGE.toString(),
                     subtype: ''
                 });
             }, 50);
         });
     },
     replay: function() {
        this.enableOverly();
        context.showPage(1);
     },
     renderPDF: function(path, canvasContainer, manifestData) {
         EkstepRendererAPI.dispatchEvent("renderer:splash:hide");
         var pdfMainContainer = document.createElement("div");
         this.heartBeatEvent(true);
         pdfMainContainer.id = "pdf-main-container";
         pdfMainContainer.style.overflowX = "scroll";
         pdfMainContainer.style.overflowY = "scroll";

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
         pdfContents.appendChild(pageLoader);
         pdfContents.appendChild(pdfNoPage);

         pdfMainContainer.appendChild(pdfLoader);
         pdfMainContainer.appendChild(pdfContents);


         canvasContainer.appendChild(pdfMainContainer);

         document.getElementById(this.manifest.id).style.overflowX = "scroll";
         document.getElementById(this.manifest.id).style.overflowY = "scroll";

         context.PDF_DOC = 0;
         context.CURRENT_PAGE = 0;
         context.TOTAL_PAGES = 0;
         context.PAGE_RENDERING_IN_PROGRESS = 0;
         context.CANVAS = $('#pdf-canvas').get(0);
         context.CANVAS_CTX = context.CANVAS.getContext('2d');

         console.log("CANVAS", context.CANVAS);

         $("#pdf-find").on('click', function() {
             var searchText = document.getElementById("pdf-find-text");
             console.log("SEARCH TEXT", searchText.value);
             EkstepRendererAPI.getTelemetryService().interact("TOUCH", "navigate", "TOUCH", {
                 stageId: context.CURRENT_PAGE.toString(),
                 subtype: ''
             });
             EkstepRendererAPI.getTelemetryService().navigate(context.CURRENT_PAGE.toString(), searchText.value);
             context.showPage(parseInt(searchText.value));
         });

         $('#pdf-prev').on('click', function() {
             EkstepRendererAPI.getTelemetryService().interact("TOUCH", "previous", "TOUCH", {
                 stageId: context.CURRENT_PAGE.toString()
             });
             context.previousNavigation();
         });
         $('#pdf-next').on('click', function() {
             EkstepRendererAPI.getTelemetryService().interact("TOUCH", "next", "TOUCH", {
                 stageId: context.CURRENT_PAGE.toString()
             });
             context.nextNavigation();
         });
         context.showPDF(path, manifestData);
     },

     nextNavigation: function() {
        EkstepRendererAPI.getTelemetryService().interact("TOUCH", "next", null, {
            stageId: context.CURRENT_PAGE.toString()
        });
         EkstepRendererAPI.getTelemetryService().navigate(context.CURRENT_PAGE.toString(), (context.CURRENT_PAGE + 1).toString());
         if (context.CURRENT_PAGE != context.TOTAL_PAGES) {
             context.showPage(++context.CURRENT_PAGE);
         } else if (context.CURRENT_PAGE == context.TOTAL_PAGES) {
             this.heartBeatEvent(false);
             EkstepRendererAPI.dispatchEvent('renderer:content:end');
         }
     },
     previousNavigation: function() {
         EkstepRendererAPI.getTelemetryService().interact("TOUCH", "previous", null, {
            stageId: context.CURRENT_PAGE.toString()
         });
         EkstepRendererAPI.getTelemetryService().navigate(context.CURRENT_PAGE.toString(), (context.CURRENT_PAGE - 1).toString());
         if (context.CURRENT_PAGE != 1)
             context.showPage(--context.CURRENT_PAGE);
     },
     showPDF: function(pdf_url, manifestData) {
         $("#pdf-loader").show(); // use rendere loader
         PDFJS.disableWorker = true;
         console.log("MANIFEST DATA", manifestData)

         // use api to resolve the plugin resource
         PDFJS.workerSrc = org.ekstep.pluginframework.pluginManager.resolvePluginResource(manifestData.id, manifestData.ver, "renderer/libs/pdf.worker.js");
         PDFJS.getDocument({
             url: pdf_url
         }).then(function(pdf_doc) {
             context.PDF_DOC = pdf_doc;
             context.TOTAL_PAGES = context.PDF_DOC.numPages;

             // Hide the pdf loader and show pdf container in HTML
             $("#pdf-loader").hide();
             $("#pdf-contents").show();
             $("#pdf-total-pages").text(context.TOTAL_PAGES);

             // Show the first page
             context.showPage(1);
         }).catch(function(error) {
             // If error re-show the upload button
             $("#pdf-loader").hide();
             $("#upload-button").show();
             EkstepRendererAPI.logErrorEvent(error.message,{'type':'content','action':'play','severity':'fatal'});
             showToaster('error', "Unable to open PDF");

         });
     },
     showPage: function(page_no) {
        EkstepRendererAPI.dispatchEvent("sceneEnter", context);
         if (page_no <= context.TOTAL_PAGES && page_no > 0) {

             context.PAGE_RENDERING_IN_PROGRESS = 1;
             context.CURRENT_PAGE = page_no;

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
                 // As the canvas is of a fixed width we need to set the scale of the viewport accordingly
                 var scale_required = context.CANVAS.width / page.getViewport(1).width;

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
                 });
             });
         } else {
            showToaster('error', "Page not found");
             //$("#pdf-no-page").show();
             $("#page-loader").hide();
             //$("#pdf-canvas").hide();
         }
     },
    initContentProgress: function(){
        var instance = this;
        EkstepRendererAPI.addEventListener("sceneEnter",function(event){
            instance.stageId.push(event.target.CURRENT_PAGE);
        });
    },
    contentProgress:function(){
        var totalStages = this.TOTAL_PAGES;
        var currentStageIndex = _.size(_.uniq(this.stageId)) || 1;
        return this.progres(currentStageIndex, totalStages);
    },
 });

 //# sourceURL=PDFRenderer.js