TelemetryServiceUtil = {
    _config: {
        "isActive": true,
        "events": {
            "OE_INTERACT": {
                "eks": {
                    "type": {
                        "required": true,
                        "values": [
                            "TOUCH",
                            "DRAG",
                            "DROP",
                            "SPEAK",
                            "LISTEN",
                            "END",
                            "CHOOSE",
                            "OTHER"
                        ]
                    }
                }
            },
            "OE_INTERRUPT": {
                "eks": {
                    "type": {
                        "required": true,
                        "values": [
                            "BACKGROUND",
                            "IDLE",
                            "RESUME",
                            "SLEEP",
                            "CALL",
                            "SWITCH",
                            "LOCK",
                            "OTHER"
                        ]
                    }
                }
            }
        }
    },
    getConfig: function() {
        return new Promise(function(resolve, reject) {
            resolve(TelemetryServiceUtil._config);
        });
    }
}

// use a index to insert relative to the end or middle of the string.
String.prototype.insert = function(index, string) {
    var ind = index < 0 ? this.length + index : index;
    return this.substring(0, ind) + string + this.substring(ind, this.length);
};

// Generate Genie format ts as per Telemetry wiki
// https://github.com/ekstep/Common-Design/wiki/Telemetry
// YYYY-MM-DDThh:mm:ss+/-nn:nn
function getTime(ms) {
    var v = undefined;
    if (TelemetryService._version == "1.0") {
        // v = dateFormat(new Date(ms), "yyyy-mm-dd'T'HH:MM:ssZ").replace('GMT', '');
        // return v.insert(-2, ':');
        var dte = new Date(ms);
        dte.setTime(dte.getTime() +(dte.getTimezoneOffset()+330)*60*1000);
        v = dateFormat(dte, "yyyy-mm-dd'T'HH:MM:ss")+"+05:30";
        return v;
    } else {
        v = new Date().getTime();
        return v;
    }
}

function getCurrentTime() {
    return new Date().getTime();
}