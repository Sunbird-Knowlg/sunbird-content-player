Plugin.extend({
    _type: 'org.ekstep.progressbar',
    _render: true,
    _isContainer: true,
    _stageId: 0,
    initPlugin: function(data) {
        this._data = data;
        var dims = this.relativeDims();
        this._self = new createjs.Container();
        this._self.x = dims.x;
        this._self.y = dims.y;
        this._self.w = dims.w;
        this._self.h = dims.h;
        var instance = this;

        var groupObj = {
            "x": 0,
            "y": data.y,
            "w": 100,
            "h": 100,
            "shape": [],
            "text": {}
        }
        var shapeW = data.w / data.questions;

        //PluginManager.invoke('text', itemText1, this, this._stage, this._theme);


        /* For loop to create multiple objects with data to create shape */
        for (var i = 0; i < data.questions; i++) {
            var shapeData = {
                id: "shape" + i,
                x: i * shapeW,
                y: 0,
                h: 100,
                w: shapeW,
                stroke: data.progressbarStroke,
                fill: "#ddd"
            }
            groupObj.shape.push(shapeData);

        }

        var assessData = [];

        /*Loop to get the latest OE_ASSESS telemetery 
            data for each question*/



        var progressbarObject = this._theme.getParam("progressbarObj");
        var startIndex, endIndex;
        var currentStageid = this._theme._currentStage;


        if (_.isUndefined(progressbarObject)) {
            var obj = {};
            obj[currentStageid] = [];
            this._theme.setParam("progressbarObj", obj);
        } else {
            if (_.isUndefined(progressbarObject[currentStageid])) {
                progressbarObject[currentStageid] = [];
            } else {
                assessData = progressbarObject[currentStageid];
            }
        }


        function getOEAssessData() {
            var isNavigate = false;
            var index = 0;
            for (var i = 0; i < TelemetryService._data.length; i++) {
               var telemetryObj = TelemetryService._data[i];
                if (!_.isUndefined(telemetryObj) && telemetryObj.name == "OE_START") {
                    index = i;
                }
            }
            for (var i = index; i < TelemetryService._data.length; i++) {
                var telemetryObj = TelemetryService._data[i];
                if (!_.isUndefined(telemetryObj)) {

                    if (telemetryObj.name == "OE_NAVIGATE") {
                        if (telemetryObj.event.edata.eks.stageto == currentStageid) {
                            startIndex = i;
                            isNavigate = true;
                        }

                    }
                }
            }
            if (!isNavigate) {
                startIndex = 0;
            };

            for (var j = startIndex; j <= TelemetryService._data.length; j++) {

                var telObj = TelemetryService._data[j];
                if (!_.isUndefined(telObj)) {
                    if (telObj.name == "OE_ASSESS") {
                        var count = 0;
                        if (assessData.length == 0) {
                            assessData.push(telObj);
                        } else {
                            // assessData.push(TelemetryService._data[i]);
                            for (var n = 0; n < assessData.length; n++) {
                                if (assessData[n].event.edata.eks.qid == telObj.event.edata.eks.qid) {
                                    assessData[n] = telObj;
                                    count++;
                                }
                            }
                            if (count == 0) {
                                assessData.push(telObj);
                            }
                        }
                    }

                }
            }




            /*Sorting OE_ASSESS arrary based on createdtime and 
            checking answer to show the progressbar*/
            if (assessData.length > 0) {
                _.sortBy(assessData, 'createdTime');
                for (var i = 0; i < assessData.length; i++) {
                    if (assessData[i].event.edata.eks.pass == "Yes") {
                        groupObj.shape[i].fill = data.progressbarSuccess;
                    } else if (assessData[i].event.edata.eks.pass == "No") {
                        groupObj.shape[i].fill = data.progressbarFailure;
                    }
                }
            }
            var attemptedQuestions = assessData.length;
            var itemText = {};

            var fontsize = String( data.fontSize / 16 + "em");

            itemText.id = _.unique("itemTextId");
            itemText.align = "left";
            itemText.valign = "center";
            itemText.color = "#4c4c4c";
            itemText.fontsize = fontsize;
            itemText.$t = attemptedQuestions + "/" + data.questions;
            itemText.w = 100 - data.w;
            itemText.x = data.w + 1;
            itemText.y = 0;
            itemText.h = 100;
            groupObj.text = itemText;

            PluginManager.invoke('g', groupObj, instance, instance._stage, instance._theme);
            Renderer.update = true;

            if (!_.isUndefined(progressbarObject)) {

                progressbarObject[currentStageid] = assessData;
                instance._theme.setParam("progressbarObj", progressbarObject);
            }
        }




        setTimeout(function() {
            getOEAssessData();

        }, 500);



    }
});
