// TODO: Temporary solution: To handle Questionset backward compatibility (online streaming in mobile)
var qspatch = {
    getPluginInstance: function(pluginObj){
        if(pluginObj){
            return pluginObj;
        } else {
            return false;
        }
    },
    handleAssetUrl : function() {

        var pluginInst = this.getPluginInstance(org.ekstep.contentrenderer.questionUnitPlugin);
        this.setPluginUrl(pluginInst, "AssetUrl");

        pluginInst = this.getPluginInstance(org.ekstep.questionunitmcq && org.ekstep.questionunitmcq.RendererPlugin);
        this.setPluginUrl(pluginInst, "AssetUrl");

        pluginInst = this.getPluginInstance(org.ekstep.keyboard && org.ekstep.contentrenderer.keyboardRenderer);
        this.setPluginUrl(pluginInst, "AssetUrl");

        pluginInst = this.getPluginInstance(org.ekstep.contentrenderer.questionUnitPlugin);
        this.setPluginUrl(pluginInst, "AudioUrl");

        pluginInst = this.getPluginInstance(org.ekstep.contentrenderer.questionUnitPlugin);
        this.setPluginUrl(pluginInst, "iconUrl");
    },
    setPluginUrl: function(pluginObj, urlType){
        var instance = this;
        if(!pluginObj) {
            return;
        }

        switch (urlType) {
            case "AssetUrl":
                pluginObj.prototype.getAssetUrl = function (url) {
                    if (isbrowserpreview) {
                        return instance.validateUrl(url);
                    } else {
                        if (EkstepRendererAPI.isStreamingContent()) {
                            // mobile online streaming
                            if(url)
                            return instance.validateUrl(EkstepRendererAPI.getBaseURL() + url.substring(1, url.length));
                        } else {
                            // Loading content from mobile storage ( OFFLINE )
                            return instance.validateUrl('file:///' + EkstepRendererAPI.getBaseURL() + url);
                        }
                    }
                }
                break;

            case "AudioUrl":
                pluginObj.prototype.getIcon = function (path, pluginId, pluginVer) {
                    if (isbrowserpreview) {
                        return instance.validateUrl(this.getAssetUrl(org.ekstep.pluginframework.pluginManager.resolvePluginResource(pluginId, pluginVer, path)));
                    } else {
                        if (EkstepRendererAPI.isStreamingContent()) {
                            // mobile online streaming
                            if(path)
                            return instance.validateUrl(EkstepRendererAPI.getBaseURL() + 'content-plugins/' + pluginId + '-' + pluginVer + '/' +path);
                            //return org.ekstep.pluginframework.pluginManager.resolvePluginResource(pluginId, pluginVer, path);
                        } else {
                            // Loading content from mobile storage ( OFFLINE )
                            return instance.validateUrl('file:///' + EkstepRendererAPI.getBaseURL() + 'content-plugins/' + pluginId + '-' + pluginVer + '/' + path);
                        }
                    }
                }
            break;

            case "iconUrl":
                pluginObj.prototype.getAudioIcon = function (path) {
                    if (isbrowserpreview) {
                        return instance.validateUrl(this.getAssetUrl(org.ekstep.pluginframework.pluginManager.resolvePluginResource(this._manifest.id, this._manifest.ver, path)));
                    } else {
                        if (EkstepRendererAPI.isStreamingContent()) {
                            // mobile online streaming
                            if(path)
                            return instance.validateUrl(EkstepRendererAPI.getBaseURL() + 'content-plugins/' + this._manifest.id + '-' + this._manifest.ver + '/' + path);
                            //return org.ekstep.pluginframework.pluginManager.resolvePluginResource(this._manifest.id, this._manifest.ver, path);
                        } else {
                            // Loading content from mobile storage ( OFFLINE )
                            return instance.validateUrl('file:///' + EkstepRendererAPI.getBaseURL() + 'content-plugins/' + this._manifest.id + '-' + this._manifest.ver + '/' + path);
                        }
                    }
                }
            break;

            default:
                break;
        }

    },
    validateUrl: function(url){
        if(!url){
            return
        }
        var regex = new RegExp("^(http|https)://", "i");
        if(regex.test(url)){
            var tempUrl = url.split("://")
            if (tempUrl.length > 1){
                var validString = tempUrl[1].split("//").join("/");
                return [tempUrl[0], validString].join("://");
            }
        }else{
            var tempUrl = url.split(":///")
            if (tempUrl.length > 1){
                var validString = tempUrl[1].split("//").join("/");;
                return [tempUrl[0], validString].join(":///");
            }
        }
        return url.split("//").join("/");
    },
    telemetryPatch: function() {
        var _super_logAssessEnd = QSTelemetryLogger.logAssessEnd; // Reference to the original function, For new assessments telemetry should be handled as it is
        var instance = this;
        var qsPlugins = {
            'ftb': {
                'id': 'org.ekstep.questionunit.ftb',
                'versions': ['1.0'],
                'patchHandler': instance.ftbPatchHandler
            },
            'reorder': {
                'id': 'org.ekstep.questionunit.reorder',
                'versions': ['1.0'],
                'patchHandler': instance.reorderPatchHandler
            },
            'sequence': {
                'id': 'org.ekstep.questionunit.sequence',
                'versions': ['1.0'],
                'patchHandler': instance.sequencePatchHandler
            },
            'mcq': {
                'id': 'org.ekstep.questionunit.mcq',
                'versions': ['1.0', '1.1'],
                'patchHandler': instance.mcqPatchHandler
            },
            'mtf': {
                'id': 'org.ekstep.questionunit.mtf',
                'versions': ['1.0', '1.1'],
                'patchHandler': instance.mtfPatchHandler
            }
        }
        // New function over-ride
        QSTelemetryLogger.logAssessEnd = function(result) {
            var plugin = {
                'id': this._plugin._manifest.id,
                'ver': this._plugin._manifest.ver,
            }
            var pluginToPatch;
            var isPatchRequired = false;
            Object.keys(qsPlugins).forEach(function(pluginShortHand) {
                if (plugin.id == qsPlugins[pluginShortHand].id && qsPlugins[pluginShortHand].versions.includes(plugin.ver)) {
                    pluginToPatch = pluginShortHand;
                    isPatchRequired = true;
                }
            })
            if (isPatchRequired == false) {
                return _super_logAssessEnd.call(this, result);
            }
            var tuple = {
                'params': [],
                'resvalues': []
            }
            try {
                qsPlugins[pluginToPatch].patchHandler.call(this, instance, result, tuple);
                var data = instance.generateTelemetryData.call(this, result, tuple);
                data.type = pluginToPatch;
                TelemetryService.assessEnd(this._assessStart, data);
            } catch (err) {
                console.log(err);
            }
        }
    },
    ftbPatchHandler: function(instance, result, tuple) {
        this._plugin._question.data.answer.forEach(function(expected, index) {
            var objProperty, objToPush = {};
            objProperty = index + 1
            objToPush[objProperty] = JSON.stringify({
                'text': expected
            });
            tuple.params.push(objToPush)
        })
        if (this._plugin._question.config.evalUnordered) {
            tuple.params.push({
                'eval': "unorder"
            })
        } else {
            tuple.params.push({
                'eval': "order"
            })
        }
        result.values.forEach(function(actual, index) {
            if (actual.key) {
                var objProperty, objToPush = {};
                objProperty = index + 1
                objToPush[objProperty] = JSON.stringify({
                    'text': actual.key
                });
                tuple.resvalues.push(objToPush)
            }
        })
    },
    mcqPatchHandler: function(instance, result, tuple) {
        result.state.options.forEach(function(option, index) {
            var objProperty, objToPush = {};
            objProperty = index + 1;
            objToPush[objProperty] = instance.generateTelemetryTupleValue(option);
            tuple.params.push(objToPush)
        });
        var correctAnwserIndex = result.state.options.findIndex(function(option) {
            return option.isCorrect == true;
        })
        tuple.params.push({
            "answer": JSON.stringify({
                "correct": [(correctAnwserIndex + 1) + '']
            })
        })
        if (result.state.options && result.state.options[result.state.val]) {
            objToPush = {};
            objProperty = Number(result.state.val) + 1;
            objToPush[objProperty] = instance.generateTelemetryTupleValue(result.state.options[result.state.val]);
            tuple.resvalues.push(objToPush);
        }
    },
    mtfPatchHandler: function(instance, result, tuple) {
        var lhsParamsAndResValue = [];
        var rhsParams = [];
        var answer = {
            lhs: [],
            rhs: []
        }
        var qsTelemetryLogger = this;
        this._plugin._question.data.option.optionsRHS.forEach(function(rhs, index) {
            var objProperty, objToPush = {};
            var lhs = qsTelemetryLogger._plugin._question.data.option.optionsLHS[index];
            objProperty = index + 1;
            objToPush[objProperty] = instance.generateTelemetryTupleValue(lhs)
            lhsParamsAndResValue.push(objToPush);

            objToPush = {};
            objToPush[objProperty] = instance.generateTelemetryTupleValue(rhs);
            rhsParams.push(objToPush);
            answer.lhs.push((index + 1) + '');
            answer.rhs[rhs.mapIndex - 1] = '' + (index + 1);
        })
        tuple.params.push({
            'lhs': JSON.stringify(lhsParamsAndResValue)
        })
        tuple.params.push({
            'rhs': JSON.stringify(rhsParams)
        })
        tuple.params.push({
            'answer': JSON.stringify(answer)
        });
        var rhsResvalues = [];
        if (result.state && result.state.val && result.state.val.rhs_rearranged) {
            // Handler for MTF-1.1
            result.state.val.rhs_rearranged.forEach(function(rhsIndex, index) {
                var objProperty, objToPush = {};
                objProperty = index + 1;
                objToPush[objProperty] = instance.generateTelemetryTupleValue(result.state.rhs_rendered.find(function(rhs) {
                    return rhs.mapIndex == rhsIndex;
                }))
                rhsResvalues.push(objToPush);
            })
        } else {
            // Handler for MTF-1.0
            qsTelemetryLogger._plugin._selectedAnswers && Object.keys(qsTelemetryLogger._plugin._selectedAnswers).forEach(function(key) {
                var objProperty, objToPush = {};
                objProperty = Number(key) + 1;
                value = qsTelemetryLogger._plugin._question.data.option.optionsRHS.find(function(rhs) {
                    return rhs.mapIndex == qsTelemetryLogger._plugin._selectedAnswers[key].mapIndex;
                })
                objToPush[objProperty] = instance.generateTelemetryTupleValue(value);
                rhsResvalues.push(objToPush);
            })
        }
        tuple.resvalues.push({
            'lhs': JSON.stringify(lhsParamsAndResValue)
        })
        tuple.resvalues.push({
            'rhs': JSON.stringify(rhsResvalues)
        })
    },
    reorderPatchHandler: function(instance, result, tuple) {
        var answer = {
            seq: []
        };
        result.state.keys.forEach(function(key, index) {
            var objProperty, objToPush = {};
            delete key.$$hashKey; // reorder 1.0 sending with $$hashKey property
            objProperty = index + 1;
            objToPush[objProperty] = instance.generateTelemetryTupleValue(key);
            answer.seq.push((Number(key.id) + 1) + '');
            tuple.params.push(objToPush)
        })
        tuple.params.push({
            'answer': JSON.stringify(answer)
        })
        result.state.val.forEach(function(selectedWord) {
            var objProperty, objToPush = {};
            objProperty = result.state.keys.findIndex(function(key, index) {
                if (key.text == selectedWord.text) {
                    // handling cases incase two same words are present in the reorder sequence and if already one added to result
                    if (Object.keys(tuple.resvalues).includes(index + 1) == false) {
                        return true;
                    }
                }
            })
            objToPush[objProperty + 1] = instance.generateTelemetryTupleValue(selectedWord);
            tuple.resvalues.push(objToPush)
        })
    },
    sequencePatchHandler: function(instance, result, tuple) {
        var answer = {
            seq: []
        }
        result.state.val.seq_rearranged.forEach(function(seqIndex, index) {
            var objProperty, objToPush = {};
            objProperty = index + 1;
            objToPush[objProperty] = instance.generateTelemetryTupleValue(result.state.seq_rendered[index]);
            tuple.params.push(objToPush)
            answer.seq.push(result.state.seq_rendered[index]['sequenceOrder'] + '')
            objToPush = {};
            objToPush[objProperty] = instance.generateTelemetryTupleValue(result.state.seq_rendered.find(function(seq) {
                return seq.sequenceOrder == seqIndex;
            }))
            tuple.resvalues.push(objToPush);
        })
        tuple.params.push({
            'answer': JSON.stringify(answer)
        });
    },
    generateTelemetryData: function(result, tuple) {
        var quesTitle, quesDesc, quesScore;
        if (this._qData.questionnaire) {
            for (var quesIdentifier in this._qData.questionnaire.items) {
                if (this._qData.questionnaire.items.hasOwnProperty(quesIdentifier)) {
                    quesTitle = this._qData.questionnaire.items[quesIdentifier][0].title;
                    quesDesc = this._qData.questionnaire.items[quesIdentifier][0].description;
                    quesScore = result.pass != 0 ? this._qData.questionnaire.items[quesIdentifier][0].max_score : 0;
                }
            }
        } else {
            quesTitle = this._qConfig.metadata.title;
            quesDesc = this._qConfig.metadata.description ? this._qConfig.metadata.description : '';
            quesScore = parseFloat((result.score).toFixed(2));
        }
        var data = {
            eventVer: "3.1",
            pass: result.eval,
            score: quesScore,
            res: tuple.resvalues,
            qindex: this._question.index,
            qtitle: quesTitle,
            params: tuple.params,
            qdesc: quesDesc,
            mc: [],
            mmc: []
        };
        return data;
    },
    generateTelemetryTupleValue: function(data) {
        var extractHTML = function(element) {
            var ele = $.parseHTML(element);
            return $(ele).text();
        };
        //upon stringifying an object, if a property value is undefined the property will be deleted during the process
        return JSON.stringify({
            'text': data.text ? extractHTML(data.text) : undefined,
            'image': data.image ? data.image : undefined,
            'audio': data.audio ? data.audio : undefined,
        })
    }
}
