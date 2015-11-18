TimerManager = {
	instances: {},
	start: function(action) {
		var stageId = Renderer.theme._currentStage;
		var instance = setTimeout(function() {
			if(stageId == Renderer.theme._currentStage) {
				CommandManager.handle(action);
			}
		}, action.delay);
		if(TimerManager.instances[stageId]) {
			TimerManager.instances[stageId].push({'timeout': instance, 'action': action});
		} else {
			TimerManager.instances[stageId] = [{'timeout': instance, 'action': action}];
		}
	},
	stop: function() {

	},
	pause: function() {

	},
	resume: function() {

	},
	stopAll: function(stageId) {
		var timoutInsts = TimerManager.instances[stageId];
		if(timoutInsts && _.isArray(timoutInsts)) {
			timoutInsts.forEach(function(inst) {
				clearTimeout(inst.timeout);
			});
			delete TimerManager.instances[stageId];
		}
	},
	destroy: function() {
		var instances = TimerManager.instances;
		for(stageId in instances) {	
			TimerManager.stopAll(stageId);
		}
		TimerManager.instances = {};
	}
}