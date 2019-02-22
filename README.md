![](https://api.travis-ci.org/project-sunbird/sunbird-content-player.svg?branch=master)
[![npm version](https://badge.fury.io/js/%40project-sunbird%2Fcontent-player.svg)](https://badge.fury.io/js/%40project-sunbird%2Fcontent-player)



# Content Player

   Content-Player which is used to play/render the contents in both device and web.
   
 **Supported Content MIME Types**

| Content Type | MIME Type | 
| --- | --- | 
|ECML | application/vnd.ekstep.ecml-archive|
|HTML|application/vnd.ekstep.html-archive|
|Epub|application/epub|
|H5P|application/vnd.ekstep.h5p-archive|
|PDF|application/pdf|
|YOUTUBE|video/x-youtube|
|WEBM|video/Webm|
|MP4|video/mp4|
|EXTERNAL CONTENT|text/x-url|


## How to render the contents?

Content player is a customisable and configurable before launching any type of content inside any environment (preview or device) it expecting few configurations. Based on the configuration content will be rendered in the respective environment. 

Download content player preview from NPM 

> npm i @project-sunbird/content-player

	

### Preview object**    

```js
var previewObj = {
    "context": {
        "mode": "preview/edit/play", // to identify preview used by the user to play/edit/preview
        "authToken": "", // Auth key to make V3 api calls
        "contentId": "do_201734893", // ContentId used to get body data from content API call
        "sid": "sdjfo8e-3ndofd3-3nhfo334", // User sessionid on portal or mobile
        "did": "sdjfo8e-3ndofd3-3nhfo334", // Unique id to identify the device or browser 
        "uid": "sdjfo8e-3ndofd3-3nhfo334", // Current logged in user id
        "channel": "", // To identify the channel(Channel ID). Default value ""
        "pdata": // Producer information. Generally the App which is creating the event, default value {}
        {
            "id": "", // Producer ID. For ex: For sunbird it would be "portal" or "genie"
            "pid": "", // Optional. In case the component is distributed, then which instance of that component
            "ver": "", // version of the App
        },
        "app": [""], // Genie tags
        "partner": [""], // Partner tags
        "dims": [""], // Encrypted dimension tags passed by respective channels
        "cdata": [{ //correlation data
            "type": "", //Used to indicate action that is being correlated
            "id": "" //The correlation ID value
        }],

    },
    "config": {
        "repos": ["s3path"], // plugins repo path where all the plugins are pushed s3 or absolute folder path
        "plugins": [{ id: "org.sunbird.telemtryPlugin", "ver": "1.0", "type": "plugin" }], //Inject external custom plugins into content (for externl telemetry sync)
        "overlay": { // Configuarable propeties of overlay showing by GenieCanvas on top of the content
            "enableUserSwitcher": true, // enable/disable user-switcher, default is true for mobile & preview
            "showUser": true, // show/hide user-switcher functionality. default is true to show user information
            "showOverlay": true, // show/hide complete overlay including next/previous buttons. default value true
            "showNext": true, // show/hide next navigation button on content. default is true
            "showPrevious": true, // show/hide previous navigation button on content. default is true
            "showSubmit": false, // show/hide submit button for assessmetns in the content. default is false
            "showReload": true, // show/hide stage reload button to reset/re-render the stage. default is true
            "menu": {
                "showTeachersInstruction": true // show/hide teacher instructions in the menu
            }
        },
        "splash": { // list of configurable properties to handle splash screen shown while loading content
            "text": "Powered by Sunbird", // Text to be shown on splash screen while loading content. 
            "icon": "assets/icons/icn_genie.png", // Icon to be show on above the text(full absolute path of the image in mobiew or http image link)
            "bgImage": "assets/icons/background_1.png", // backgroung image used for splash screen while loading content(absolute folder path of the image in mobie or http image link)
            "webLink": "XXXX" // weblink to be opened on click of text
        },
        "mimetypes": [ // Content mimetypes for new cotent lucnhers
            "application/vnd.ekstep.ecml-archive",
            "application/vnd.ekstep.html-archive"
        ],
        "contentLaunchers": [ // content laucher plugins for specific content mimetypes
            { // Plugin used for ECML content to launch, It is default plugin
                "mimeType": 'application/vnd.ekstep.html-archive',
                "id": 'org.sunbird.htmlrenderer',
                "ver": 1.0,
                "type": 'plugin'
            }
        ]
    },
    "metadata": {}, //content metadata json object (from API response take -> response.result.content)
    "data": undefined // content body json object (from API response take -> response.result.content.body)
}


```
### Description

| Property Name | Description | Property Type |Default Value   | Example |
| --- | --- | --- | --- |--- |
| `host` | Defines the domain from which content should load| string|```window.location.origin```  |
| `mimetypes` | Defines the type of the content to be rendered| array | ```[ ]```|
| `contentLaunchers` | An array of plugin objects. The content player launches content based on the mimeType that is defined| array |``` []```|
| `overlay` | Defines the canvas overlay that can be customized based on the flags| object| ```{}```|
| `splash` |Before any type of content is launched, a splash screen is loaded. It can be customized. Use this field to define the splash screen objects | object |```{}```|
| `showEndpage` | Defines if the default canvas endpage should load | boolean | ```TRUE``` | False
| `pdata` |The producer information. It contains three objects - producer ID, build version and the component ID. The canvas logs this telemetry| object | NA  | {"id": "dev.sunbird.portal", "ver": "1.14.0", "pid": "sunbird-portal.contentplayer"} |
| `channel` | Channel being used by the content player| string| NA  |b00bc992eg65f1a8s8fg3291e20efc8d|
| `app` | Defines the app tags. The canvas logs in the telemetry| array |```[]``` |
| `partner` | Defines the partner tags. The canvas logs in the telemetry|array |```[]``` |
| `dims` | Defines the encrypted dimension tags that should be passed from the respective channel. The canvas logs in the telemetry| array|```[]```  |
| `context` | Contains information about the context of the content. It contains  It is an `object` it contains the `uid`,`did`,`sid`,`mode` etc., these will be logged inside the telemetry  | object| ```{}``` |
| `config` | Contains information about the configurations done for the content player. It contains It is an `object` it contains the `repo`,`plugins`,`overlay`,`splash` etc., these will be used to configure the canvas  |object|```{}```
| `apislug` | Defines the proxy setup required to make an api request |string| ```/action```


### How to Render the Content Player in the Web

The content player renders inside the web environment with the configuration mentioned above.
    
	**HTML**
	```html
	<div class="content-player">
	    <iframe id="preview" src ='./node_modules/@project-sunbird/content-player/preview.html?webview=true' width=100% height=100%></iframe>
   </div>
	
	```
	**JS**
	```js
	
	  var previewElement = jQuery('#preview')[0];
      previewElement.onload = function() {
           previewElement.contentWindow.initializePreview(configuration);
      }
	
	```
### How to Render the Content Player in a Device (cordova)

The content player renders inside the cordova environment by accepting the configuration using the ```cordova webintent```


## How to Set Up the Content Player on your Local Machine

 **Prerequisites**
    
* Install NPM, Node(v6), android-sdk, Cordova and Ionic

**Sequence of Commands**

1. Clone the content player from [here](https://github.com/project-sunbird/sunbird-content-player)
2. Run `npm install` in PROJECT_FOLDER/player path
3. Disable `isCorePluginsPackaged` variable in the `appConfig.js` to load/run the plugins without minifiying.   
4. To run player in local run `node app` in the Terminal
5. Open http://localhost:3000/ in the browser. By default player runs in the `3000` port

 ## How to Create the Build**
    
   1. **Preview**
      
   Run `npm run build-preview sunbird` . This creates the preview folder for the sunbird instance
      
   2. **AAR**
   
 Run  `npm run build-aar sunbird` . This creates an aar file for the sunbird instance

 The AAR file is created in the following path:

 >PROJECT_FOLDER/player/platforms/android/build/outputs/aar/geniecanvas-BUILD_NUMBER-debug.aar
 
   3. **Plugins Package**

 Run  `npm run package-coreplugins -- --env.channel sunbird` . This bundles all the coreplugins plugins and creates the `coreplugins.js` and `coreplugins.css`  files

   4. **Test Cases**

Run  `npm run test`. This runs the player test cases.         
 	
 

## Change Logs
 See [ChangeLogs](https://github.com/project-sunbird/sunbird-content-player/releases) for more information 

## License
This project is licensed under the MIT License - see the [LICENSE](https://github.com/project-sunbird/sunbird-content-player/blob/master/LICENSE) file for details 

## Versioning

We use [SemVer](https://semver.org/) for versioning. For the versions available, see the [tags](https://github.com/project-sunbird/sunbird-content-player/tags) on this repository.

## Any Issues ?
We have an open and active [issue tracker](https://github.com/Field-Issues/issues). Please report any issues. 




