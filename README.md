# Genie-Canvas
Genie Canvas : Quiz/Story App

### Setup of Genie-Canvas:

* Install android-sdk.
* Install npm.
* Install cordova and ionic framwork.
* Install grunt.

### How to build:
* Clone the project.
* Change to PROJECT_FOLDER/player (cd player)
* Run `npm install`
* Run `grunt init-setup`
* Run `grunt build-aar` - to build normal aar files.
* Run `grunt build-aar-xwalk` - to build xwalk aar files.

The .aar files are created at the below path.

PROJECT_FOLDER/player/platforms/android/build/outputs/aar/geniecanvas-BUILD_NUMBER-debug.aar
PROJECT_FOLDER/player/platforms/android/CordovaLib/build/outputs/aar/CordovaLib-debug.aar
