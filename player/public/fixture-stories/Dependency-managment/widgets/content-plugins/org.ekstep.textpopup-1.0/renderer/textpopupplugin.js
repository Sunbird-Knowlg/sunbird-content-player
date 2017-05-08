/**
 * This plugins renders the org.ekstep.textpopup and creates popup with text and an overlay
 * @class popuptext
 * @extends Plugin
 * @author Devendra Singh <devendra.singh@tarento.com>
 */
Plugin.extend({
    _type: 'org.ekstep.textpopup',
    _isContainer: false,
    _render: false,
    _pagesText: {},
    initPlugin: function(data) {
        this._render = true;
        this._self = new createjs.Container();
        var dims = this.relativeDims();
        this._self.x = dims.x;
        this._self.y = dims.y;
        var instance = this;
        this._pluginData = JSON.parse(data.data.__cdata);
        var popupBoxObj = this.getPopupBoxObj(); //popup box with text 
        var popupBoxOverlayObj = this.getPopupBoxOverlayObj(); // popup box overlay                
        PluginManager.invoke("div", popupBoxObj, this, this._stage, this._theme);
        PluginManager.invoke("div", popupBoxOverlayObj, this._stage, this._stage, this._theme);
        var divBox = document.getElementById("divpopupbox");
        var divOverlayBox = document.getElementById("divpopupboxoverlay");
        //Applying style on popup box and its overlay
        divBox.style.color = this._data.color;
        divBox.style.backgroundColor = this._data.bgcolor;
        divBox.style.padding = "10px";
        divBox.style.overflowY = "auto";
        divBox.style.fontSize = this._data.fontSize + "px";
        divBox.style.lineHeight = "normal";
        divBox.style.zIndex = 10000;
        divOverlayBox.style.zIndex = 9000;
        divOverlayBox.style.backgroundColor = "#000000";
        divOverlayBox.style.opacity = 0.5;
        instance.addDefaultBtn();
    },

    /**
     * This method added a defult toggle btn on top right corner in case if user has deleted the icon
     * @memberof org.ekstep.textpopup
     */
    addDefaultBtn: function() {
        var imageData = this._pluginData;
        var imgObject = {
            "asset": imageData.asset,
            "x": imageData.x,
            "y": imageData.y,
            "w": imageData.w,
            "event": {
                "type": "click",
                "action": [{
                    "type": "command",
                    "command": "toggleShow",
                    "asset": "divpopupbox"
                }, {
                    "type": "command",
                    "command": "toggleShow",
                    "asset": "divpopupboxoverlay"
                }]
            }
        }
        PluginManager.invoke("image", imgObject, this._stage, this._stage, this._theme);
    },

    /**
     * This method creates object of popbox with text within it
     * @memberof org.ekstep.textpopup
     * @return {object} popbox object with text and paginations if text is long
     */
    getPopupBoxObj: function() {
        var textBoxDiv = {
            "id": "divpopupbox",
            "__text": this._data.__text,
            "__cdata": this._data.__text,
            "x": 0,
            "y": 0,
            "w": 100,
            "h": 100,
            "visible": false,
            "style": {}
        }
        return textBoxDiv;
    },

    /**
     * This method creates object of popup overlay along with event to disable popup 
     * @memberof org.ekstep.textpopup
     * @return {object} popbox overlay
     */
    getPopupBoxOverlayObj: function() {
        var overlayDiv = {
            "id": "divpopupboxoverlay",
            "x": 0,
            "y": 0,
            "w": 100,
            "h": 100,
            "visible": false,
            "style": {},
            "event": {
                "type": "click",
                "action": [{
                    "type": "command",
                    "command": "toggleShow",
                    "asset": "divpopupbox"
                }, {
                    "type": "command",
                    "command": "toggleShow",
                    "asset": "divpopupboxoverlay"
                }]
            }

        }
        return overlayDiv;

    }

});
