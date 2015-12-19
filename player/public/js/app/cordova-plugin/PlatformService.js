PlatformService = {
	getContent: function(contentType) {
        return new Promise(function(resolve, reject) {
			$.post("/taxonomy-service/v1/content/list/" + contentType , function(resp) {
	            resolve(resp);
	        })
	        .fail(function(err){
	        	reject(err);
	        });
		});
	},
	setAPIEndpoint: function(endpoint) {
		return endpoint;
	},
	getContentList: function() {
		var result = {"data": []};
		return new Promise(function(resolve, reject) {
			PlatformService.getContent('Story')
			.then(function(stories) {
				PlatformService.setResult(result, stories, 'story');
			})
			.then(function() {
				return PlatformService.getContent('Worksheet')
			})
			.then(function(worksheets) {
				PlatformService.setResult(result, worksheets, 'worksheet');
				resolve(result);
			})
			.catch(function(err) {
				reject(err);
			})
		})
	},
	setResult: function(result, list, type) {
		if (list && list.contents) {
			if (list.contents == null) {
				list.contents = [];
			}
			for(i=0;i < list.contents.length; i++) {
            	var item = list.contents[i];
            	item.type = type;
            	result.data.push(item);
        	}
        	result.appStatus = list.appStatus;
		}
	}
}