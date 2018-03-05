/**
 * Plugin to create repo instance and to register repo instance
 * @extends EkstepRenderer.Plugin
 * @author sachin.kumar@goodworklabs.com>
 */
Plugin.extend({
    _type: 'org.ekstep.questionset',
    _isContainer: true,
    _render: true,
    _questionSetConfig: {
        'total_items': 1,
        'show_feedback': true,
        'shuffle_questions': false
    },
    _masterQuestionSet: [],
    _renderedQuestions: [],
    _questionStates: {},
    _currentQuestion: undefined,
    _currentQuestionState: undefined,
    _loadedTemplates: [],
    _stageObject: undefined,
    _constants: {
        questionPluginId: 'org.ekstep.question',
        qsElement: '#questionset',
        prevCSS: {
            cursor: 'pointer',
            position: 'absolute',
            width: '7.5%',
            top: '44%',
            left: '1%'
        },
        nextCSS: {
            cursor: 'pointer',
            position: 'absolute',
            width: '7.5%',
            top: '44%',
            right: '1%'
        },
        qsPrefix: 'qs',
    },
    initialize: function() {
        var ctrlPath = org.ekstep.pluginframework.pluginManager.resolvePluginResource(this._manifest.id, this._manifest.ver, "renderer/controller/questionset_ctrl.js");
        var tempPath = org.ekstep.pluginframework.pluginManager.resolvePluginResource(this._manifest.id, this._manifest.ver, "renderer/templates/questionset_template.html");
        org.ekstep.service.controller.loadNgModules(tempPath, ctrlPath);
    },
    initPlugin: function(data) {
        var instance = this;
        EkstepRendererAPI.addEventListener('renderer:content:replay', function(event) {
            instance.resetQS.call(instance);
        }, instance);
        //remove the existing listner in the same name
        EventBus.listeners['renderer:nextStage'] = [];
        EkstepRendererAPI.addEventListener('renderer:nextStage', function(event) {
            instance.renderNextQuestion.call(instance);
        }, instance);
        EkstepRendererAPI.addEventListener(instance._data.pluginType + ':saveQuestionState', function(event) {
            var state = event.target;
            instance.saveQuestionState(instance._currentQuestion.id, state);
        }, this);

         EkstepRendererAPI.addEventListener(instance._data.pluginType + ':savev1QuestionState', function(event, data) {
            var state = data;
            instance.saveQuestionState(instance._currentQuestion.id, state);
            event.target();
        }, this);

        EkstepRendererAPI.addEventListener(instance._data.pluginType + ':getQuestionState', function(event) {
            var qState =  instance.getQuestionState(event.target.qid);
            event.target.callback(qState);
        }, this);


        this.loadTemplateContainer();
        this._questionSetConfig = this._data.config ? JSON.parse(this._data.config.__cdata) : this._questionSetConfig;
        this.setupNavigation();
        var quesArray = angular.copy(data[this._constants.questionPluginId]);
        this._masterQuestionSet = _.isArray(quesArray) ? quesArray : _.toArray({
            quesArray
        });
        this._questionStates = {};
        this._renderedQuestions = [];
        var savedQSState = this.getQuestionSetState();
        if (savedQSState) {
            this._renderedQuestions = savedQSState.renderedQuestions;
            this._currentQuestion = savedQSState.currentQuestion;
            this._currentQuestionState = this.getQuestionState();
            this._questionStates = savedQSState.questionStates;
        } else {
            this._currentQuestion = this.getNextQuestion();
        }
        this.saveQuestionSetState();
        this.renderQuestion(this._currentQuestion);
    },
    renderQuestion: function(question) {
        var instance = this;

        if (this._currentQuestion) {
            EkstepRendererAPI.dispatchEvent(this._currentQuestion.pluginId + ':hide');
            // EkstepRendererAPI.dispatchEvent('org.ekstep.questionset.quiz:hide');
        }

        if (question.pluginId === 'org.ekstep.questionset.quiz') {
            // instance._stage._currentState['mcq'] = undefined;
            // EkstepRendererAPI.instantiatePlugin(question.pluginId);
            var ins = PluginManager.invoke(question.pluginId, question, this._stage, this._stage, this._theme);
            // console.log('ins', ins);
            // question.objid = "ins.id";
            this._renderedQuestions = _.union(this._renderedQuestions, [question]);
            setTimeout(function() {
                Renderer.update = true;
            }, 500);
        } else {


            this._renderedQuestions = _.union(this._renderedQuestions, [question]);

            // if (this._currentQuestion) {
            //      EkstepRendererAPI.dispatchEvent('org.ekstep.questionset.quiz:hide');
            // }
            this._currentQuestionState = this.getQuestionState(this._currentQuestion.id);
            this.loadModules(question, function() {
                setTimeout(function() {
                    EkstepRendererAPI.dispatchEvent(question.pluginId + ':show', instance);
                    instance.setupNavigation();
                }, 100);
            });
        }
        //if render question second then show custom prev navigaion
        if (this._renderedQuestions.length >= 1) this.showCustomPrevNav();
        this.setRendered(question);
        this._currentQuestion = question;
    },
    setRendered: function(question) {
        var instance = this,
            element;
        element = _.find(instance._masterQuestionSet, function(item) {
            return item.id === question.id;
        });
        element.rendered = true;
    },
    endOfQuestionSet: function() {
        return (this._renderedQuestions.length >= this._questionSetConfig.total_items);
    },
    nextQuestion: function() {
        var instance = this;
        EkstepRendererAPI.dispatchEvent(this._currentQuestion.pluginId + ":evaluate", function(result) {
            if (instance._questionSetConfig.show_feedback == true) {
                instance.displayFeedback(result.eval);

            } else {
                instance.renderNextQuestion();
            }
        });
    },
    displayFeedback: function(res) {
        if (res === true) {
            //alert('Correct Answer!');
            EkstepRendererAPI.dispatchEvent('renderer:load:popup:goodJob');
            //TODO: This will move to the feedback pop-up next button
            //this.renderNextQuestion();
        } else {
            EkstepRendererAPI.dispatchEvent('renderer:load:popup:tryAgain');
            //alert('Wrong Answer');
        }
    },
    renderNextQuestion: function() {
        // EkstepRendererAPI.removeEventListener($scope.pluginInstance._manifest.id + ":evaluate");
        var nextQ = this.getNextQuestion();
        if (nextQ) {
            this.renderQuestion(nextQ);
            this.generateNavigateTelemetry(null, this._currentQuestion.id);
        } else {
            this.saveQuestionSetState();
            this.generateNavigateTelemetry('next', 'ContentApp-EndScreen');
            EkstepRendererAPI.dispatchEvent(this._currentQuestion.pluginId + ':hide');
            this.resetNavigation();
            OverlayManager.skipAndNavigateNext();
        }
    },
    prevQuestion: function() {
        this.renderPrevQuestion();
    },
    renderPrevQuestion: function() {
        var prevQ = this.getPrevQuestion();
        if (prevQ) {
            this.renderQuestion(prevQ);
            this.generateNavigateTelemetry(null, this._currentQuestion);
        } else {
            this.saveQuestionSetState();
            this.generateNavigateTelemetry('previous', 'ContentApp-StartScreen');
            EkstepRendererAPI.dispatchEvent(this._currentQuestion.pluginId + ':hide');
            this.resetNavigation();
            OverlayManager.navigatePrevious();
        }
    },
    getNextQuestion: function() {
        var renderIndex = this.getRenderedIndex();
        if ((renderIndex + 1 >= this._renderedQuestions.length) && !this.endOfQuestionSet()) {
            var unRenderedQuestions = this._masterQuestionSet.filter(function(q) {
                return (_.isUndefined(q.rendered)) ? true : !q.rendered;
            });
            if (this._questionSetConfig.shuffle_questions) {
                return _.sample(unRenderedQuestions);
            }
            return unRenderedQuestions.shift();
        } else {
            return this._renderedQuestions[renderIndex + 1];
        }
        // Renderer.theme._currentScene._currentState = {};

    },
    getPrevQuestion: function() {
        var renderIndex = this.getRenderedIndex();
        if (renderIndex - 1 < 0) {
            return undefined;
        }
        return this._renderedQuestions[renderIndex - 1];
    },
    getRenderedIndex: function() {
        return this._renderedQuestions.indexOf(this._currentQuestion);
    },
    loadModules: function(question, callback) {
        var instance = this;
        var getPluginManifest = org.ekstep.pluginframework.pluginManager.pluginObjs[question.pluginId];
        var unitTemplates = getPluginManifest._manifest.templates;
        var templateData = _.find(unitTemplates, function(template) {
            return template.id === question.templateId;
        });
        // if (this._loadedTemplates.indexOf(templateData.id) === -1) {
        var pluginVer = (question.pluginVer === 1) ? '1.0' : question.pluginVer.toString();
        var templatePath = org.ekstep.pluginframework.pluginManager.resolvePluginResource(question.pluginId, pluginVer, templateData.renderer.template);
        var controllerPath = org.ekstep.pluginframework.pluginManager.resolvePluginResource(question.pluginId, pluginVer, templateData.renderer.controller);
        this.loadController(controllerPath, function(data) {
            instance.loadTemplate(templatePath, instance._constants.qsElement, function(data) {
                instance._loadedTemplates.push(templateData.id);
                callback();
            });
        });
        // } else {
        //   callback();
        // }
    },
    loadController: function(path, callback) {
        setTimeout(function() {
            EkstepRendererAPI.dispatchEvent('renderer:load:js', {
                path: path,
                callback: callback
            });
        }, 400);
    },
    loadTemplate: function(path, toElement, callback) {
        setTimeout(function() {
            EkstepRendererAPI.dispatchEvent('renderer:load:html', {
                path: path,
                toElement: toElement,
                callback: callback
            });
        }, 400);
    },
    loadTemplateContainer: function() {
        var qsElement = angular.element(this._constants.qsElement);
        if (qsElement.length === 0) {
            angular.element('body').append(angular.element('<div id="' + this._constants.qsElement.replace('#', '') + '"></div>'));
        }
    },
    resetNavigation: function() {
        this.showDefaultNextNav();
        this.showDefaultPrevNav();
    },
    showDefaultPrevNav: function() {
        $('#qs-custom-prev').hide();
        $('.nav-previous').show();
    },
    showDefaultNextNav: function() {
        $('#qs-custom-next').hide();
        $('.nav-next').show();
    },
    showCustomPrevNav: function() {
        $('#qs-custom-prev').show();
        $('.nav-previous').hide();
    },
    showCustomNextNav: function() {
        $('#qs-custom-next').show();
        $('.nav-next').hide();
    },
    setupNavigation: function() {
        instance = this;

        // Next
        var next = angular.element('#qs-custom-next');
        if (next.length === 0) {
            var nextButton = $('.nav-next');
            var nextImageSrc = nextButton.find('img').attr('src');

            var customNextButton = $('<img />', {
                src: nextImageSrc,
                id: 'qs-custom-next',
                class: ''
            }).css(this._constants.nextCSS);
            customNextButton.on('click', function() {
                instance.nextQuestion();
            });
            customNextButton.appendTo('#gameArea');
        }

        // Prev
        var prev = angular.element('#qs-custom-prev')
        if (prev.length === 0) {
            var prevButton = $('.nav-previous');
            var prevImageSrc = prevButton.find('img').attr('src');

            var customPrevButton = $('<img />', {
                src: prevImageSrc,
                id: 'qs-custom-prev',
                class: ''
            }).css(this._constants.prevCSS);
            customPrevButton.on('click', function() {
                instance.prevQuestion();
            });
            customPrevButton.appendTo('#gameArea');
        }
        // Show Custom Navigation
        this.showCustomNextNav();
        this.showCustomPrevNav();
    },
    getQuestionState: function(questionId) {
        return this._questionStates[questionId];
    },
    getQuestionSetState: function() {
        return Renderer.theme.getParam(this._data.id);
    },
    saveQuestionState: function(questionId, state) {
        if (state) {
            var qsState = this.getQuestionSetState();
            qsState = _.isUndefined(qsState) ? {} : qsState;
            this._questionStates[questionId] = state;
            qsState.questionStates = this._questionStates;
            Renderer.theme.setParam(this._data.id, qsState);
        }
        //TODO: Generate itemresponse telemetry here?
    },
    saveQuestionSetState: function() {
        var qsState = {
            masterQuestionSet: this._masterQuestionSet,
            renderedQuestions: this._renderedQuestions,
            currentQuestion: this._currentQuestion,
            questionStates: this._questionStates
        };
        Renderer.theme.setParam(this._data.id, qsState);
    },
    resetQS: function() {
        this.resetNavigation();
        Renderer.theme.setParam(this._data.id, undefined);
        if (this._currentQuestion) {
            EkstepRendererAPI.dispatchEvent(this._currentQuestion.pluginId + ':hide');
        }
    },
    generateNavigateTelemetry: function(buttonId, currentQuestion) {
        var instance = this;
        var stageTo, objid;
        var stageid = EkstepRendererAPI.getCurrentStageId();
        if (buttonId) {
            stageTo = EkstepRendererAPI.getCurrentStage().getParam(buttonId);
            objid = stageTo;
            objid = objid ? objid : currentQuestion;
            stageTo = stageTo ? stageTo : currentQuestion;
        } else {
            stageTo = stageid;
            objid = currentQuestion;
        }
        var data = {
            "type": "view", // Required. Impression type (list, detail, view, edit, workflow, search)
            "subtype": "Paginate", // Optional. Additional subtype. "Paginate", "Scroll"
            "pageid": stageid, // Required. Unique page id
            "uri": "", // Required. Relative URL of the content
            "visits": {
                "objid": objid,
                "objtype": ""
            }
        }
        TelemetryService.navigate(stageid, stageTo, data)
    }
});
//# sourceURL=questionSetRenderer.js