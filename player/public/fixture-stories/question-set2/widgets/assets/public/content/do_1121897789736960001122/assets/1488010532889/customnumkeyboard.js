/**
 * nkeyboard Plugin
 *@create custom number keyboard
 *@author Abha Singh @Abha.Singh@tarento.com
 */
Plugin.extend({
    target: '',
    buttonSounds: [],
    buttons: [],
    _testis: undefined,
    _type: 'nkeyboard',
    _isContainer: false,
    _render: true,

    /**
     *This method create keys custom keys
     *@param {String} data.keys, taking keys values from user, maximum limit is 19 keys
     */
    initPlugin: function(data) {
        var instance = this;
        var div = document.getElementById(data.id);
        var dims = this.relativeDims();
        var asset = data.asset;
        if (div) {
            jQuery("#" + data.id).remove();
        }
        div = document.createElement('div');
        target = data.target;
        var customButtons;
        if (data.keys) {
            customButtons = this._stage.getModelValue(data.keys);
        }
        if (data.type == "custom") {
            customButtons = customButtons.replace(/ /g, '');
            var buttonsAre = customButtons.split(',');
            buttons = buttonsAre.splice(0, 19);
            div.id = "keyboardNumber";
            div.style.width = dims.w + "px";
            div.style.height = dims.h + "px";
            div.innerHTML = '';
            var clearKey = '<div class="key_number key_number_clear " id="clear_btn"></div>';
            var customKeys = '';
            for (var i = 0; i < buttons.length; i++) {
                if (i % 10 == 0) {
                    customKeys += '<div class="key_number firstkey" id="' + buttons[i] + '_btn">' + buttons[i] + '</div>';
                } else {
                    customKeys += '<div class="key_number" id="' + buttons[i] + '_btn">' + buttons[i] + '</div>';
                }
            }
            customKeys += clearKey;
            div.innerHTML = customKeys;
        }
        var parentDiv = document.getElementById(Renderer.divIds.gameArea);
        parentDiv.insertBefore(div, parentDiv.childNodes[0]);
        for (var i = buttons.length - 1; i >= 0; i--) {
            this.assignButtonEvent(buttons[i], asset, data.limit);
        };

        var clear_btn = document.getElementById('clear_btn');
        clear_btn.addEventListener("click", function() {
            var txtObject = PluginManager.getPluginObject(target);
            var currentText = txtObject._self.text;
            currentText = currentText.slice(0, -1);
            txtObject._self.text = currentText;
            Renderer.update = true;
            instance._stage.setModelValue(txtObject._data.model, txtObject._self.text)
        });
        this._self = new createjs.DOMElement(div);
        this._self.x = dims.x;
        this._self.y = dims.y;
    },

    /**
     *This method used to switchTarget position
     *@param {String} action, uses action to switch target position
     */
    switchTarget: function(action) {
        target = action.id;
    },

    /**
     *This method used to add append string
     */
    assignButtonEvent: function(id, asset, limit) {
        var btn = document.getElementById(id + '_btn');
        var instance = this;
        btn.addEventListener("click", function() {
            var newText = PluginManager.getPluginObject(target);
            if (newText._self.text.length < limit) {
                newText._self.text += id;
            }
            Renderer.update = true;
            instance._stage.setModelValue(newText._data.model, newText._self.text)
        });
    }
});
