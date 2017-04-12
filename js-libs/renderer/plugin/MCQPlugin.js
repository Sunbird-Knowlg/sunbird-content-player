/**
 * Plugin to create and render MCQ (Multiple choice questions) assesment on canvas .
 * @class MCQPlugin
 * @extends EkstepRenderer.Plugin
 * @author Vinu Kumar V S <vinu.kumar@tarento.com>
 */

var MCQPlugin = Plugin.extend({

    /**
     * This explains the type of the plugin. 
     * @member {String} _type.
     * @memberof MCQPlugin
     */
    _type: 'mcq',

    /**
     * This explains plugin is container OR not. 
     * @member {boolean} _isContainer
     * @memberof MCQPlugin
     */
    _isContainer: true,

    /**
     * This explains plugin should render on canvas OR not. 
     * @member {boolean} _render
     * @memberof MCQPlugin
     */
    _render: true,

    /**
     * This explains MCQ options should be multiple select (from user interaction) OR not. 
     * If the more than one answer is defined inside the options then it is multiselect (MMCQ),
     * Default value is false.
     * @member {boolean} _multi_select
     * @memberof MCQPlugin
     */
    _multi_select: false,

    /**
     * This explains the multiple options.
     * @member {Array} _options
     * @memberof MCQPlugin
     */
    _options: [],

    /**
     * This explains the controller object data 
     * which is having related to MCQ assesment data.
     * @member {object} _controller
     * @memberof MCQPlugin
     */
    _controller: undefined,

    /**
     * This explains style property to the MCQ options,
     * default shadow value is #0470D8.
     * @member {string} _shadow
     * @memberof MCQPlugin
     */
    _shadow: '#0470D8',

    /**
     * This explains style property to the MCQ options
     * default blur is 30.
     * @member {integer} _blur
     * @memberof MCQPlugin
     */
    _blur: 30,

    /**
     * This explains style property to the MCQ options
     * default offsetX is 0.
     * @member {integer} _offsetX
     * @memberof MCQPlugin
     */
    _offsetX: 0,

    /**
     * This explains style property to the MCQ options
     * default offsetY is 0.
     * @member {integer} _offsetY
     * @memberof MCQPlugin
     */
    _offsetY: 0,

    /**
     * This explains style property to the MCQ options
     * default highlight is #E89241.
     * @member {string} _highlight
     * @memberof MCQPlugin     
     */
    _highlight: '#E89241',

    /**
     *   Invoked by framework when plugin instance created/renderered on stage.
     *   Use this plugin to create a MCQ assesment.
     *   @param data {object} data is input object for the MCQPlugin.
     *   @memberof MCQPlugin
     *   @override
     */
    initPlugin: function(data) {
        this._multi_select = false;
        this._options = [];
        this._shadow = '#0470D8';
        this._blur = 30;
        this._offsetX = 0;
        this._offsetY = 0;

        var model = data.model;
        if (model) {
            var controller = this._stage.getController(model);
            //get state data from stage._currentObject
            //update the model with mcq state data
            var plugindata = this.getState(this._type);
            if (!_.isUndefined(plugindata)) {
                controller._model[controller._index].options = _.isEmpty(plugindata) ? controller._model[controller._index].options : plugindata;
            }
            if (controller) {
                // update the MCQ state when user land to the MCQ Page
                this.updateState(controller, false);
                // update the MCQ state when user land to the MCQ Page
                this._controller = controller;
                this._multi_select = data.multi_select;
                if ((typeof this._multi_select) == 'undefined' || this._multi_select == null) {
                    this._multi_select = false;
                }
                this._data.x = this._parent._data.x;
                this._data.y = this._parent._data.y;
                this._data.w = this._parent._data.w;
                this._data.h = this._parent._data.h;

                this._self = new createjs.Container();
                var dims = this.relativeDims();
                this._self.x = dims.x;
                this._self.y = dims.y;
                if (data.shadow) {
                    this._shadow = data.shadow;

                    // Unset the shadow on MCQ otherwise default plugin shadow takes effect
                    data.shadow = undefined;
                }
                if (data.highlight) {
                    this._highlight = data.highlight;
                }
                if (_.isFinite(data.blur)) {
                    this._blur = data.blur;
                }
                if (_.isFinite(data.offsetX)) {
                    this._offsetX = data.offsetX;
                }
                if (_.isFinite(data.offsetY)) {
                    this._offsetY = data.offsetY;
                }
                this._multi_select = this.isMultiSelect();
                this.invokeChildren(data, this, this._stage, this._theme);

            }
        }
    },

    /**
     *   To verify the MCQ options are multiselect or not,
     *   If the count of the answer attribute is more than one inside the options
     *   then it is multiselect(MMCQ).
     *   @memberof MCQPlugin
     *   @override
     */
    isMultiSelect: function() {
        var ansLength = 0;

        var options = this._controller ? this._controller.getModelValue("options") : undefined;
        if (options) {
            ansLength = _.filter(options, function(option) {
                return option.answer == true;
            }).length;
        }
        return (ansLength > 1) ? true : false;
    },

    /**
     *   Used to select the particular option of MCQ. 
     *   @param option {object} which option to be select.
     *   @memberof MCQPlugin
     *   @override
     */
    selectOption: function(option) {
        var controller = this._controller;
        // If it is not a multi-select, then unset all other selected shadows
        if (!this._multi_select) {
            this._options.forEach(function(o) {
                if (o._index != option._index && o.hasShadow()) {
                    o.removeShadow();
                    controller.setModelValue(o._model, false, 'selected');
                }
            });
        }
        // If the shadow is visible, toggle it (unselect)

        var val = undefined;
        if (option) {
            val = option.toggleShadow();
            controller.setModelValue(option._model, val, 'selected');
        }
        this.updateState(controller, true);

        // update the MCQ state on SELECTION OF OPTION
        Renderer.update = true;
        return val;
    },

    /**
     *   Use to update the retained state of plugin. 
     *   @param controller {object} controller is input object to update the state of plugin
     *   for the particular controller.
     *   @param isStateChanged {boolean} isStateChanged is boolean value to update the state of MCQ plugin.
     *   wether MCQ plugin state is changed OR not.
     *   @memberof MCQPlugin
     *   @override
     */
    updateState: function(controller, isStateChanged) {
        if (!_.isUndefined(controller._model)) {
            var model = controller._model[controller._index];
            this.setState(model.type, model.options, isStateChanged);
        }
    }
});
PluginManager.registerPlugin('mcq', MCQPlugin);