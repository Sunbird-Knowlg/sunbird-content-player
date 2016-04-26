OverlayHtml = {
	showNext: function() {
		this._show("hasNext");
	},
	showPrevious: function() {
		this._show("hasPrevious");
	},
	_show: function(element) {
		var rootScope = this._getRootScope();
		if (rootScope) {
            rootScope[element] = true;
            rootScope.$apply();
        }
	},
	_getRootScope: function() {
        var rootScope = null;
        var overlayDOMElement = document.getElementById('overlayHTML');
        if ("undefined" != typeof angular && "undefined" != typeof overlayDOMElement) {
            rootScope = angular.element(overlayDOMElement).scope().$root;
        }
        return rootScope;
    }
};