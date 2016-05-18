OverlayHtml = {
    showNext: function() {
        this._updateNavigate("next");
    },
    showPrevious: function() {
        this._updateNavigate("previous");
    },
    _updateNavigate: function(type) {
        var search = "navigate[type=\"'" + type + "'\"]";
        var navigates = jQuery(search);
        if ("undefined" != typeof navigates && "undefined" != typeof angular) {
            var elements = angular.element(navigates);
            elements.trigger("navigateUpdate", {
                show: true
            });
            var rootScope = this._getRootScope();
            rootScope.$apply();
        }
    },
    _setRootScope: function(key, value) {
        var rootScope = this._getRootScope();
        if (rootScope) {
            rootScope[key] = value;
            rootScope.$apply();
        }
    },
    _getRootScope: function() {
        var rootScope = null;
        var overlayDOMElement = document.getElementById('overlayHTML');
        if ("undefined" != typeof angular && "undefined" != typeof overlayDOMElement) {
            rootScope = angular.element(overlayDOMElement).scope().$root;
        }
        return rootScope;
    },
    sceneEnter: function() {
        var isItemStage = this.isItemScene();

        var queue = new createjs.LoadQueue();
        createjs.Sound.alternateExtensions = ["ogg"];
        queue.installPlugin(createjs.Sound);

        function handleComplete(event) {
            console.log("Preloaded:");
        }
        queue.addEventListener("complete", handleComplete);
        queue.loadManifest([{
            id: "good",
            src: "./img/icons/scene5.mp3"
        }, {
            id: "try",
            src: "./img/icons/scene5.mp3"
        }]);

        if (isItemStage) {


            this._setRootScope("isItemScene", true);
            var currentScene = Renderer.theme._currentScene;
            currentScene.on("correct_answer", function(event) {
                console.log("listener for ", event);

                if (event.type === "correct_answer") {
                    createjs.Sound.play("good");


                    ///////////////////////////////////////////////
                    /* var assetsPath = "./img/icons/";
                   var sounds = [{
                        src: "scene5.mp3",
                        data: {
                            audioSprite: [
                                { preload: true, id: "good_job", startTime: 0, duration: 1000 }
                            ]
                        }
                    }];
                     createjs.Sound.registerSounds(sounds, assetsPath);
                        function handleFileLoad(event) {
                            // A sound has been preloaded. This will fire TWICE
                            console.log("Preloaded:", event.id, event.src);
                        }
                    createjs.Sound.addEventListener("fileload", handleFileLoad);    
                    
                    createjs.Sound.alternateExtensions = ["ogg"];
                    createjs.Sound.play("good_job");
*/

                    // after load is complete

                    /* var audio = new Audio('http://192.254.184.234/~tangh/01_admin_resources/Shimmer/mp3/Smile.mp3');
                     audio.play();*/
                }
                jQuery("#goodJobPopup").show();
            });
            currentScene.on("wrong_answer", function(event) {
                console.info("listener for ", event);
                if (event.type === "wrong_answer") {
                    createjs.Sound.play("try");
                    /* var queue = new createjs.LoadQueue();
                     createjs.Sound.alternateExtensions = ["mp3"];
                     queue.installPlugin(createjs.Sound);

                     function handleComplete(event) {
                         // A sound has been preloaded. This will fire TWICE
                         console.log("Preloaded:");
                     }
                     queue.addEventListener("complete", handleComplete);
                     queue.loadFile({ id: "mySound", src: "./img/icons/scene5.mp3" });*/

                    /* var assetsPath = "./img/icons/";
                    var sounds = [{
                        src: "scene5.mp3",
                        data: {
                            audioSprite: [
                                { id: "try_again", startTime: 0, duration: 1000 }
                            ]
                        }
                    }];

                createjs.Sound.registerSounds(sounds, assetsPath);
                        function handleFileLoad(event) {
                            // A sound has been preloaded. This will fire TWICE
                            console.log("Preloaded:", event.id, event.src);
                        }
                    createjs.Sound.addEventListener("fileload", handleFileLoad);    
                    
                    createjs.Sound.alternateExtensions = ["ogg"];

                    // after load is complete
                    createjs.Sound.play("try_again");
*/

                }


                jQuery("#tryAgainPopup").show();
            });
        }
    },
    isItemScene: function() {
        return ("undefined" != typeof Renderer.theme._currentScene._stageController && "items" == Renderer.theme._currentScene._stageController._type) ? true : false;
    }
};