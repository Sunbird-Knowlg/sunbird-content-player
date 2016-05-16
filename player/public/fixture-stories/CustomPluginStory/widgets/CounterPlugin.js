Plugin.extend({
    _type: 'counter',
    _isContainer: false,
    _render: true,
    initPlugin: function(data) {
        var dims = this.relativeDims();
        var div = document.getElementById(data.id);
        if (div) {
            jQuery("#" + data.id).remove();
        }
        div = document.createElement('div');
        if (data.style)
            div.setAttribute("style", data.style);
        div.id = data.id;
        div.style.width = dims.w + 'px';
        div.style.height = dims.h + 'px';
        div.style.position = 'absolute';

        var parentDiv = document.getElementById(Renderer.divIds.gameArea);
        parentDiv.insertBefore(div, parentDiv.childNodes[0]);

        this._self = new createjs.DOMElement(div);
        this._self.x = dims.x;
        this._self.y = dims.y;

        var duration = data.duration || 10000;
        var from = data.from || 0;
        var to = data.to || 0;
        jQuery("#"+data.id).counter({autoStart: true, duration: duration, countFrom: from, countTo: to});
    }
});

