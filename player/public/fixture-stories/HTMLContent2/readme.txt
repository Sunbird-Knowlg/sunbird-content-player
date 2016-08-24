* folder stucture
	-ROOT 
		-test
			localData.json
		-index.html

test folder: should contain localData.json file. This JSON data will be used as mockdata for the local dev environment for testing

* Dependent libraries
	Jquery
	Underscore

* ContentId in the query parameter is mandatory while testing in local dev environment
	cid="content "identifier" specified in localdata.json"

* GenieService and Telemetry can be used only after GenieService.init() callback
	GenieService.init(function(){
		//GenieService & telemetry services are available now
	});

* To start Telemetry log, Game/Content metadata and current logged-in user data is madatory

