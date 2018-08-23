![](https://api.travis-ci.org/project-sunbird/sunbird-content-player.svg?branch=master)


# sunbird-content-player
sunbird-content-player : Which is used to render or play the contents in both web and mobile apps.

### Setup 

* Install android-sdk.
* Install npm 
* Install node  - 6
* Install cordova and ionic framwork.


### How run palyer:
* Clone the project.
* Change to PROJECT_FOLDER/player (cd player)
* Run `npm install`
* Run `node app`

### How to build preview
 * Run `npm run package-coreplugins`
 * Run `npm run build-sunbird`
 * Run `grunt build-preview`

### How to build aar 
 * Run `npm run package-coreplugins`
 * Run `npm run build-sunbird`
 * Run `grunt build-app`

The .aar files are created at the below path.

`PROJECT_FOLDER/player/platforms/android/build/outputs/aar/geniecanvas-BUILD_NUMBER-debug.aar`
`PROJECT_FOLDER/player/platforms/android/CordovaLib/build/outputs/aar/CordovaLib-debug.aar`
