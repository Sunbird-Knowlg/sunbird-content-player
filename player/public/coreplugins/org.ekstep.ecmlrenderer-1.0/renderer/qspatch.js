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
                            return instance.validateUrl(EkstepRendererAPI.getBaseURL() + url);
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
                            return instance.validateUrl(EkstepRendererAPI.getBaseURL() + 'content-plugins/' + pluginId + '-' + pluginVer + '/' + path);
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
                            return instance.validateUrl(EkstepRendererAPI.getBaseURL() + 'content-plugins/' + this._manifest.id + '-' + this._manifest.ver + '/' + path);
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
        var qsPlugins = [
            {
                'id': 'org.ekstep.questionunit.ftb',
                'versions': ['1.0'],
                'patchHandler': qspatch.ftbPatchHandler,
                'type':'ftb'
            },
            {
                'id': 'org.ekstep.questionunit.reorder',
                'versions': ['1.0'],
                'patchHandler': qspatch.reorderPatchHandler,
                'type' : 'reorder'
            },
            {
                'id': 'org.ekstep.questionunit.sequence',
                'versions': ['1.0'],
                'patchHandler': qspatch.sequencePatchHandler,
                'type' : 'sequence'
            },
            {
                'id': 'org.ekstep.questionunit.mcq',
                'versions': ['1.0', '1.1'],
                'patchHandler': qspatch.mcqPatchHandler,
                'type' : 'mcq'
            },
            {
                'id': 'org.ekstep.questionunit.mtf',
                'versions': ['1.0', '1.1'],
                'patchHandler': qspatch.mtfPatchHandler,
                'type' : 'mtf'
            }
        ]
        var isPatchRequired = false;
        qsPlugins.every(function(plugin){
            var isPatchPluginExist = Object.keys(org.ekstep.pluginframework.pluginManager.plugins).includes(plugin.id)
            if(isPatchPluginExist){
                var pluginObj = org.ekstep.pluginframework.pluginManager.plugins[plugin.id];
                if(plugin.versions.includes(pluginObj.m.ver)){
                    isPatchRequired = true;
                    return false; //break
                }
            }
            return true; //continue
        })
        if(isPatchRequired == false || typeof QSTelemetryLogger == undefined) return false;
        // Function over-ride
        var super_QSTelemetryLogger_logAssessEnd = QSTelemetryLogger.logAssessEnd; //reference to original, if error thrown from patch code, original function will invoked as a fallback mechanism
        QSTelemetryLogger.logAssessEnd = function(result) {
            try{ // if any error occurs, default logAssessEnd Event will be invoked
                var pluginToPatch;
                qsPlugins.every(function(plugin){
                    if(plugin.id == this._plugin._manifest.id){
                        pluginToPatch = plugin;
                        return false;
                    }
                    return true;
                }, this)
                var tuple = {
                    'params': [],
                    'resvalues': []
                }
                pluginToPatch.patchHandler.call(this, result, tuple); // tuple object will be updated as a result of calling the patchHandler function
                var data = qspatch.generateTelemetryData.call(this, result, tuple);
                data.type = pluginToPatch.type;
                TelemetryService.assessEnd(this._assessStart, data);
            }catch(err){
                EkstepRendererAPI.logErrorEvent(err, { 'severity': 'error', 'type': 'plugin', 'action': 'play' });
                super_QSTelemetryLogger_logAssessEnd(result);
            }
        }
    },
    ftbPatchHandler: function(result, tuple) {
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
    mcqPatchHandler: function(result, tuple) {
        result.state.options.forEach(function(option, index) {
            var objProperty, objToPush = {};
            objProperty = index + 1;
            objToPush[objProperty] = qspatch.generateTelemetryTupleValue(option);
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
            objToPush[objProperty] = qspatch.generateTelemetryTupleValue(result.state.options[result.state.val]);
            tuple.resvalues.push(objToPush);
        }
    },
    mtfPatchHandler: function(result, tuple) {
        var lhsParamsAndResValue = [];
        var rhsParams = [];
        var answer = {
            lhs: [],
            rhs: []
        }
        this._plugin._question.data.option.optionsRHS.forEach(function(rhs, index) {
            var objProperty, objToPush = {};
            var lhs = this._plugin._question.data.option.optionsLHS[index];
            objProperty = index + 1;
            objToPush[objProperty] = qspatch.generateTelemetryTupleValue(lhs)
            lhsParamsAndResValue.push(objToPush);

            objToPush = {};
            objToPush[objProperty] = qspatch.generateTelemetryTupleValue(rhs);
            rhsParams.push(objToPush);
            answer.lhs.push((index + 1) + '');
            answer.rhs[rhs.mapIndex - 1] = '' + (index + 1);
        }, this)
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
                objToPush[objProperty] = qspatch.generateTelemetryTupleValue(result.state.rhs_rendered.find(function(rhs) {
                    return rhs.mapIndex == rhsIndex;
                }))
                rhsResvalues.push(objToPush);
            })
        } else {
            // Handler for MTF-1.0
            this._plugin._selectedAnswers && Object.keys(this._plugin._selectedAnswers).forEach(function(key) {
                var objProperty, objToPush = {};
                objProperty = Number(key) + 1;
                value = this._plugin._question.data.option.optionsRHS.find(function(rhs) {
                    return rhs.mapIndex == this._plugin._selectedAnswers[key].mapIndex;
                })
                objToPush[objProperty] = qspatch.generateTelemetryTupleValue(value);
                rhsResvalues.push(objToPush);
            }, this)
        }
        tuple.resvalues.push({
            'lhs': JSON.stringify(lhsParamsAndResValue)
        })
        tuple.resvalues.push({
            'rhs': JSON.stringify(rhsResvalues)
        })
    },
    reorderPatchHandler: function(result, tuple) {
        var answer = {
            seq: []
        };
        result.state.keys.forEach(function(key, index) {
            var objProperty, objToPush = {};
            delete key.$$hashKey; // reorder 1.0 sending with $$hashKey property
            objProperty = index + 1;
            objToPush[objProperty] = qspatch.generateTelemetryTupleValue(key);
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
            objToPush[objProperty + 1] = qspatch.generateTelemetryTupleValue(selectedWord);
            tuple.resvalues.push(objToPush)
        })
    },
    sequencePatchHandler: function(result, tuple) {
        var answer = {
            seq: []
        }
        result.state.val.seq_rearranged.forEach(function(seqIndex, index) {
            var objProperty, objToPush = {};
            objProperty = index + 1;
            objToPush[objProperty] = qspatch.generateTelemetryTupleValue(result.state.seq_rendered[index]);
            tuple.params.push(objToPush)
            var answerIndex = result.state.seq_rendered.findIndex(function(seq){
                if(Number(seq.sequenceOrder) == index+1){
                    return true;
                }
            })
            answer.seq.push((answerIndex+1) + '')
            objToPush = {};
            objProperty = result.state.seq_rendered.findIndex(function(seq){
                if(seq.sequenceOrder == seqIndex){
                    return true;
                }
            })
            objToPush[objProperty + 1] = qspatch.generateTelemetryTupleValue(result.state.seq_rendered.find(function(seq) {
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
    },
    //Make default font size for question options
    setDefaultFontSize: function(data){
      if(data.stage['org.ekstep.questionset']){
        try {
          var questionSetData = data.stage['org.ekstep.questionset'];
          _.each(questionSetData['org.ekstep.question'],function(item,key){
              var questionData = JSON.parse(item.data.__cdata);
              questionData.question.text = qspatch.changeFontSize(questionData.question);
              item.data.__cdata = JSON.stringify(questionData);
              item = qspatch.checkOptionsFontSize(item);
              questionSetData['org.ekstep.question'][key] = item;
          });
          // Renderer.theme = new ThemePlugin(questionSetData);
        } catch (e) {
            console.log(e);
        }
      }
    },
    checkOptionsFontSize: function(item){
      var questionItem = item;
      var questionOptionsData = JSON.parse(item.data.__cdata);

      switch (item.pluginId) {
        case 'org.ekstep.questionunit.mcq':
        case 'org.ekstep.questionunit.sequence':
              questionOptionsData.options = qspatch.changeOptionsFontSize(questionOptionsData.options,item.type);
              questionItem.data.__cdata = JSON.stringify(questionOptionsData);
              break;
        case 'org.ekstep.questionunit.mtf':
              questionOptionsData.option.optionsLHS = qspatch.changeOptionsFontSize(questionOptionsData.option.optionsLHS,item.type);
              questionOptionsData.option.optionsRHS = qspatch.changeOptionsFontSize(questionOptionsData.option.optionsRHS,item.type);
              questionItem.data.__cdata = JSON.stringify(questionOptionsData);
              break;
        default: break;

      }
      return questionItem;
    },
    changeOptionsFontSize: function(options,type){
      var optionsData = options;
      if(type == 'mcq'){
        _.each(options,function(option,key){
          optionsData[key].text = qspatch.changeFontSize(option);
        });
      }else if(type == 'mtf'){
        _.each(options,function(option,key){
          optionsData[key].text = '<p style="' + globalConfig.questionMinFontSize + '">' + optionsData[key].text + '</p>';
        });
      }
      return optionsData;
    },
    changeFontSize: function(data){
      var index = data.text.indexOf("<p><span");

      if(index == 0){
          var element = $($.parseHTML(data.text));
          var size = $(element)[0].children[0].style.fontSize;
          if(parseFloat(size) <= parseFloat(globalConfig.questionMinFontSize)){
            $(element)[0].children[0].style.fontSize = globalConfig.questionMinFontSize;
            data.text = $(element).prop('outerHTML');
          }
          return data.text;
      }else if(index == -1){
        return data.text.replace(/<p>/g, "<p style='font-size:" + globalConfig.questionMinFontSize + ";'>");
      }
    }
}
