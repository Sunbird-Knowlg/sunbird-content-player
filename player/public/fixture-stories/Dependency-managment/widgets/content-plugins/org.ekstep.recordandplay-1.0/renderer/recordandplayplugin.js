/**
 * This plugin renders the org.ekstep.recordandplay and adds a set of buttons (record, play, stop) to  record and play your audio
 * @class recordandplay
 * @extends Plugin
 * @author Devendra Singh <devendra.singh@tarento.com>
 */
Plugin.extend({
    _type: 'org.ekstep.recordandplay',
    _isContainer: false,
    _render: false,
    initPlugin: function(data) {
        this._render = true;
        this._self = new createjs.Container();
        var dims = this.relativeDims();
        this._self.x = dims.x;
        this._self.y = dims.y;
        var micObj = this.getMicObj();
        var recorderObj = this.getRecorderObj();
        this.addStageEvents();
        PluginManager.invoke("g", micObj, this, this._stage, this._theme);
        PluginManager.invoke("g", recorderObj, this, this._stage, this._theme);
    },
    /**
     * This method prepares container object which contains an image object along with events
     * @memberof recordandplay
     * @return {object} m, Container object
     */
    getMicObj: function() {
        var micObject = {
            "h": "100",
            "id": "micG",
            "w": "100",
            "x": "0",
            "y": "0",
            "image": {
                "asset": "mic",
                "x": "0",
                "y": "0",
                "h": "60",
                "event": {
                    "type": "click",
                    "action": [{
                        "type": "command",
                        "command": "toggleShow",
                        "asset": "recorder"
                    }, {
                        "type": "command",
                        "command": "show",
                        "asset": "startrec"
                    }, {
                        "type": "command",
                        "command": "hide",
                        "asset": "playback"
                    }, {
                        "type": "command",
                        "command": "hide",
                        "asset": "playback2"
                    }]
                }
            }
        }
        return micObject;
    },
    /**
     * This method prepares container object which contains set of image objects along with their respective events
     * @memberof recordandplay
     * @return {object} r, Container object
     */
    getRecorderObj: function() {
        var recordObject = {
            "h": "100",
            "id": "recorder",
            "visible": false,
            "w": "100",
            "x": "0",
            "y": "0",
            "g": [{
                "h": "100",
                "id": "startrec",
                "w": "100",
                "x": "0",
                "y": "0",
                "image": {
                    "asset": "N_startrec",
                    "h": "100",
                    "x": "0",
                    "y": "0",
                    "event": {
                        "type": "click",
                        "action": {
                            "asset": "startrec",
                            "command": "startRecord",
                            "failure": "rec_start_fail",
                            "success": "rec_started",
                            "type": "command",
                            "timeout": "120000"
                        }
                    }
                }
            }, {
                "h": "100",
                "id": "stoprec",
                "visible": false,
                "w": "100",
                "x": "0",
                "y": "0",
                "shape": {
                    "fill": "#e98888",
                    "h": "2",
                    "id": "mover",
                    "type": "circle",
                    "visible": false,
                    "w": "2",
                    "x": "47",
                    "y": "45"
                },
                "image": [{
                    "asset": "N_stoprec",
                    "h": "100",
                    "x": "0",
                    "y": "0",
                    "event": {
                        "type": "click",
                        "action": {
                            "asset": "stoprec",
                            "command": "stopRecord",
                            "failure": "rec_stop_failed",
                            "success": "rec_stopped",
                            "type": "command"
                        }
                    }
                }, {
                    "asset": "N_stoprec2",
                    "h": "100",
                    "x": "0",
                    "y": "0",
                    "event": {
                        "type": "click",
                        "action": {
                            "asset": "stoprec",
                            "command": "stopRecord",
                            "failure": "rec_stop_failed",
                            "success": "rec_stopped",
                            "type": "command"
                        }
                    }
                }]
            }, {
                "h": "100",
                "id": "playback",
                "visible": false,
                "w": "100",
                "x": "0",
                "y": "0",
                "image": {
                    "asset": "N_playrec",
                    "h": "100",
                    "x": "0",
                    "y": "0",
                    "event": {
                        "type": "click",
                        "action": [{
                            "asset": "current_rec",
                            "command": "TOGGLEPLAY",
                            "type": "command"
                        }, {
                            "asset": "playback2",
                            "command": "show",
                            "type": "command"
                        }, {
                            "asset": "playback",
                            "command": "hide",
                            "type": "command"
                        }, {
                            "asset": "N_playrec",
                            "command": "show",
                            "type": "command"
                        }, {
                            "asset": "N_playrec",
                            "type": "animation",
                            "tween": {
                                "id": "N_playrec",
                                "loop": "true",
                                "to": [{
                                    "duration": 0,
                                    "ease": "linear",
                                    "__cdata": { "x": 0, "y": 0 }
                                }, {
                                    "duration": 1000,
                                    "ease": "sineInOut",
                                    "__cdata": { "x": 0, "y": 0 }
                                }, {
                                    "duration": 0,
                                    "ease": "linear",
                                    "__cdata": { "x": -100000, "y": -100000 }
                                }, {
                                    "duration": 1000,
                                    "ease": "linear",
                                    "__cdata": { "x": -100000, "y": -100000 }
                                }]

                            }
                        }, {
                            "asset": "N_playrec2",
                            "command": "show",
                            "type": "command"
                        }, {
                            "asset": "N_playrec2",
                            "type": "animation",
                            "tween": {
                                "id": "N_playrec2",
                                "loop": "true",
                                "to": [{
                                    "duration": 0,
                                    "ease": "linear",
                                    "__cdata": { "x": -100000, "y": -100000 }
                                }, {
                                    "duration": 1000,
                                    "ease": "linear",
                                    "__cdata": { "x": -100000, "y": -100000 }
                                }, {
                                    "duration": 0,
                                    "ease": "linear",
                                    "__cdata": { "x": 0, "y": 0 }
                                }, {
                                    "duration": 1000,
                                    "ease": "sineInOut",
                                    "__cdata": { "x": 0, "y": 0 }
                                }, {
                                    "duration": 0,
                                    "ease": "linear",
                                    "__cdata": { "x": -100000, "y": -100000 }
                                }]

                            }
                        }]
                    }
                }
            }, {
                "h": "100",
                "id": "playback2",
                "visible": false,
                "w": "100",
                "x": "0",
                "y": "0",
                "image": [{
                    "asset": "N_playrec",
                    "h": "100",
                    "x": "0",
                    "y": "0",
                    "event": {
                        "type": "click",
                        "action": [{
                            "asset": "current_rec",
                            "command": "stop",
                            "type": "command"
                        }, {
                            "asset": "recorder",
                            "command": "hide",
                            "type": "command"
                        }, {
                            "asset": "mic",
                            "command": "show",
                            "type": "command"
                        }]
                    }
                }, {
                    "asset": "N_playrec2",
                    "h": "100",
                    "x": "0",
                    "y": "0",
                    "event": {
                        "type": "click",
                        "action": [{
                            "asset": "current_rec",
                            "command": "stop",
                            "type": "command"
                        }, {
                            "asset": "recorder",
                            "command": "hide",
                            "type": "command"
                        }, {
                            "asset": "mic",
                            "command": "show",
                            "type": "command"
                        }]
                    }
                }]
            }]
        }

        recordObject.g["z-index"] = 500;
        return recordObject;
    },

    /**
     * This method adds events("rec_started" and "rec_stopped") with their set of actions, to the stage
     * @memberof recordandplay
     */
    addStageEvents: function() {
        this._stage._data.events = {
            "event": [{
                    "type": "rec_started",
                    "action": [{
                        "type": "command",
                        "command": "show",
                        "asset": "stoprec"

                    }, {
                        "type": "command",
                        "command": "show",
                        "asset": "N_stoprec"

                    }, {
                        "type": "animation",
                        "asset": "N_stoprec",
                        "tween": {
                            "id": "N_stoprec",
                            "loop": "true",
                            "to": [{
                                "duration": 0,
                                "ease": "linear",
                                "__cdata": { "x": 0, "y": 0 }
                            }, {
                                "duration": 1000,
                                "ease": "sineInOut",
                                "__cdata": { "x": 0, "y": 0 }
                            }, {
                                "duration": 0,
                                "ease": "linear",
                                "__cdata": { "x": -100000, "y": -100000 }
                            }, {
                                "duration": 1000,
                                "ease": "sineInOut",
                                "__cdata": { "x": -100000, "y": -100000 }
                            }]

                        }
                    }, {
                        "type": "command",
                        "command": "show",
                        "asset": "N_stoprec2"

                    }, {
                        "type": "animation",
                        "asset": "N_stoprec2",
                        "tween": {
                            "id": "N_stoprec2",
                            "loop": "true",
                            "to": [{
                                "duration": 0,
                                "ease": "linear",
                                "__cdata": { "x": -100000, "y": -100000 }
                            }, {
                                "duration": 1000,
                                "ease": "linear",
                                "__cdata": { "x": -100000, "y": -100000 }
                            }, {
                                "duration": 0,
                                "ease": "linear",
                                "__cdata": { "x": 0, "y": 0 }
                            }, {
                                "duration": 1000,
                                "ease": "sineInOut",
                                "__cdata": { "x": 0, "y": 0 }
                            }, {
                                "duration": 0,
                                "ease": "linear",
                                "__cdata": { "x": -100000, "y": -100000 }
                            }]

                        }
                    }]

                }, {
                    "type": "rec_stopped",
                    "action": [{
                        "type": "command",
                        "command": "hide",
                        "asset": "stoprec"

                    }, {
                        "type": "command",
                        "command": "hide",
                        "asset": "N_stoprec"

                    }, {
                        "type": "command",
                        "command": "hide",
                        "asset": "N_stoprec2"

                    }, {
                        "type": "command",
                        "command": "show",
                        "asset": "playback"

                    }, {
                        "type": "command",
                        "command": "hide",
                        "asset": "startrec"

                    }, {
                        "type": "command",
                        "command": "hide",
                        "asset": "mic"

                    }]

                }

            ]

        }
    }

});
