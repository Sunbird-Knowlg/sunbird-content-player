/**
 * plugin to generate multiplication FTB quesitons with randomized questions
 * @class RangeMultiplication
 * @extends Plugin
 * @author Srivathsa Dhanraj <srivathsa.dhanraj@goodworklabs.com>
 */
Plugin.extend({
    _type: 'org.ekstep.rangemultiplication',
    
    initPlugin: function(data){
        var instance = this;

        //Get a handle on the controller
        var controller = this._stage.getController(data.model);
        if (controller) {
            this._controller = controller;
        }else{
            console.log("Controller not found");
            return;
        }
        
        this._self = new createjs.Container();
        
        var dims = this.relativeDims();
        this._self.x = dims.x;
        this._self.y = dims.y;
        
        //Get the current question index
        var ind = instance._stage._stageController._index;
        
        //Ensuring data for the item is calculated only once. (As opposed to every time the stage reloads)
        if(!this._controller._model[ind].isItemSet){
            instance._n1 = instance.getNumber(data.range1);
            instance._n2 = instance.getNumber(data.range2);
            this._controller._model[ind].isItemSet = true;
            this._controller._model[ind]._n1 = instance._n1;
            this._controller._model[ind]._n2 = instance._n2;
            
        }else{
            //In case of a stage reload, use the existing data.
            instance._n1 = this._controller._model[ind]._n1 ;
            instance._n2 = this._controller._model[ind]._n2;
            
        }
        
        //Determine the solution and set it in the item json
        instance._solution = parseInt(instance._n1) * parseInt(instance._n2);
        var answer = instance._solution;
        var preAnswerObj = this._controller.getModelValue("answer");
        preAnswerObj.ans1.value = answer;
        this._controller.setModelValue("answer", preAnswerObj);
        
		data.y = 0;
        
        //Title text
        var titleText = Object.create(data);
        titleText.id = _.unique("titleId");

        titleText.color = "#4c4c4c";
        titleText.fontsize = "3vw";
        titleText.align = "center";
        titleText.valign = "middle";
        titleText.$t = this._controller._model[ind].question;
        titleText.weight = "bold";
        titleText.w = 100;
        titleText.x = 0;
        titleText.y = 10;
        titleText.h = 15;
        PluginManager.invoke('text', titleText, this, this._stage, this._theme);
        
        //Create text fields for N1 x N2 = ______
        
        //N1
        var itemText = Object.create(data);
        itemText.id = _.unique("itemTextId");

        itemText.color = "#4c4c4c";
        itemText.fontsize = "6vw";
        itemText.align = "right";
        itemText.$t = instance._n1;
        itemText.w = data.w / 5;
        itemText.x = data.x;
        itemText.y = 43;
        itemText.h = data.h;
        PluginManager.invoke('text', itemText, this, this._stage, this._theme);
        
        // x 
        var itemText1 = Object.create(data);
        itemText1.id = _.unique("itemText1Id");
        itemText.align = "center";
        itemText1.color = "#4c4c4c";
        itemText1.fontsize = "6vw";
        itemText1.$t = "\u00D7";
        itemText1.w = data.w / 20;
        itemText1.x = itemText.w + itemText.x + 5;
        itemText1.y = 43;
        itemText1.h = data.h;
        PluginManager.invoke('text', itemText1, this, this._stage, this._theme);
        
        //N2
        var itemText2 = Object.create(data);
        itemText2.id = _.unique("itemText2Id");
        itemText2.color = "#4c4c4c";
        itemText2.fontsize = "6vw";
        itemText.align = "left";
        itemText2.$t = instance._n2
        itemText2.w = data.w / 5;
        itemText2.x = itemText1.w + itemText1.x + 5;
        itemText2.y = 43;
        itemText2.h = data.h;
        PluginManager.invoke('text', itemText2, this, this._stage, this._theme);
        
        //=
        var itemText3 = Object.create(data);
        itemText3.id = _.unique("itemText3Id");
        itemText3.color = "#4c4c4c";
        itemText.align = "center";
        itemText3.fontsize = "6vw";
        itemText3.$t = "=";
        itemText3.w = data.w / 25;
        itemText3.x = itemText2.w + itemText2.x - 4;
        itemText3.y = 43;
        itemText3.h = data.h;
        PluginManager.invoke('text', itemText3, this, this._stage, this._theme);

        //Shape for answer box
        var answerBox = Object.create(data);
        answerBox.id = _.unique("answerBoxId");
        answerBox.type = "rect";
        answerBox.stroke = "#4c4c4c";
        answerBox.fill = "#ffff99";
        answerBox.hitArea = true;
        answerBox.x = itemText3.w + itemText3.x + 4;
        answerBox.y = 40.7;
        answerBox.h = data.h / 6.3;
        answerBox.w = data.w / 3;
        PluginManager.invoke('shape', answerBox, this, this._stage, this._theme);
        
        var highlightBox = Object.create(data);
        highlightBox.id = _.unique("highlightBoxId");
        highlightBox.type = "rect";
        highlightBox.stroke = "#4c4c4c";
        highlightBox.fill = "#ffff99";
        highlightBox.hitArea = true;
        highlightBox.x = itemText3.w + itemText3.x + 4;
        highlightBox.y = 40.7;
        highlightBox.h = data.h / 6.3;
        highlightBox.w = data.w / 3;
        highlightBox.visible = false;
        PluginManager.invoke('shape', highlightBox, this, this._stage, this._theme);

        //Answer text
        var newText1 = Object.create(data);
        newText1.id = "newText";
        newText1.color = "#4c4c4c";
        newText1.align = "center";
        newText1.valign = "middle";
        newText1.fontsize = "5vw";
        newText1.model = "item.ans1";
        newText1.w = data.w / 6;
        newText1.x = itemText3.w + itemText3.x + 12.5;
        newText1.y = 43;
        newText1.h = data.h / 6.3;
        PluginManager.invoke('text', newText1, this, this._stage, this._theme);
        
        
        //Add keyboard
        var keyboardData = {
            h:25, 
            id:"sdkeyboard",
            limit:5,
            target:"newText",
            type:"custom",
            w:100,
            x:0,
            y:80,
            visible:true
        };
		
        PluginManager.invoke('org.ekstep.sdkeyboard', keyboardData, this._parent, this._stage, this._theme);
        
    
    },
    /**
     * Function to generate random number within the range provided in the item model
     * "n1-n2" generates a number between n1 and n2. 
     * "n1,n2,n3,.." picks a number from the given list
     * "n1" displays n1 directly. 
     * @param  {string} range
     * @returns {int} 
     * @memberof RangeMultiplication
     */
    getNumber:function(range){
        
        var num = undefined;
        
        var r1 = this._stage.getModelValue(range).split("-");
        if(r1.length>1){
            num = Math.floor(Math.random() * (r1[1] - r1[0])) + parseInt(r1[0]);
        }else{
            r1 = this._stage.getModelValue(range).split(",");
            if(r1.length>1){
                num = r1[Math.floor(Math.random() * r1.length)];
            }else{
                num = r1[0];
            }
        }
        return num;
    }
});
//# sourceURL=rangeMultip.js