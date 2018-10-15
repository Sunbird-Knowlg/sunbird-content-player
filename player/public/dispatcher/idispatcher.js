org.ekstep.contentrenderer.IDispatcher = Class.extend({
	init: function () {
		this.initDispatcher()
	},
	initDispatcher: function () { console.log("Subclass should implement initDispatcher") },
	dispatch: function (event) { console.log("Subclass should implement dispatch") }
})
