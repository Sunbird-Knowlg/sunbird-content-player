
var telemetryTest;
beforeEach(function(done) {
    telemetryTest = new Telemetry();
    spyOn(telemetryTest, 'start').and.callThrough();
    spyOn(telemetryTest, 'impression').and.callThrough();
    spyOn(telemetryTest, 'interact').and.callThrough();
    spyOn(telemetryTest, 'startAssessment').and.callThrough();
    spyOn(telemetryTest, 'endAssessment').and.callThrough();
    spyOn(telemetryTest, 'response').and.callThrough();
    spyOn(telemetryTest, 'interrupt').and.callThrough();
    spyOn(telemetryTest, 'error').and.callThrough();
    spyOn(telemetryTest, 'end').and.callThrough();
    spyOn(telemetryTest, 'exdata').and.callThrough();
    done();
});

describe('Telemetry Start Test Cases', function() {
    it('start', function() {
        telemetryTest.start();
        expect(telemetryTest.start).toHaveBeenCalled();
        expect(telemetryTest.start.calls.count()).toEqual(1);
    });

    it('impression', function() {
        telemetryTest.impression();
        expect(telemetryTest.impression).toHaveBeenCalled();
        expect(telemetryTest.impression.calls.count()).toEqual(1);
    });

    it('interact', function() {
        telemetryTest.interact();
        expect(telemetryTest.interact).toHaveBeenCalled();
        expect(telemetryTest.interact.calls.count()).toEqual(1);
    });

    it('startAssessment', function() {
        telemetryTest.startAssessment();
        expect(telemetryTest.startAssessment).toHaveBeenCalled();
        expect(telemetryTest.startAssessment.calls.count()).toEqual(1);
    });

    it('endAssessment', function() {
        telemetryTest.endAssessment();
        expect(telemetryTest.endAssessment).toHaveBeenCalled();
        expect(telemetryTest.endAssessment.calls.count()).toEqual(1);
    });

    it('response', function() {
        telemetryTest.response();
        expect(telemetryTest.response).toHaveBeenCalled();
        expect(telemetryTest.response.calls.count()).toEqual(1);
    });

    it('interrupt', function() {
        telemetryTest.interrupt();
        expect(telemetryTest.interrupt).toHaveBeenCalled();
        expect(telemetryTest.interrupt.calls.count()).toEqual(1);
    });

    it('error', function() {
        telemetryTest.error();
        expect(telemetryTest.error).toHaveBeenCalled();
        expect(telemetryTest.error.calls.count()).toEqual(1);
    });

    it('end', function() {
        telemetryTest.end();
        expect(telemetryTest.end).toHaveBeenCalled();
        expect(telemetryTest.end.calls.count()).toEqual(1);
    });

    it('exdata', function() {
        telemetryTest.exdata();
        expect(telemetryTest.exdata).toHaveBeenCalled();
        expect(telemetryTest.exdata.calls.count()).toEqual(1);
    });
});
