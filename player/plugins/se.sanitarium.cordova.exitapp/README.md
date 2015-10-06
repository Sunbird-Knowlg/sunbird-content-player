cordova-plugin-exitapp
----------------------

This plugin adds the ability to close a Windows Phone 8 app
programatically. It was build because a WP8 app was rejected because
it didn't close the app with custom back button behavior.

## Installation

Package name on the [Cordova plugin repository](http://plugins.cordova.io) is [se.sanitarium.cordova.exitapp](http://plugins.cordova.io/#/se.sanitarium.cordova.exitapp).

To install this plugin, follow the [Command-line Interface Guide](http://cordova.apache.org/docs/en/edge/guide_cli_index.md.html#The%20Command-line%20Interface).

If you are not using the Cordova Command-line Interface, follow [Using Plugman to Manage Plugins](http://cordova.apache.org/docs/en/edge/plugin_ref_plugman.md.html).

## Usage

The usage is extremely simple:

```
navigator.app.exitApp();
```
