genieservice = {
	getCurrentUser: function() {
		return new Promise(function(resolve, reject) {
			var result = {};
			result.status = "success";
			result.data = {"avatar":"resource1","gender":"male","handle":"handle1","uid":"8hjh3c4b7b47d570df0ec286bf7adc8ihhnjy","age":6,"standard":-1};
			resolve(result);
		});	
	},
	getMetaData: function() {
		return new Promise(function(resolve, reject) {
			var result = {};
			result = {"flavor":"sandbox","version":"1.0.1"};
			resolve(result);
		});	
	},
	getContent: function(id, url) {
		return new Promise(function(resolve, reject) {
			resolve();
		});
	},
	getContentList: function(filter) {
		return new Promise(function(resolve, reject) {
			$.post("/genie-canvas/v1/content/list", function(resp) {
				var result = {};
				if(!resp.error) {
					result.list = resp.content;
		            resolve(result);
				} else {
					reject(resp);
				}
	        })
	        .fail(function(err){
	        	reject(err);
	        });
		});
	},
	setAPIEndpoint: function(endpoint) {
		return endpoint;
	}
};

telemetry = {
	send: function(string) {
		return new Promise(function(resolve, reject) {
			console.log(string);
			resolve(true);
		});
	}
};