
var telemetryTest = undefined;
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
});

describe('Telemetry Impression Test Cases', function() {
    it('impression', function() {
        telemetryTest.impression();
        expect(telemetryTest.impression).toHaveBeenCalled();
        expect(telemetryTest.impression.calls.count()).toEqual(1);
    });
});

describe('Telemetry interact Test Cases', function() {
    it('interact', function() {
        telemetryTest.interact();
        expect(telemetryTest.interact).toHaveBeenCalled();
        expect(telemetryTest.interact.calls.count()).toEqual(1);
    });
});

describe('Telemetry startAssessment Test Cases', function() {
    it('startAssessment', function() {
        telemetryTest.startAssessment();
        expect(telemetryTest.startAssessment).toHaveBeenCalled();
        expect(telemetryTest.startAssessment.calls.count()).toEqual(1);
    });
});

describe('Telemetry endAssessment Test Cases', function() {
    it('endAssessment', function() {
        telemetryTest.endAssessment();
        expect(telemetryTest.endAssessment).toHaveBeenCalled();
        expect(telemetryTest.endAssessment.calls.count()).toEqual(1);
    });
});

describe('Telemetry response Test Cases', function() {
    it('response', function() {
        telemetryTest.response();
        expect(telemetryTest.response).toHaveBeenCalled();
        expect(telemetryTest.response.calls.count()).toEqual(1);
    });
});

describe('Telemetry interrupt Test Cases', function() {
    it('interrupt', function() {
        telemetryTest.interrupt();
        expect(telemetryTest.interrupt).toHaveBeenCalled();
        expect(telemetryTest.interrupt.calls.count()).toEqual(1);
    });
});

describe('Telemetry error Test Cases', function() {
    it('error', function() {
        telemetryTest.error();
        expect(telemetryTest.error).toHaveBeenCalled();
        expect(telemetryTest.error.calls.count()).toEqual(1);
    });
});

describe('Telemetry end Test Cases', function() {
    it('end', function() {
        telemetryTest.end();
        expect(telemetryTest.end).toHaveBeenCalled();
        expect(telemetryTest.end.calls.count()).toEqual(1);
    });
});

describe('Telemetry exdata Test Cases', function() {
    it('exdata', function() {
        telemetryTest.exdata();
        expect(telemetryTest.exdata).toHaveBeenCalled();
        expect(telemetryTest.exdata.calls.count()).toEqual(1);
    });
});
