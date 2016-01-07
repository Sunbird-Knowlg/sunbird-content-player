PlatformService = {
	getContent: function(contentType) {
        return new Promise(function(resolve, reject) {
			resolve();
		});
	},
	setAPIEndpoint: function(endpoint) {
		return endpoint;
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
	        	console.err("Error:", err);
	        	reject(err);
	        });
		});
	}
}