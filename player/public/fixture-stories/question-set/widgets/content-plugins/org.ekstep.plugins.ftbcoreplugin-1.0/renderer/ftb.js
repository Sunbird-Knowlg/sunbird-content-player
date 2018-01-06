app.controllerProvider.register('ftbctrl',  function($scope, $rootScope) {
	$scope.showTemplate = true;
	$scope.ftbcore="FTB Core";
		$scope.init = function() {
		console.log("Loading");
		//mcqplugin
		$scope.pluginInstance = EkstepRendererAPI.getPluginObjs("org.ekstep.plugins.ftbcoreplugin");

		// To show template/plugin	
		EkstepRendererAPI.addEventListener($scope.pluginInstance._manifest.id+":show", function(event){
			$scope.showTemplate = true;
			$scope.safeApply();
		});

		EkstepRendererAPI.addEventListener($scope.pluginInstance._manifest.id+":hide", function(event){
			$scope.showTemplate = false;
			$scope.safeApply();
		});
	}

	$scope.init();
        
});