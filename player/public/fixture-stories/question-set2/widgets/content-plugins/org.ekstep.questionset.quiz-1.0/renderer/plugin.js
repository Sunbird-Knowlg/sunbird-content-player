Plugin.extend({
    _type: 'org.ekstep.questionset.quiz',
    _isContainer: true,
    _render: true,
    _pluginConfig: {},
    _pluginData: {},
    _pluginAttributes: {},
    _instance: undefined,
    initPlugin: function(data) {
        // this._stage._currentState = undefined;
        var instance = this;
        this._instance = this;
        var fontsize = data.fontsize || 20;

        // Init self container
        var dims = this.relativeDims();
        this._self = new createjs.Container();
        this._self.x = dims.x;
        this._self.y = dims.y;
        this._self.w = dims.w;
        this._self.h = dims.h;

        // parse config of the quiz json
        this._pluginConfig = JSON.parse(data.config.__cdata);
        this._pluginData = JSON.parse(data.data.__cdata);
        this.qid = data.id;




        // Init the item controller
        this.initquestionnaire();

        // Invoke templates to templateMap
        this.invokeTemplate();

        // Invoke the embed plugin to start rendering the templates
        this.invokeEmbed();
        this.registerEvents();

    },


    registerEvents: function() {
        var instance = this;
        EkstepRendererAPI.addEventListener("org.ekstep.questionset.quiz:hide", function() {
            instance._stage.removeChildAt(0);
            instance.update();
        });
        EkstepRendererAPI.addEventListener("org.ekstep.questionset.quiz:evaluate", function(event) {

            var callback = event.target;
            instance.evaluate(callback, instance);

        });
    },

    invokeTemplate: function() {
        var instance = this;
        var templateType = this._pluginConfig.var || "item";
        var templateId = this._stage.getTemplate(templateType);
        var template = this._theme._templateMap[templateId];
        if (template === undefined) {
            this._pluginData.template.forEach(function(temp) {
                if (temp.id) {
                    // push i.template into the collection arrey of the templates.
                    instance._theme._templateMap[temp.id] = temp;
                }
            });
        }
    },
    invokeEmbed: function() {
        var embedData = {};
        embedData.template = this._pluginConfig.var || "item";
        embedData["var-item"] = this._pluginConfig.var || "item";
        // this.setState('mcq', undefined, false);
        PluginManager.invoke('embed', embedData, this, this._stage, this._theme);
    },
    initquestionnaire: function() {
        var controllerName = "item";
        console.log("this._theme", this._theme);
        var assessmentid = (this.qid + "_assessment");
        // var assessmentid = (this._stage._id + "_assessment");
        var stageController = this._theme._controllerMap[assessmentid];

        // Check if the controller is already initialized, if yes, skip the init
        var initialized = (stageController != undefined);
        if (!initialized) {
            var controllerData = {};
            controllerData.__cdata = this._pluginData.questionnaire;
            controllerData.type = this._pluginConfig.type;
            controllerData.name = assessmentid;
            controllerData.id = assessmentid;

            this._theme.addController(controllerData);
            stageController = this._theme._controllerMap[assessmentid];
        }



        if (stageController) {
            this._stage._stageController = stageController;
            this._stage._stageControllerName = controllerName; //+ Math.random();
            this._stage._stageController.reset();
            this._stage._stageController.next();
            var stageKey = this._stage.getStagestateKey();

            if (typeof this._theme.getParam === "function") {
                this._stage._currentState = this._theme.getParam(stageKey);


                var questionState = this.getStates(this.qid);
                if (questionState) {
                    var item = this._stage._stageController._model[0];
                    if (item.type.toLowerCase() == 'mcq' || item.type.toLowerCase() == 'mmcq') {
                        questionState.model[0].options.forEach(function(i) {
                        if (i.oSelected) {
                            i.selected = true;
                        }
                    });
                    }
                    
                    this._stage._stageController._model = _.clone(questionState.model);
                }
            }
        }
    },
    evaluate: function(callback, instance) {
        var result = {},
            res = {};
        var item = this._stage._stageController._model[0];
        /*item.options.forEach(function(i) {
            
            if (i.selected) {
                i.oSelected = true;
            }else{
                i.oSelected = false;
            }
        });*/

        var state = {
            model: _.clone(this._stage._stageController._model)
        }

        EkstepRendererAPI.dispatchEvent('org.ekstep.questionset:savev1QuestionState', function(data) {}, state)


        if (item.type.toLowerCase() == 'ftb') {
            res = FTBEvaluator.evaluate(item);
        } else if (item.type.toLowerCase() == 'mcq' || item.type.toLowerCase() == 'mmcq') {
            res = MCQEvaluator.evaluate(item);
        } else if (item.type.toLowerCase() == 'mtf') {
            res = MTFEvaluator.evaluate(item);
        }
        result.eval = res.pass;
        result.score = res.score;
        result.res = res.res;



        if (_.isFunction(callback)) {
            callback(result);
        }
    },
    getStates: function(questionId) {
        var qState;
        EkstepRendererAPI.dispatchEvent('org.ekstep.questionset:getQuestionState', {
            qid: questionId,
            callback: function(data) {
                qState = data;
            }
        });
        return qState;
    }
});
//# sourceURL=qsquizRenderer.js