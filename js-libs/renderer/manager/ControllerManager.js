ControllerManager = {
	controllerMap: {},
	instanceMap: {},
	errors: [],
	reset: function() {
		ControllerManager.instanceMap = {};
	},
	registerController: function(type, controller) {
		ControllerManager.controllerMap[type] = controller;
	},
	isController: function(type) {
		if(ControllerManager.controllerMap[type]) {
			return true;
		} else {
			return false;
		}
	},
	get: function(c, baseDir) {
		var d,
		
			controllerMap = ControllerManager.controllerMap;
		if (c.type && c.id) {
			if(!controllerMap[c.type]) {
				ControllerManager.addError('No Controller found for - ' + c.type);
			} else {
				var controllerId = c.type + '.' + c.id;
				d = ControllerManager.getControllerInstance(controllerId);
				if (!d) {
					d = new controllerMap[c.type](c, baseDir);
				}
			}
		}
		
		return d;
	},
	registerControllerInstance: function(id, instance) {
		ControllerManager.instanceMap[id] = instance;
	},
	getControllerInstance: function(id) {
		return ControllerManager.instanceMap[id];
	},
	addError: function(error) {
		ControllerManager.errors.push(error);
	},
	getErrors: function() {
		return ControllerManager.errors;
	}	
}