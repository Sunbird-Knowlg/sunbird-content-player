# Content Player

![](https://api.travis-ci.org/project-sunbird/sunbird-content-player.svg?branch=master)

## What is Content Player?
  Which renders the contents in both device and web
   
 **Supported Contents**
   
  * ECML (Ekstep content markup language)
  * HTML
  * Youtube
  * Epub
  * H5P
  * Mp4/Webm
  * PDF

## How to render the contents?

Content player is a customisable and configurable before launching any type of content inside any environment (preview or device) it expecting few configurations. Based on the configuration content will be rendered in the respective environment. 

**Preview object**     

```js
var previewObj = {
	"context": {
		"mode": "preview/edit/play",  // to identify preview used by the user to play/edit/preview
                "authToken":"",// Auth key to make V3 api calls
		"contentId": "do_201734893",   // ContentId used to get body data from content API call
		"sid": "sdjfo8e-3ndofd3-3nhfo334" // User sessionid on portal or mobile
		"did": "sdjfo8e-3ndofd3-3nhfo334" // Unique id to identify the device or browser 
		"uid": "sdjfo8e-3ndofd3-3nhfo334" // Current logged in user id
		"channel": "" // To identify the channel(Channel ID). Default value ""
		"pdata": // Producer information. Generally the App which is creating the event, default value {}
		{ 
		  "id": "", // Producer ID. For ex: For ekstep it would be "portal" or "genie"
                  "pid": , // Optional. In case the component is distributed, then which instance of that component
		  "ver": "", // version of the App
		}, 
		"app": [""], // Genie tags
		"partner": [""], // Partner tags
		"dims": [""], // Encrypted dimension tags passed by respective channels
		"cdata": [{ //correlation data
		  * "type":"" //Used to indicate action that is being correlated
		  "id": "" //The correlation ID value
		}],

	},
	"config": {
		"repos": ["s3path"],    // plugins repo path where all the plugins are pushed s3 or absolute folder path
		"plugins": [{id:"org.ekstep.telemtryPlugin", "ver": "1.0", "type":"plugin"}],     //Inject external custom plugins into content (for externl telemetry sync)
		"overlay": {  // Configuarable propeties of overlay showing by GenieCanvas on top of the content
		  "enableUserSwitcher": true, // enable/disable user-switcher, default is true for mobile & preview
		  "showUser": true,     // show/hide user-switcher functionality. default is true to show user information
		  "showOverlay": true,  // show/hide complete overlay including next/previous buttons. default value true
		  "showNext": true,     // show/hide next navigation button on content. default is true
		  "showPrevious": true, // show/hide previous navigation button on content. default is true
		  "showSubmit": false,  // show/hide submit button for assessmetns in the content. default is false
		  "showReload": true,   // show/hide stage reload button to reset/re-render the stage. default is true
		  "menu": {
		    "showTeachersInstruction": true  // show/hide teacher instructions in the menu
		  }
		},
		"splash": {  // list of configurable properties to handle splash screen shown while loading content
		  "text": "Powered by EkStep",  // Text to be shown on splash screen while loading content. 
		  "icon": "assets/icons/icn_genie.png",  // Icon to be show on above the text(full absolute path of the image in mobiew or http image link)
		  "bgImage": "assets/icons/background_1.png",  // backgroung image used for splash screen while loading content(absolute folder path of the image in mobie or http image link)
		  "webLink": "https://www.ekstep.in"  // weblink to be opened on click of text
		},
		"mimetypes": [  // Content mimetypes for new cotent lucnhers
		  "application/vnd.ekstep.ecml-archive", 
		  "application/vnd.ekstep.html-archive"
		],
		"contentLaunchers": [ // content laucher plugins for specific content mimetypes
		  {  // Plugin used for ECML content to launch, It is default plugin
		    "mimeType": 'application/vnd.ekstep.html-archive',
		    "id": 'org.ekstep.htmlrenderer',
		    "ver": 1.0,
		    "type": 'plugin'
		  },
		  ...
		]
		... (any addition data used by plugins injecting to preview)
	},
	"metadata": {},  //content metadata json object (from API response take -> response.result.content)
	"data": undefined     // content body json object (from API response take -> response.result.content.body)
}


```
**Description**


| Property Name | Description | Default Value   |
| --- | --- | --- |
| `host` | It is a `string` which defines the from which domain content should be load|```window.location.origin```  |
| `mimetypes` | It is an `array` which defines the what type of the content to be renderer| ```[ ]```|
| `contentLaunchers` | It is an `array` of plugin objects it will launch the content based on the mimeType which is defined| ``` []```|
| `overlay` | It is an `object` using this canvas overlay can be customized based on the flags| ```{}```|
| `splash` | It is an `object` before launching any type of content splash screen will load and it is customizable |```{}```|
| `showEndpage` | It is `boolean` which defines should default canvas endpage should load or not | ```TRUE```
| `pdata` | It is an `object` which defines the producer information it should have identifier and version and canvas will log in the telemetry| ```{'id':'in.ekstep', 'ver':'1.0'}```|
| `channel` | It is `string` which defines channel identifier to know which channel is currently using.| `in.ekstep` |
| `app` | It is an `array` which defines the app tags and canvas will log in the telemetry| ```[]``` |
| `partner` | It is an `array` which defines the partner tags and canvas will log in the telemetry|```[]``` |
| `dims` | It is an `array` which defines the encrypted dimension tags it should be passed from the respective channel and canvas will log in the telemetry|```[]```  |
| `context` | It is an `object` it contains the `uid`,`did`,`sid`,`mode` etc., these will be logged inside the telemetry  | ```{}``` |
| `config` | It is an `object` it contains the `repo`,`plugins`,`overlay`,`splash` etc., these will be used to configure the canvas  | ```{}```
| `apislug` | It is `string` which defines proxy setup to make a api request | ```/action```


1. **[How to render in Web environment](https://github.com/ekstep/Common-Design/wiki/GenieCanvas:-How-to-embed-or-render-content-preview-in-portal-or-editor-or-external-consumer)**

    Canvas will render inside the web environment it accepting above configuration these configurations should send through initializePreview.
 
```js

window.initializePreview(config)  

```

For more info please refer [here](https://github.com/ekstep/Common-Design/wiki/GenieCanvas:-How-to-embed-or-render-content-preview-in-portal-or-editor-or-external-consumer)
    


2. **[How to render in Device environment(cordova)](https://github.com/ekstep/Common-Design/wiki/GenieCanvas:-How-to-render-content--in-app)**

Canvas will render inside Cordova environment and it's accepting the configuration through the cordova webintent

For more info please refer [here](https://github.com/ekstep/Common-Design/wiki/GenieCanvas:-How-to-render-content--in-app)





## How to setup content player in local


 **Prerequisites**
    
   * Install NPM, Node(v6), android-sdk, Cordova and Ionic

 **How to Run**

* Clone the content player from here
* Run `npm install` in PROJECT_FOLDER/player path
* To run player in local `node app`

 **How to build**
    
   1. **Preview**
      
      Run `npm run build-preview sunbird` which creates the preview folder for sunbird instance
      
   2. **AAR**
   
 Run  `npm run build-aar sunbird`  which creates an aar file for the sunbird instance
 	
 The AAR file will create in the below path.
 
> PROJECT_FOLDER/player/platforms/android/build/outputs/aar/geniecanvas-BUILD_NUMBER-debug.aar
 

## Any Issues ?
We have an open and active [issue tracker](https://github.com/ekstep/Field-Issues/issues). Please report any issues.




