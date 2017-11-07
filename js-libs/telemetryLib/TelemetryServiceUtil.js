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

// Generate Genie format ts as per Telemetry wiki
// https://github.com/ekstep/Common-Design/wiki/Telemetry
// YYYY-MM-DDThh:mm:ss+/-nn:nn

function getCurrentTime() {
    return new Date().getTime();
}
