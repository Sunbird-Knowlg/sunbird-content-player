describe('Telemetry Service Plugin test cases', function() {
    var telemetryObj, context, user, correlationData, otherData, telemetryUtil,id, ver, data;
    beforeAll(function() {
            telemetryObj = TelemetryService;
            telemetryUtil = TelemetryServiceUtil;
            context = {
                id: "org.ekstep.quiz.app",
                ver: "BUILD_NUMBER"
            }
            user = {
                age: 6,
                avatar: "assets/icons/avatar_anonymous.png",
                gender: "male",
                handle:"Anonymous",
                profileImage: "assets/icons/avatar_anonymous.png",
                standard: -1,
                uid:"9g8h4ndAnonymouscg56ngd",
            }
            correlationData = [{
                id: "220740957970f6926211c73690383fbf",
                type: "ContentSession"
            }]
            otherData = undefined;
            id = "org.ekstep.quiz.app";
            ver = "BUILD_NUMBER";
            data = {
                mode: "preview",
                stageid: ""
            };
    });

    /*describe('Telemetry START function', function() {
     it('It should invoke the init function', function() {
        spyOn(telemetryObj, "init").and.callThrough();
        telemetryObj.init(context, user, correlationData, otherData);
        expect(telemetryObj.init).toHaveBeenCalled();

        spyOn(telemetryUtil, "getConfig").and.callThrough();
        expect(telemetryUtil.getConfig).toHaveBeenCalled();
    });
    });*/
    
    describe('Telemetry START function', function() {
        it('It should invoke the start function', function() {
            spyOn(telemetryObj, "start").and.callThrough();
            telemetryObj.start(id, ver, data);
            expect(telemetryObj.start).toHaveBeenCalled();
        });
        it('It should return instance of inactive class', function() {
            telemetryObj.isActive = false;
            spyOn(telemetryObj, "start").and.callThrough();
            var res = telemetryObj.start(id, ver, data);
            expect(telemetryObj.start).toHaveBeenCalled();
            spyOn(res, "init").and.callThrough();
            res.init();
            expect(res.init).toHaveBeenCalled();
        });
    });

    describe('Telemetry INTERACT function', function() {
        it('It should invoke the interact function', function() {
            spyOn(telemetryObj, "interact").and.callThrough();
            var response = telemetryObj.interact();
            expect(telemetryObj.interact).toHaveBeenCalled();
            expect(response).toEqual(jasmine.any(Object));
        });
        it('It should rerturn the inactive object', function() {
            spyOn(telemetryObj, "interact").and.callThrough();
            var response = telemetryObj.interact();
            telemetryObj.isActive = false;
            expect(response).toEqual(jasmine.any(Object));
        });
    });

    /* describe('Telemetry setUser function', function() {
        it('It should invoke the setUser function', function() {
            spyOn(telemetryObj, "setUser").and.callThrough();
            var response = telemetryObj.setUser();
            expect(telemetryObj.setUser).toHaveBeenCalled();
            expect(response).toEqual(jasmine.any(Object));
        });
        it('It should rerturn the inactive object', function() {
            spyOn(telemetryObj, "setUser").and.callThrough();
            var response = telemetryObj.setUser();
            telemetryObj.isActive = false;
            expect(response).toEqual(jasmine.any(Object));
        });
    }); */

    describe('Telemetry ASSESS function', function() {
        it('It should invoke the assess function', function() {
            spyOn(telemetryObj, "assess").and.callThrough();
            var response = telemetryObj.assess();
            expect(telemetryObj.assess).toHaveBeenCalled();
            expect(response).toEqual(jasmine.any(Object));
        });
        it('It should rerturn the inactive object', function() {
            spyOn(telemetryObj, "assess").and.callThrough();
            var response = telemetryObj.assess();
            telemetryObj.isActive = false;
            expect(response).toEqual(jasmine.any(Object));
        });
    });

    describe('Telemetry ERROR function', function() {
        it('It should invoke the error function', function() {
            spyOn(telemetryObj, "error").and.callThrough();
            var response = telemetryObj.error();
            expect(telemetryObj.error).toHaveBeenCalled();
        });
        it('It should rerturn the inactive object', function() {
            spyOn(telemetryObj, "error").and.callThrough();
            var response = telemetryObj.error();
            telemetryObj.isActive = false;
            expect(response).toEqual(jasmine.any(Object));
        });
    });

    describe('Telemetry assessEnd function', function() {
        it('It should invoke the assessEnd function', function() {
            spyOn(telemetryObj, "assessEnd").and.callThrough();
            var response = telemetryObj.assessEnd();
            expect(telemetryObj.assessEnd).toHaveBeenCalled();
            expect(telemetryObj.error).toHaveBeenCalled();
        });
        it('It should rerturn the inactive object', function() {
            spyOn(telemetryObj, "assessEnd").and.callThrough();
            var response = telemetryObj.assessEnd();
            telemetryObj.isActive = false;
            expect(response).toEqual(jasmine.any(Object));
        });
    });

    describe('Telemetry levelSet function', function() {
        it('It should invoke the levelSet function', function() {
            spyOn(telemetryObj, "levelSet").and.callThrough();
            var response = telemetryObj.levelSet();
            expect(telemetryObj.levelSet).toHaveBeenCalled();
            expect(response).toEqual(jasmine.any(Object));
        });
        it('It should rerturn the inactive object', function() {
            spyOn(telemetryObj, "assessEnd").and.callThrough();
            var response = telemetryObj.assessEnd();
            telemetryObj.isActive = false;
            expect(response).toEqual(jasmine.any(Object));
        });
    });

    describe('Telemetry INTERRUPT function', function() {
        it('It should invoke the interrupt function', function() {
            spyOn(telemetryObj, "interrupt").and.callThrough();
            var response =  telemetryObj.interrupt();
            expect(telemetryObj.interrupt).toHaveBeenCalled();
            expect(response).toEqual(jasmine.any(Object));
        });
        it('It should rerturn the inactive object', function() {
            spyOn(telemetryObj, "interrupt").and.callThrough();
            var response = telemetryObj.interrupt();
            telemetryObj.isActive = false;
            expect(response).toEqual(jasmine.any(Object));
        });
    });

    describe('Telemetry exitApp function', function() {
        it('It should invoke the exitApp function', function() {
            spyOn(telemetryObj, "exitApp").and.callThrough();
            telemetryObj.exitApp();
            expect(telemetryObj.exitApp).toHaveBeenCalled();
        });
    });
    
    describe('Telemetry navigate function', function() {
        it('It should invoke the navigate function', function() {
            spyOn(telemetryObj, "navigate").and.callThrough();
            var response = telemetryObj.navigate();
            expect(telemetryObj.navigate).toHaveBeenCalled();
            expect(response).toEqual(jasmine.any(Object));
        });
        it('It should rerturn the inactive object', function() {
            spyOn(telemetryObj, "navigate").and.callThrough();
            var response = telemetryObj.navigate();
            telemetryObj.isActive = false;
            expect(response).toEqual(jasmine.any(Object));
        });
    });

    describe('Telemetry sendFeedback function', function() {
        it('It should invoke the sendFeedback function', function() {
            spyOn(telemetryObj, "sendFeedback").and.callThrough();
            telemetryObj.sendFeedback();
            expect(telemetryObj.sendFeedback).toHaveBeenCalled();
            expect(response).toEqual(jasmine.any(Object));
        });
        it('It should rerturn the inactive object', function() {
            spyOn(telemetryObj, "sendFeedback").and.callThrough();
            var response = telemetryObj.sendFeedback();
            telemetryObj.isActive = false;
            expect(response).toEqual(jasmine.any(Object));
        });
    });

    describe('Telemetry xapi function', function() {
        it('It should invoke the xapi function', function() {
            spyOn(telemetryObj, "xapi").and.callThrough();
            var response = telemetryObj.xapi();
            expect(telemetryObj.xapi).toHaveBeenCalled();
            expect(response).toEqual(jasmine.any(Object));
        });
        it('It should rerturn the inactive object', function() {
            spyOn(telemetryObj, "xapi").and.callThrough();
            var response = telemetryObj.xapi();
            telemetryObj.isActive = false;
            expect(response).toEqual(jasmine.any(Object));
        });
    });

    describe('Telemetry itemResponse function', function() {
        it('It should invoke the itemResponse function', function() {
            spyOn(telemetryObj, "itemResponse").and.callThrough();
            var response = telemetryObj.itemResponse();
            expect(telemetryObj.itemResponse).toHaveBeenCalled();
            expect(response).toEqual(jasmine.any(Object));
        });
        it('It should rerturn the inactive object', function() {
            spyOn(telemetryObj, "itemResponse").and.callThrough();
            var response = telemetryObj.itemResponse();
            telemetryObj.isActive = false;
            expect(response).toEqual(jasmine.any(Object));
        });
    });

    describe('Telemetry resume function', function() {
        it('It should invoke the resume function', function() {
            spyOn(telemetryObj, "resume").and.callThrough();
            telemetryObj.resume("9g8h4ndAnonymouscg56nge", "org.ekstep.quiz.appid");
            expect(telemetryObj.resume).toHaveBeenCalled();

            spyOn(telemetryObj, "end").and.callThrough();
            expect(telemetryObj.resume).toHaveBeenCalled();

            spyOn(telemetryObj, "init").and.callThrough();
            expect(telemetryObj.init).toHaveBeenCalled();

            spyOn(telemetryObj, "start").and.callThrough();
            expect(telemetryObj.start).toHaveBeenCalled();
        });

    });

    describe('Telemetry exit function', function() {
        it('It should invoke the exit function', function() {
            spyOn(telemetryObj, "exit").and.callThrough();
            telemetryObj.exit();
            expect(telemetryObj.exit).toHaveBeenCalled();
        });
    });

    describe('Telemetry logError function', function() {
        it('It should invoke the logError function', function() {
            spyOn(telemetryObj, "logError").and.callThrough();
            telemetryObj.logError();
            expect(telemetryObj.logError).toHaveBeenCalled();
        });
    });

    describe('Telemetry print function', function() {
        it('It should invoke the print function', function() {
            spyOn(telemetryObj, "print").and.callThrough();
            telemetryObj.print();
            expect(telemetryObj.print).toHaveBeenCalled();
        });
    });

    describe('Telemetry END function', function() {
        it('It should invoke the end function', function() {
            spyOn(telemetryObj, "end").and.callThrough();
            telemetryObj.end();
            expect(telemetryObj.end).toHaveBeenCalled();
        });
        it('It should rerturn the inactive object', function() {
            spyOn(telemetryObj, "end").and.callThrough();
            var response = telemetryObj.end();
            telemetryObj.isActive = false;
            console.log("Response", response);
            expect(response).toEqual(jasmine.any(Object));
        });
    });
});