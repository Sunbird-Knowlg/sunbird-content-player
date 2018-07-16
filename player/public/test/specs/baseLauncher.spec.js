// describe('Base launcher', function() {
//     var gameArea;
//     beforeAll(function() {
//         // Loading html renderer plugin 
//         window.isMobile = window.cordova;
//         window.content = JSON.parse('{"baseDir":"base/public/test/testContent", "identifier": "org.ekstep.item.sample", "mimeType": "application/vnd.ekstep.html-archive", "name": "Content Preview ", "author": "EkStep", "localData": {"name": "Content Preview ", "loadingMessage": "Without requirements or design, programming is the art of adding bugs to an empty text file. ...", "identifier": "org.ekstep.item.sample", "pkgVersion": 1 }, "isAvailable": true, "path": ""}');
//         setGlobalConfig({});
//         org.ekstep.service.init();
//         TelemetryService.isActive = true;
//         // var gameData = {"id":"org.ekstep.quiz.app","ver":"BUILD_NUMBER"};
//         // var userInfo = {"avatar":"assets/icons/avatar_anonymous.png","profileImage":"assets/icons/avatar_anonymous.png","gender":"male","handle":"Anonymous","age":6,"standard":-1,"uid":"9g8h4ndAnonymouscg56ngd"};
//         // var coreRelateionData = [{"id":"386bf7664ff05b0e9da7f25535cb39fd","type":"ContentSession"}];
//         // //TelemetryService.init(gameData,userInfo,coreRelateionData,undefined);
//         AppConfig.corePluginspath = 'https://s3.ap-south-1.amazonaws.com/ekstep-public-dev/v3/preview/coreplugins';
//         org.ekstep.contentrenderer.initPlugins('', 'https://s3.ap-south-1.amazonaws.com/ekstep-public-dev/v3/preview/coreplugins');
//         // org.ekstep.contentrenderer.loadPlugins([{"id": "org.ekstep.htmlrenderer", "ver": "1.0", "type": 'plugin'}], [], function() {console.log("html renderer plugin is loaded"); });
//     });
//     var baseLauncher = org.ekstep.contentrenderer.baseLauncher.prototype;
//     describe("When it is initialized", function() {
//         it("It should inovoke init  ", function() {
//             spyOn(baseLauncher, "init").and.callThrough();
//             baseLauncher.init(null);
//             expect(baseLauncher.init).toHaveBeenCalled();
//         });
//         it('It should register events', function() {
//             expect(EventBus.hasEventListener('renderer:telemetry:end')).toBe(true);
//             expect(EventBus.hasEventListener('renderer:content:end')).toBe(true);
//             expect(EventBus.hasEventListener('renderer:content:replay')).toBe(true);
//         });

//         it('It should set metdata', function() {
//             expect(content).not.toBe('undefined');
//             expect(baseLauncher.contentMetaData).not.toBe('undefined');
//         });

//         it('It should set the launcher manifest', function() {
//             expect(baseLauncher.manifest).not.toBe('undefined');
//         });

//         it('It should inovoke initLauncher', function() {
//             spyOn(baseLauncher, "initLauncher").and.callThrough();
//             baseLauncher.initLauncher(baseLauncher.manifest);
//             expect(baseLauncher.initLauncher).toHaveBeenCalled();
//         });
//     });
//     describe('When it is invoked start launcher', function() {
//         it('It should invoke start', function() {
//             baseLauncher.manifest = {
//                 id: 'org.ekstep.htmlrenderer'
//             }
//             spyOn(baseLauncher, "start").and.callThrough();
//             baseLauncher.start();
//             expect(baseLauncher.start).toHaveBeenCalled();
//         });
//         it('It should reset the dome element', function() {
//             baseLauncher.manifest = {
//                 id: 'org.ekstep.htmlrenderer'
//             }
//             spyOn(baseLauncher, "resetDomElement").and.callThrough();
//             baseLauncher.resetDomElement();
//             expect(baseLauncher.resetDomElement).toHaveBeenCalled();
//         });
//         it('It should log heartbeat event if the heart event is true', function() {
//             baseLauncher.enableHeartBeatEvent = true;
//             spyOn(baseLauncher, 'heartBeatEvent').and.callThrough();
//             baseLauncher.heartBeatEvent(true);
//             expect(baseLauncher.heartBeatEvent).toHaveBeenCalled();
//         });
//         it('It should not log heartbeat event when heartbeat is false', function() {
//             baseLauncher.enableHeartBeatEvent = false;
//             spyOn(baseLauncher, 'heartBeatEvent').and.callThrough();
//             expect(baseLauncher.heartBeatEvent).not.toHaveBeenCalled();
//         });

//         it('It should trigger OE_START Telemetry Event', function() {
//             baseLauncher.manifest = {
//                 id: 'org.ekstep.htmlrenderer'
//             }
//             spyOn(baseLauncher, "startTelemetry").and.callThrough();
//             baseLauncher.startTelemetry();
//             expect(TelemetryService.isActive).toBe(true);
//             expect(TelemetryService._data).not.toBe(undefined);
//         });
//     });
//     describe('When end method is invoked', function() {
//         it('It should call end method', function() {
//             baseLauncher.manifest = {
//                 id: 'org.ekstep.htmlrenderer'
//             }
//             spyOn(baseLauncher, "end").and.callThrough();
//             baseLauncher.end();
//             expect(baseLauncher.end).toHaveBeenCalled();
//         });
//         it('It should trigger OE_END Telemetry event.', function() {
//             spyOn(baseLauncher, "endTelemetry").and.callThrough();
//             baseLauncher.endTelemetry();
//             expect(baseLauncher.endTelemetry).toHaveBeenCalled();
//             expect(TelemetryService.isActive).toBe(true);
//             expect(TelemetryService._data).not.toBe(undefined);
//         });
//     });

//     describe('When reply method is invoked', function() {
//     	it('It should invoke reply', function() {
//             spyOn(baseLauncher, "replay").and.callThrough();
//             baseLauncher.replay(false);
//             expect(baseLauncher.replay).toHaveBeenCalled();
//         });
//         it('It should disable the heartBeatEvent', function() {
//             spyOn(baseLauncher, "heartBeatEvent").and.callThrough();
//             baseLauncher.heartBeatEvent(false);
//             expect(baseLauncher.heartBeatEvent).toHaveBeenCalled();
//             expect(baseLauncher.enableHeartBeatEvent).toBe(false);
//         });
//         it('It should call end method', function() {
//             baseLauncher.manifest = {
//                 id: 'org.ekstep.htmlrenderer'
//             }
//             spyOn(baseLauncher, "end").and.callThrough();
//             baseLauncher.end();
//             expect(baseLauncher.end).toHaveBeenCalled();
//         });
//         it('It should trigger OE_END Telemetry event.', function() {
//             spyOn(baseLauncher, "endTelemetry").and.callThrough();
//             baseLauncher.endTelemetry();
//             expect(baseLauncher.endTelemetry).toHaveBeenCalled();
//             expect(TelemetryService.isActive).toBe(true);
//             expect(TelemetryService._data).not.toBe(undefined);
//         });
//     });

//     describe('When content progres is invoked', function() {
//         beforeEach(function() {
//             spyOn(baseLauncher, 'progres').and.callThrough();
//         });
//         var progressValue = baseLauncher.progres(50, 100);
//         setTimeout(function(){
//         	console.info("progress value is")
//         	expect(progressValue).not.toEqual('50');
//         },0)
//         baseLauncher.contentProgress();
//     });

//     describe('When element is added to gameArea', function() {
//         it('It should add DOM Element to player gameArea', function() {
//             baseLauncher.manifest = {
//                     id: "org.ekstep.htmlrenderer"
//                 }
//             spyOn(baseLauncher, 'getLauncherDom').and.callThrough();
//             baseLauncher.getLauncherDom();
//             expect(baseLauncher.getLauncherDom).toHaveBeenCalled();
//             spyOn(baseLauncher, 'addToGameArea').and.callThrough();
//             baseLauncher.addToGameArea(document.createElement('iframe'));
//            	expect(baseLauncher.addToGameArea).toHaveBeenCalled();

//             expect(baseLauncher.getLauncherDom("org.ekstep.htmlrenderer")).not.toBe(undefined);
//         });
//     });

//     describe('When invoke errorMessage', function() {
//         it('It should throw OE_ERROR Event', function() {
//             spyOn(baseLauncher, "throwError").and.callThrough();
//             baseLauncher.throwError({});
//            	expect(baseLauncher.throwError).toHaveBeenCalled();

//         });
//     });
// })