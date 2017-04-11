/**
 * Plugin to create and render MTF (Match the fallowing questions) assesment on canvas .
 * @class MTFPlugin
 * @extends EkstepRenderer.Plugin
 * @author Vinu Kumar V S <vinu.kumar@tarento.com>
 */
var MTFPlugin = Plugin.extend({
    /**
     * This explains the type of the plugin. 
     * @member {String} _type.
     * @memberof MTFPlugin
     */
    _type: 'mtf',

    /**
     * This explains the plugin is container OR not. 
     * @member {boolean} _isContainer.
     * @memberof MTFPlugin
     */
    _isContainer: true,

    /**
     * This explains plugin should render on canvas OR not. 
     * @member {boolean} _render
     * @memberof MTFPlugin
     */
    _render: true,

    /**
     * LHS (Left hand side) options of MTF. 
     * @member {array} _lhs_options
     * @memberof MTFPlugin
     */
    _lhs_options: [],

    /**
     * RHS (Right hand side) options of MTF. 
     * @member {array} _lhs_options
     * @memberof MTFPlugin
     */
    _rhs_options: [],
    _force: false,

    /**
     * This explains controller object
     * which is having data related to MCQ assesment.
     * @member {object} _controller
     * @memberof MTFPlugin
     */
    _controller: undefined,


    /**
     *   Invoked by framework when plugin instance created/rendered on stage.
     *   Use this plugin to create a MTF assesment.
     *   @param data {object} data is input object for the MTFPlugin.
     *   @memberof MTFPlugin
     *   @override
     */
    initPlugin: function(data) {
        this._lhs_options = [];
        this._rhs_options = [];
        this._force = false;

        var model = data.model;
        if (model) {
            var controller = this._stage.getController(model);
            // get the model data from the currentstate object
            // and update the model with the MTF state data
            var plugindata = this.getState(this._type);
            if (!_.isUndefined(plugindata)) {
                controller._model[controller._index].rhs_options = _.isEmpty(plugindata) ? controller._model[controller._index].rhs_options : plugindata;
            }
            if (controller) {
                // update the MTF state when user land to the page.
                this.updateState(controller, false);
                this._controller = controller;
                this._force = data.force;
                if ((typeof this._force) == 'undefined' || this._force == null) {
                    this._force = false;
                }
                this._data.x = this._parent._data.x;
                this._data.y = this._parent._data.y;
                this._data.w = this._parent._data.w;
                this._data.h = this._parent._data.h;
                this._self = new createjs.Container();
                var dims = this.relativeDims();
                this._self.x = dims.x;
                this._self.y = dims.y;
                this.invokeChildren(data, this, this._stage, this._theme);
            }
        }
    },

    /**
     *   It returns the LHS option object of MTF by passing index.
     *   @param index {integer} index is input value to get the particular lhsOption object.
     *   @memberof MTFPlugin
     *   @override
     */
    getLhsOption: function(index) {
        var option;
        this._lhs_options.forEach(function(opt) {
            if (opt._index == index) {
                option = opt;
            }
        });
        return option;
    },
    // Deprecated - Use setAnswerMapping instead
    setAnswer: function(rhsOption, lhsIndex) {
        this._controller.setModelValue(rhsOption._model, lhsIndex, 'selected');
    },

    /**
     *   It used to map the answer.
     *   @param rhsOption {object} rhsOption is input object to map answer.
     *   @param lhsOption {object} lhsOption is input object to map answer.
     *   @memberof MTFPlugin
     *   @override
     */
    setAnswerMapping: function(rhsOption, lhsOption) {
        if (!_.isUndefined(lhsOption)) {
            rhsOption._value.mapped = lhsOption._value.resvalue;
            this._controller.setModelValue(rhsOption._model, lhsOption._index, 'selected');
        } else {
            delete rhsOption._value.mapped;
            this._controller.setModelValue(rhsOption._model, undefined, 'selected');
        }
        // update the MTF state when user mapped the RHS to LHS option
        this.updateState(this._controller, true);
    },

    /**
     *   It used to remove the answer.
     *   @param rhsOption {object} rhsOption is input object to map answer.
     *   @param lhsIndex {integer} lhsOption is index value to remove the answer from the rhsOption.
     *   @memberof MTFPlugin
     *   @override
     */
    removeAnswer: function(rhsOption, lhsIndex) {
        this._controller.setModelValue(rhsOption._model, lhsIndex, '');
    },

    /**
     *   Use to update the retained state of plugin. 
     *   @param controller {object} controller is input object to update the state of plugin
     *   for the particular controller.
     *   @param isStateChanged {boolean} isStateChanged is boolean value to update the state of MCQ plugin.
     *   wether MTF plugin state is changed OR not.
     *   @memberof MTFPlugin
     *   @override
     */
    updateState: function(controller, isStateChanged) {
        if (!_.isUndefined(controller._model)) {
            var model = controller._model[controller._index];
            this.setState(model.type, model.rhs_options, isStateChanged);
        }
    }
});
PluginManager.registerPlugin('mtf', MTFPlugin);