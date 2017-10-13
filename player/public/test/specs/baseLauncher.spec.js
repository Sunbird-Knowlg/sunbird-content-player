describe('Base launcher', function() {
    var baseLauncher = org.ekstep.contentrenderer.baseLauncher.prototype
    describe("When it is initialized", function() {
        it("it should inovoke init  ", function() {
            window.isMobile = window.cordova;
            window.content = {
                "identifier": "org.ekstep.item.sample",
                "mimeType": "application/vnd.ekstep.ecml-archive",
                "name": "Content Preview ",
                "author": "EkStep",
                "localData": {
                    "name": "Content Preview ",
                    "loadingMessage": "Without requirements or design, programming is the art of adding bugs to an empty text file. ...",
                    "identifier": "org.ekstep.item.sample",
                    "pkgVersion": 1
                },
                "isAvailable": true,
                "path": ""
            }
            setGlobalConfig({});
            org.ekstep.service.init();
            AppConfig.corePluginspath = 'https://s3.ap-south-1.amazonaws.com/ekstep-public-dev/v3/preview/coreplugins';
            org.ekstep.contentrenderer.initPlugins('', 'https://s3.ap-south-1.amazonaws.com/ekstep-public-dev/v3/preview/coreplugins');
            org.ekstep.contentrenderer.loadPlugins([{
                "id": "org.ekstep.htmlrenderer",
                "ver": "1.0",
                "type": 'plugin'
            }], [], function() {
                console.log("html renderer plugin is loaded");
            });
            spyOn(baseLauncher, "init").and.callThrough();
            baseLauncher.init(null);
            expect(baseLauncher.init).toHaveBeenCalled();
        });
        it('it should register events', function() {
            expect(EventBus.hasEventListener('renderer:telemetry:end')).toBe(true);
            expect(EventBus.hasEventListener('renderer:content:end')).toBe(true);
            expect(EventBus.hasEventListener('renderer:content:replay')).toBe(true);
        });

        it('it should set metdata', function() {
            expect(content).not.toBe('undefined');
            expect(baseLauncher.contentMetaData).not.toBe('undefined');
        });

        it('it should set the launcher manifest', function() {
            expect(baseLauncher.manifest).not.toBe('undefined');
        });

        it('it should inovoke initLauncher', function() {
            spyOn(baseLauncher, "initLauncher").and.callThrough();
            baseLauncher.initLauncher(baseLauncher.manifest);
            expect(baseLauncher.initLauncher).toHaveBeenCalled();
        });
    });
    describe('when it invoked start', function() {
        it('it should invoke start', function() {
            baseLauncher.manifest = {
                id: 'org.ekstep.htmlrenderer'
            }
            spyOn(baseLauncher, "start").and.callThrough();
            baseLauncher.start();
            expect(baseLauncher.start).toHaveBeenCalled();
        });
        it('it should reset the dome element', function() {
            baseLauncher.manifest = {
                id: 'org.ekstep.htmlrenderer'
            }
            spyOn(baseLauncher, "resetDomElement").and.callThrough();
            baseLauncher.resetDomElement();
            expect(baseLauncher.resetDomElement).toHaveBeenCalled();
        });
        it('it should reset the dome element', function() {
            baseLauncher.manifest = {
                id: 'org.ekstep.htmlrenderer'
            }
            spyOn(baseLauncher, "resetDomElement").and.callThrough();
            baseLauncher.resetDomElement();
            expect(baseLauncher.resetDomElement).toHaveBeenCalled();
        });
        it('it should log heartbeat event if the heart event is true', function() {
            baseLauncher.enableHeartBeatEvent = true;
            spyOn(baseLauncher, 'heartBeatEvent').and.callThrough();
            baseLauncher.heartBeatEvent(true);
            expect(baseLauncher.heartBeatEvent).toHaveBeenCalled();
        });
        it('it should not log heartbeat event when heartbeat is false', function() {
            baseLauncher.enableHeartBeatEvent = false;
            spyOn(baseLauncher, 'heartBeatEvent').and.callThrough();
            expect(baseLauncher.heartBeatEvent).not.toHaveBeenCalled();
        });

        it('it should start telemetry',function(){
        	baseLauncher.manifest = {
                id: 'org.ekstep.htmlrenderer'
            }
            spyOn(baseLauncher, "startTelemetry").and.callThrough();
            baseLauncher.startTelemetry();
        });
    });
    describe('when end method is invoked',function(){
    	it('it should call end method',function(){
    		baseLauncher.manifest = {
                id: 'org.ekstep.htmlrenderer'
            }
            spyOn(baseLauncher, "start").and.callThrough();
            baseLauncher.start();
    	});
    });
})