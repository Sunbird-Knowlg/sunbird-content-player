PlatformService = {
	getContent: function(id, url) {
		return new Promise(function(resolve, reject) {
			resolve();
		});
  
	},
	setAPIEndpoint: function(endpoint) {
		return endpoint;
	},
	getContentList: function(filter) {
		console.log("filter : ", filter);
		return new Promise(function(resolve, reject) {
			$.post("/genie-canvas/v1/content/list", function(resp) {
				console.log("resp : ", resp);
				var result = {};
				if(!resp.error) {
					result.list = resp.contents;
		            resolve(result);
				} else {
					reject(resp);
				}
	        })
	        .fail(function(err){
	        	console.err("Error:", err);
	        	reject(err);
	        });
		});
	}
}