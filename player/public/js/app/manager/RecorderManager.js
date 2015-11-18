RecorderManager = {
	mediaInstances: {},
	startRecording: function(action) {
		var plugin = PluginManager.getPluginObject(action.asset);
		var stageId = plugin._stage._id;
		var recorderId = RecorderManager._getRecorderId(stageId);
		plugin.hide({"type": "command", "action": "hide", "asset": action.asset});
		// TODO: implement start recording...
		if(action.success) {
			var successPlugin = PluginManager.getPluginObject(action.success);
			if (successPlugin) {
				successPlugin.show({"type": "command", "action": "show", "asset": action.success});
			} else {
				PluginManager.addError('Plugin not found for action.success - ' + action.success);
			}
		} else {
			// TODO: do something to show recording....
		}
		if(Media) {
			var currentDate = new Date();
			var src = DownloaderService.appDataDirectory + recorderId + "_"+ currentDate.getTime()  + ".mp3";
			console.info("src:",src);
		    var media = new Media(src,
		        function() {
		            console.log("Audio recording successfull.");
		        },
		        function(err) {
		            console.log("Error Audio recording: "+ err.code);
		        }
		    );
		    media.startRecord();
		    RecorderManager.mediaInstances[recorderId] = media;
		    console.log("Audio recording started successfully.");
		    // // Stop recording after 10 seconds
		    // setTimeout(function() {
		    //     media.stopRecord();
		    //     console.log("recordAudio():Audio src: "+ media.src);
		    //     console.log("recordAudio():Audio getDuration: "+ media.getDuration());
		    //     media.release();
		    // }, 10000);
		}
	},
	stopRecording: function(action) {
		var plugin = PluginManager.getPluginObject(action.asset);
		var stageId = plugin._stage._id;
		var recorderId = RecorderManager._getRecorderId(stageId);
		var media = RecorderManager.mediaInstances[recorderId];
		if(media) {
			media.stopRecord();
			console.log("Audio src: "+ media.src);
	        console.log("Audio getDuration: "+ media.getDuration());
	        media.release();
		} else {
			console.error('Error recording not started.');
		}
		plugin.hide({"type": "command", "action": "hide", "asset": action.asset});
		// TODO: implement stop recording...
	},
	_getRecorderId: function(stageId) {
		return GlobalContext.user.uid + '_' + TelemetryService._gameData.id + '_' + stageId;
	}
}