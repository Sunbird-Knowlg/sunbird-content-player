Plugin.extend({
    _type: 'commonmcq',
    initPlugin: function(data) {
        var controller = this._stage.getController("item");
        if (controller) {
            this._controller = controller;
        }
        var instance = this;
        var iValues = this._stage.getModelValue(data.model);
        this._self = new createjs.Container();
        var dims = this.relativeDims();
        this._self.x = dims.x;
        this._self.y = dims.y;
        if (iValues.question) {
            var quesText = {};
            quesText.id = _.unique("quesTextId");
            quesText.color = "#4c4c4c";
            quesText.align = "center";
            quesText.valign = "top";
            quesText.fontsize = "3vw";
            quesText.lineHeight = "1.4";
            quesText.$t = iValues.question;
            quesText.w = 100;
            quesText.x = 0;
            quesText.y = 10;
            quesText.h = 24;
            PluginManager.invoke('text', quesText, this, this._stage, this._theme);
        }


        if (iValues.question_image && iValues.question) {
            var quesImage = {};
            quesImage.id = _.unique("quesImageId");
            quesImage.align = "center";
            quesImage.stretch = "false";
            quesImage.asset = iValues.question_image;
            quesImage.x = 5;
            quesImage.y = 33;
            quesImage.h = 32;
            if (iValues.question_count && iValues.question_count != 1) {
                var plcQuesData = {};
                plcQuesData.id = _.unique("plcQuesDataId");
                plcQuesData.count = iValues.question_count;
                plcQuesData.asset = iValues.question_image;
                plcQuesData.type = "gridLayout";
                plcQuesData.w = 90;
                plcQuesData.x = 5;
                plcQuesData.y = 30;
                plcQuesData.h = 20;
                PluginManager.invoke('placeholder', plcQuesData, this, this._stage, this._theme);
                PluginManager.getPluginObject(plcQuesData.id)._self.on("click", function(event) {
                    audiManager.getAudiManager().stopAll();
                    audiManager.getAudiManager().play({ asset: iValues.question_audio, stageId: instance._stage._id });
                });
            } else {
                PluginManager.invoke('image', quesImage, this, this._stage, this._theme);
                PluginManager.getPluginObject(quesImage.id)._self.on("click", function(event) {
                    audiManager.getAudiManager().stopAll();
                    audiManager.getAudiManager().play({ asset: iValues.question_audio, stageId: instance._stage._id });
                });
            }

        }

        if (iValues.question_image && !iValues.question) {
            var quesImage = {};
            quesImage.id = _.unique("quesImageId");
            quesImage.align = "center";
            quesImage.stretch = "false";
            quesImage.asset = iValues.question_image;
            quesImage.x = 5;
            quesImage.y = 10;
            quesImage.h = 55;
            if (iValues.question_count && iValues.question_count != 1) {
                var plcQuesData = {};
                plcQuesData.id = _.unique("plcQuesDataId");
                plcQuesData.count = iValues.question_count;
                plcQuesData.asset = iValues.question_image;
                plcQuesData.type = "gridLayout";
                plcQuesData.w = 90;
                plcQuesData.x = 5;
                plcQuesData.y = 10;
                plcQuesData.h = 30;
                PluginManager.invoke('placeholder', plcQuesData, this, this._stage, this._theme);
                PluginManager.getPluginObject(plcQuesData.id)._self.on("click", function(event) {
                    audiManager.getAudiManager().stopAll();
                    audiManager.getAudiManager().play({ asset: iValues.question_audio, stageId: instance._stage._id });
                });
            } else {
                PluginManager.invoke('image', quesImage, this, this._stage, this._theme);
                PluginManager.getPluginObject(quesImage.id)._self.on("click", function(event) {
                    audiManager.getAudiManager().stopAll();
                    audiManager.getAudiManager().play({ asset: iValues.question_audio, stageId: instance._stage._id });
                });
            }

        }

        this.invokeChildren(data, this, this._stage, this._theme);
        if (!iValues.question_image && iValues.question) {
            var optObj = PluginManager.getPluginObject("queOption");
            optObj._self.visible = true;
            var hideoptObj = PluginManager.getPluginObject("hideQueOption");
            hideoptObj._self.visible = false;
            Renderer.update = true;
        }

        if (!iValues.question && !iValues.question_image && !iValues.question_count && iValues.question_audio) {
            var optObj = PluginManager.getPluginObject("queOption");
            optObj._self.visible = true;
            var hideoptObj = PluginManager.getPluginObject("hideQueOption");
            hideoptObj._self.visible = false;
            var groupTagObj = PluginManager.getPluginObject("groupTag");
            groupTagObj._self.visible = true;
            Renderer.update = true;
        }
    }

});
