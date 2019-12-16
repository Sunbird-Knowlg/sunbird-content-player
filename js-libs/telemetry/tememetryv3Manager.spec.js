/**
 * Telemetry V3 Library test cases
 * @author Akash Gupta <akash.gupta@tarento.com>
 */

describe("Telemetry tests", function() {
    var telemetryObj;
    beforeAll(function() {
        telemetryObj = new TelemetryV3Manager;
    });

    describe("Telemetry addPlaySession", function() {
        it("It should add play session if not added already", function() {
            var cData = [
                {
                  "id": "ceaaabd5adb1ae6a3c7ffeea2ce1e2a0",
                  "type": "ContentSession"
                }
              ];
            var returnData = [
                {
                  "id": "ceaaabd5adb1ae6a3c7ffeea2ce1e2a0",
                  "type": "ContentSession"
                },
                {
                  "id": "4bbcb989704b23d3cd3806365b6f8481",
                  "type": "PlaySession"
                }
              ];
            spyOn(telemetryObj, "addPlaySession").and.callThrough();
            spyOn(telemetryObj, "getUid").and.returnValue('4bbcb989704b23d3cd3806365b6f8481');
            var telemetryElement = telemetryObj.addPlaySession(cData);
            expect(telemetryElement).toEqual(returnData);
        })
        it("It should update play session", function() {
            var cData = [
                {
                  "id": "ceaaabd5adb1ae6a3c7ffeea2ce1e2a0",
                  "type": "ContentSession"
                },
                {
                  "id": "4bbcb989704b23d3cd3806365b6f8482",
                  "type": "PlaySession"
                }
              ];
            var returnData = [
                {
                  "id": "ceaaabd5adb1ae6a3c7ffeea2ce1e2a0",
                  "type": "ContentSession"
                },
                {
                  "id": "4bbcb989704b23d3cd3806365b6f8482",
                  "type": "PlaySession"
                }
              ];
            spyOn(telemetryObj, "addPlaySession").and.callThrough();
            spyOn(telemetryObj, "getUid").and.returnValue('4bbcb989704b23d3cd3806365b6f8482');
            var telemetryElement = telemetryObj.addPlaySession(cData);
            expect(telemetryElement).toEqual(returnData);
        })
    })
    describe("Telemetry addPlaySession", function() {
        it("It should return uniq id", function() {
            spyOn(telemetryObj, "getUid").and.callThrough();
            telemetryObj.getUid();
            expect(telemetryObj.getUid).toHaveBeenCalled();
        })
        
    })
});