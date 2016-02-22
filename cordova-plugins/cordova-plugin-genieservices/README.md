

# cordova-plugin-genieservices


This plugin provides the ability to send telemetry, get user profile, get content and content list.



## Installation

    cordova plugin add https://username@github.com/ekstep/Genie-Canvas.git#:/cordova-plugins/cordova-plugin-genieservices/

* change `username` in the above URL. It is a private repository so, the same user should have access to add plugin.

## Supported Platforms

- Android


## Telemetry

### telemetry.send:
uses to send any telemetry event.

#### Parameters
* `event` - event JSON object to send.

#### Example

```javascript
    telemetry.send({"ver":"2.0","sid":"fbc456f9-d5ac-4d30-84b6-89f610b07233","uid":"fbc456f9-d5ac-4d30-84b6-89f610b07233","did":"fbc456f9-d5ac-4d30-84b6-89f610b07233","edata":{"eks":{}},"eid":"OE_START","gdata":{"id":"numeracy_377","ver":"17"},"ets":1455334673210})
    .then(function() {
        // handle success action.
    }).catch(function(err) {
        // handle error.
    });
```

## GenieService

### genieservice.getCurrentUser:
 uses to get the current user of the genie.

#### Example

```javascript
    genieservice.getCurrentUser()
    .then(function(user) {
        // handle success action.
    }).catch(function(err) {
        // handle error.
    });
```

### genieservice.getMetaData: 
uses to get the app metadata.

#### Example

```javascript
    genieservice.getMetaData()
    .then(function(data) {
        // handle success action.
    }).catch(function(err) {
        // handle error.
    });
```

### genieservice.getContent: 
uses to get the content by id.

#### Parameters
* `id` - identifier of the content to fetch.

#### Example

```javascript
    genieservice.getContent("org.ekstep.akshara")
    .then(function(data) {
        // handle success action.
    }).catch(function(err) {
        // handle error.
    });
```

### genieservice.getContentList:
uses to get the content list.

#### Parameters
* `filters` - an array of filters to get the filtered content list. Pass empty array to get all.

#### Example

```javascript
    var filters = [];
    genieservice.getContentList(filters)
    .then(function(list) {
        // handle success action.
    }).catch(function(err) {
        // handle error.
    });
```
