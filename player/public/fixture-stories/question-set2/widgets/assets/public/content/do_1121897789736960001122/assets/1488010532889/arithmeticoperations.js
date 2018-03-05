/**
 *arithmeticOperations Plugin
 *This plugin generate random numbers for addition and subtraction 
 *with and without carry/borrow and set correct answer to ans field of FTB type.
 *@param {Number} numDigit, number of digits in number. Can be 1, 2 or 3
 *@param {String} operator, can be “+” or “-”
 *@param {String} withOrWithout, Boolean value can be true or flase
 *@Note - 3 digit numbers, we can only have addition (+) without carry over 
 *@author Abha Singh @Abha.Singh@tarento.com
 */
Plugin.extend({
    _type: 'arithmeticOperations',
    /**
     *@param {Number} numDigit, number of digits in number. Can be 1, 2 or 3
     *@param {String} operator, can be “+” or “-”
     *@param {String} withOrWithout, Boolean value can be true or flase
     *@fire {function} getQuesTextTemp, prepares question text object
     *@fire {function} getQuesShapeTemp, prepares question shape object
     *@fire {function} setNumbersForAdd, @param: numDigit,withOrWithout, generate random numbers for addition and set value into controller
     *@fire {function} setNumbersForSub, @param: numDigit,withOrWithout, generate random numbers for subtraction and set value into controller
     *@fire {function} getAnswerNum, set answer value into controller
     *@fire {function} getNumKeyBoardTemp, prepares custom keyboard object and invoke nkeyboard
     */
    initPlugin: function(data) {
        var controller = this._stage.getController("item");
        if (controller) {
            this._controller = controller;
        }
        this._self = new createjs.Container();
        var dims = this.relativeDims();
        this._self.x = dims.x;
        this._self.y = dims.y;
        var quesText = this.getQuesTextTemp();
        PluginManager.invoke("text", quesText, this._stage, this._stage, this._theme);
        var quesShape = this.getQuesShapeTemp();
        PluginManager.invoke("shape", quesShape, this._stage, this._stage, this._theme);
        var numDigit = (parseInt(this._stage.getModelValue(data.numDigit)));
        var operator = this._stage.getModelValue(data.operator);
        var withOrWithout = this._stage.getModelValue(data.withOrWithout);
        if (!this._controller.getModelValue("isNumberSet")) {
            this._controller.setModelValue("isNumberSet", true);
            if (operator == '+') {
                this.setNumbersForAdd(numDigit, withOrWithout);
            } else if (operator == '-') {
                this.setNumbersForSub(numDigit, withOrWithout);
            }
        }
        this.getAnswerNum(operator);
        this.getNumKeyBoardTemp();

        var itemText = Object.create(data);
        itemText.id = _.unique("itemTextId");
        itemText.color = "#4c4c4c";
        itemText.fontsize = "4vw";
        itemText.align = "left";
        itemText.valign = "middle";
        itemText.$t = this._controller.getModelValue("num1");
        itemText.w = data.w / 2;
        itemText.x = data.w / 2 - 4;
        itemText.y = data.y - 5;
        itemText.h = data.h / 3;
        PluginManager.invoke('text', itemText, this, this._stage, this._theme);

        var itemText1 = Object.create(data);
        itemText1.id = _.unique("itemText1Id");
        itemText1.align = "center";
        itemText1.color = "#4c4c4c";
        itemText1.fontsize = "4vw";
        itemText1.$t = this._controller.getModelValue("operator");
        itemText1.w = data.w / 2;
        itemText1.x = data.x + 10;
        itemText1.y = data.y - 5 + itemText.h - 2;
        itemText1.h = itemText.h / 3;
        PluginManager.invoke('text', itemText1, this, this._stage, this._theme);

        var itemText2 = Object.create(data);
        itemText2.id = _.unique("itemText2Id");
        itemText2.color = "#4c4c4c";
        itemText2.fontsize = "4vw";
        itemText2.align = "left";
        itemText2.$t = this._controller.getModelValue("num2");
        itemText2.w = data.w / 2;
        itemText2.x = data.w / 2 - 4;
        itemText2.y = data.y - 5 + itemText.h - 2;
        itemText2.h = itemText.h / 3;
        PluginManager.invoke('text', itemText2, this, this._stage, this._theme);

        var line1 = Object.create(data);
        line1.id = _.unique("line1Id");
        line1.type = "rect";
        line1.fill = "black";
        line1.x = data.w / 4;
        line1.y = itemText2.y + itemText.h - 7;
        line1.h = 1
        line1.w = data.w / 2;
        PluginManager.invoke('shape', line1, this, this._stage, this._theme);

        var answerBox = Object.create(data);
        answerBox.id = _.unique("answerBoxId");
        answerBox.type = "rect";
        answerBox.stroke = "#719ECE";
        answerBox['stroke-width'] = "3";
        answerBox.fill = "#FFFFA5";
        answerBox.hitArea = true;
        answerBox.x = data.w / 4
        answerBox.y = itemText2.y + itemText2.h + itemText2.h + 10;
        answerBox.h = itemText.h / 1.5;
        answerBox.w = data.w / 2;
        PluginManager.invoke('shape', answerBox, this, this._stage, this._theme);

        var line2 = Object.create(data);
        line2.id = _.unique("line2Id");
        line2.type = "rect";
        line2.fill = "black";
        line2.x = data.w / 4;
        line2.y = answerBox.y + answerBox.h + 5;
        line2.h = 1;
        line2.w = data.w / 2;
        PluginManager.invoke('shape', line2, this, this._stage, this._theme);

        var newText1 = Object.create(data);
        newText1.id = "newText1";
        newText1.color = "#4c4c4c";
        newText1.align = "center";
        newText1.valign = "middle";
        newText1.fontsize = "4vw";
        newText1.model = "item.ans1";
        newText1.w = data.w / 2;
        newText1.x = data.w / 4;
        if (numDigit == 2) {
            newText1.x = data.w / 4 + 3;
        }
        if (numDigit == 3) {
            newText1.x = data.w / 4 + 5;
        }
        newText1.y = answerBox.y + 4;
        newText1.h = answerBox.h;
        PluginManager.invoke('text', newText1, this, this._stage, this._theme);
    },

    /**
     *This method prepares keyboard object and invoke nkeyboard
     */
    getNumKeyBoardTemp: function() {
        var keyBoard = {
            "h": 22,
            "id": "keypadId",
            "keys": "item.keys",
            "limit": 8,
            "target": "newText1",
            "type": "custom",
            "w": 80,
            "x": 10,
            "y": 72
        }
        PluginManager.invoke('nkeyboard', keyBoard, this._stage, this._stage, this._theme);
    },

    /**
     *This method prepares question text object
     *@return question text object
     */
    getQuesTextTemp: function() {
        return {
            "event": {
                "action": [{
                    "asset_model": "item.question_audio",
                    "command": "stop",
                    "sound": "true",
                    "type": "command"
                }, {
                    "asset_model": "item.question_audio",
                    "command": "play",
                    "type": "command"
                }],
                "type": "click"
            },
            "align": "center",
            "color": "#4c4c4c",
            "fontsize": "3vw",
            "h": 24,
            "lineHeight": 1.4,
            "model": "item.question",
            "valign": "top",
            "w": 100,
            "x": 0,
            "y": 10
        }
    },

    /**
     *This method prepares question shape object and return that object
     */
    getQuesShapeTemp: function() {
        return {
            "event": {
                "action": [{
                    "asset_model": "item.question_audio",
                    "command": "stop",
                    "sound": "true",
                    "type": "command"
                }, {
                    "asset_model": "item.question_audio",
                    "command": "play",
                    "type": "command"
                }],
                "type": "click"
            },
            "h": 24,
            "hitArea": "true",
            "type": "rect",
            "w": 100,
            "x": 0,
            "y": 10
        }
    },

    /**
     *This method generate random numbers for additon and set values into controller
     */
    setNumbersForAdd: function(numDigit, withOrWithout) {
        if (numDigit == 1) {
            this._controller.setModelValue("num1", this.generateRandomNumber(1, 8));
            var num1 = parseInt(this._controller.getModelValue("num1"));
            this._controller.setModelValue("num2", this.generateRandomNumber(1, 9 - num1));
        } else if (numDigit == 2) {
            if (withOrWithout) {
                var t1 = this.generateRandomNumber(1, 7);
                var t2 = this.generateRandomNumber(1, 8 - t1);
                var u1 = this.generateRandomNumber(1, 9);
                var u2 = this.generateRandomNumber(10 - u1, 9);
                var num1 = parseInt(String(t1) + String(u1))
                this._controller.setModelValue("num1", num1);
                var num2 = parseInt(String(t2) + String(u2))
                this._controller.setModelValue("num2", num2);
            } else {
                var t1 = this.generateRandomNumber(1, 8);
                var t2 = this.generateRandomNumber(1, 9 - t1);
                var u1 = this.generateRandomNumber(0, 9);
                var u2 = this.generateRandomNumber(0, 9 - u1);
                var num1 = parseInt(String(t1) + String(u1))
                this._controller.setModelValue("num1", num1);
                var num2 = parseInt(String(t2) + String(u2))
                this._controller.setModelValue("num2", num2);
            }
        } else if (numDigit == 3) {
            var h1 = this.generateRandomNumber(1, 8);
            var h2 = this.generateRandomNumber(1, 9 - h1);
            var t1 = this.generateRandomNumber(0, 9);
            var t2 = this.generateRandomNumber(0, 9 - t1);
            var u1 = this.generateRandomNumber(0, 9);
            var u2 = this.generateRandomNumber(0, 9 - u1);
            var num1 = parseInt(String(h1) + String(t1) + String(u1))
            this._controller.setModelValue("num1", num1);
            var num2 = parseInt(String(h2) + String(t2) + String(u2))
            this._controller.setModelValue("num2", num2);
        }
    },

    /**
     *This method generate random numbers for subtraction and set values into controller
     */
    setNumbersForSub: function(numDigit, withOrWithout) {
        if (numDigit == 1) {
            this._controller.setModelValue("num1", this.generateRandomNumber(2, 9));
            var num1 = parseInt(this._controller.getModelValue("num1"));
            this._controller.setModelValue("num2", this.generateRandomNumber(1, num1 - 1));
        } else if (numDigit == 2) {
            if (withOrWithout) {
                var t1 = this.generateRandomNumber(2, 9);
                var t2 = this.generateRandomNumber(1, t1 - 1);
                var u1 = this.generateRandomNumber(1, 8);
                var u2 = this.generateRandomNumber(u1 + 1, 9);
                var num1 = parseInt(String(t1) + String(u1))
                this._controller.setModelValue("num1", num1);
                var num2 = parseInt(String(t2) + String(u2))
                this._controller.setModelValue("num2", num2);
            } else {
                var t1 = this.generateRandomNumber(2, 9);
                var t2 = this.generateRandomNumber(1, t1 - 1);
                var u1 = this.generateRandomNumber(1, 9);
                var u2 = this.generateRandomNumber(0, u1 - 1);
                var num1 = parseInt(String(t1) + String(u1))
                this._controller.setModelValue("num1", num1);
                var num2 = parseInt(String(t2) + String(u2))
                this._controller.setModelValue("num2", num2);
            }
        }
    },

    /**
     *This method calculate correct answer for addtion and subtraction and set value into controller
     @fire {function} setAnswerNum, set correct answer value into controller 
     */
    getAnswerNum: function(operator) {
        var answer;
        if (operator == '+') {
            answer = this._controller.getModelValue("num1") + this._controller.getModelValue("num2");
        } else if (operator == '-') {
            answer = this._controller.getModelValue("num1") - this._controller.getModelValue("num2");
        }
        this.setAnswerNum(answer);
    },

    /**
     *This method update correct answer value into controller 
     */
    setAnswerNum: function(answer) {
        var preAnswerObj = this._controller.getModelValue("answer");
        preAnswerObj.ans1.value = answer;
        this._controller.setModelValue("answer", preAnswerObj);
    },

    /**
     *This method generate random number between min and max limit 
     */
    generateRandomNumber: function(min, max) {
        var result = _.random(min, max);
        return result;
    }
});
