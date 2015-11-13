TimerManager = {
	instances: {},
	start: function(delay, action) {
		console.log("timer starting with delay of "+delay+"ms. for", action);
		var fn = function() {
			CommandManager.handle(action);
		};
		var instance = setTimeout(fn, delay);
		var stageId = Renderer.theme._currentStage;
		if(TimerManager.instances[stageId]) {
			TimerManager.instances[stageId].push({'timeout': instance, 'fn': fn, 'action': action});
		} else {
			TimerManager.instances[stageId] = [{'timeout': instance, 'fn': fn, 'action': action}];
		}
	},
	stop: function() {

	},
	pause: function() {

	},
	resume: function() {

	},
	stopAll: function(stageId) {
		console.log("StopAll stageId:", stageId);
		var timoutInsts = TimerManager.instances[stageId];
		if(timoutInsts && _.isArray(timoutInsts)) {
			timoutInsts.forEach(function(inst) {
				clearTimeout(inst.timeout);
				console.log("cleared timeout for action:", inst.action);
			});
			delete TimerManager.instances[stageId];
		}
	}
}