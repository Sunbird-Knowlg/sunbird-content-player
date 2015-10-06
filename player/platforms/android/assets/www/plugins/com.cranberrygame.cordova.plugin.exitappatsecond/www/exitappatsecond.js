cordova.define("com.cranberrygame.cordova.plugin.exitappatsecond.exitappatsecond", function(require, exports, module) { 
module.exports = {
   
    exitAppAtSecond : function () {
		var self = this;
		Cordova.exec(
			function (result) {
				if (result == "onExitAppAtSecond") {
					if (self.onExitAppAtSecond)
						self.onExitAppAtSecond();
					console.log("Enter into exitAppAtSecond.....");
					navigator.app.exitApp();						
				}
			},
            function (error) {
			},
			"ExitAppAtSecond",
			"exitAppAtSecond",
			[]
		);//success,fail,class,method,params
    },	
	onExitAppAtSecond: null
};

});
