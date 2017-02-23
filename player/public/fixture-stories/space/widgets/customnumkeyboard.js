Plugin.extend({
    target: '',
    buttonSounds: [],
    buttons: [],
    _testis: undefined,
    _type: 'nkeyboard',
    _isContainer: false,
    _render: true,
    //_input:"",
    initPlugin: function(data) {
        var div = document.getElementById(data.id);
        var dims = this.relativeDims();

        var asset = data.asset;
        if (div) {
            jQuery("#" + data.id).remove();
        }

        div = document.createElement('div');
      
        target = data.target;
      
        buttons = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "+", "-", "\u00D7", "\u00F7", "=", "<", ">", "%", "."];
       
        div.id = "keyboardNumber";
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

        var parentDiv = document.getElementById(Renderer.divIds.gameArea);
        parentDiv.insertBefore(div, parentDiv.childNodes[0]);

        for (var i = buttons.length - 1; i >= 0; i--) {
            this.assignButtonEvent(buttons[i], asset, data.limit);
        };

        var clear_btn = document.getElementById('clear_btn');
        clear_btn.addEventListener("click", function() {
            var txtObject = PluginManager.getPluginObject(target);
            var currentText = txtObject._self.text;
            txtObject._self.text = "";
            Renderer.update = true;
        });
       
        this._self = new createjs.DOMElement(div);
        this._self.x = dims.x;
        this._self.y = dims.y;
    },
    switchTarget: function(action) {
        target = action.id;
    },
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
