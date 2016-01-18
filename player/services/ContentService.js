
/**
 * Content Service - Invoke MW API's, transform data for UI and viceversa
 *
 * @author Jitendra Singh Sankhwar
 */
var async = require('async')
	, mwService = require('../commons/MWServiceProvider')
	, util = require('../commons/Util')
	, _ = require('underscore')
	, fs = require('fs')
	, Download = require('download')
	, jsonfile = require('jsonfile')
	, mimeType = ["application/vnd.ekstep.ecml-archive","application/vnd.ekstep.html-archive"]
	, downloading = false
	, isAvailableList = []
	, path = "local_storage/content-list.json";

exports.getContentList = function(cb, type, contentType) {
	var args = {
		path: {type: type, contentType: contentType},
		data: {
			request: {
			}
		}
	}
	if(!downloading) {
		downloading = true;
		mwService.postCall("/taxonomy-service/v1/game/list", args, function(err, data) {
			if(err) {	
				cb(err);
			} else {
				var contents = data.result;
				var result = {};
				var contentList = [];
				_.each(contents.games, function(object){
					if(_.contains(mimeType, object.mimeType)){
						var map = {};
						map.identifier = object.identifier;
						map.localData = object;
						map.mimeType = object.mimeType;
						map.isAvailable = false;
						map.path = "stories/" + object.code;
						contentList.push(map);
					}
						
				});
				localStorage(contentList).then(function(content){
					result.contents = content;
				}).catch(function(err){
					console.log("err inside localStorage : ", err);
				});
			}
		});   
	} else {
		var result = {};
		result.contents = isAvailableList;
		cb(null, result);	}
}
									
function localStorage(contents) {
	var localMap = {};
	var contentList = [];

	return new Promise(function(resolve, reject) {
		jsonfile.readFile(path, function(err, obj) {
			if(obj == undefined) {
			  	_.each(contents, function(content) {
			  		downloadFromUrl(content).then(function(data){
			  			contentList.push(data);
						writeFile(contentList);
			  			resolve(content-list);
			  		});
			  	});
		  	} else {
		  		jsonfile.readFile(path, function(err, localMap) {
					_.each(contents, function(content){
						var dir = appConfig.STORY + "/" + content.code;

						if(fs.existsSync(dir) && _.findWhere(localMap, {"identifier": content.identifier})) {
							var localContent = _.findWhere(localMap, {"identifier": content.identifier});
					  		if(content.localData.pkgVersion != localContent.localData.pkgVersion) {
					  			downloadFromUrl(content).then(function(data){
					  				contentList.push(data);
					  				writeFile(contentList);
						  			resolve(data);
						  		});
					  		} else {
					  			localContent.isAvailable = true;
					  			isAvailableList.push(localContent);
					  			contentList.push(localContent);
					  			writeFile(contentList);
					  			resolve(localContent);
					  		}
						} else {
							downloadFromUrl(content).then(function(data){
					  			contentList.push(data);
								writeFile(contentList);
					  			resolve(content-list);
					  		});
						}
				  	});
				});
		  	}
		});
		
	});
}

function writeFile(obj) {
 	jsonfile.writeFile(path, obj, {spaces: 2}, function (err) {
		if(err)
			console.error(err);
	});
 }

 
function downloadFromUrl(content) {
	return new Promise(function(resolve, reject){
		var dir = appConfig.STORY + content.code;
		if (!fs.existsSync(dir)){
		    fs.mkdirSync(dir);
		}
		new Download({mode: '777', extract: true}).get(content.localData.downloadUrl).dest(dir)
	    .run(function(err, files){
	    	console.log("file downloaded.......  :  ", content.localData.code);
	    	content.isAvailable = true;
	    	isAvailableList.push(content);
	    	resolve(content);
	    });
	}).catch(function(err){
			console.log("err inside localStorage : ", err);
	});
}


