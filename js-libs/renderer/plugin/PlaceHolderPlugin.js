var PlaceHolderPlugin = Plugin.extend({
    _type: 'placeholder',
    _isContainer: true,
    _render: true,
    initPlugin: function(data) {
        console.info("Placeholder data", data);
        this._self = new createjs.Container();
        var dims = this.relativeDims();
        console.info("dims", dims);
        this._self.x = dims.x;
        this._self.y = dims.y;
        var instance = this;
        this.renderPlaceHolder(instance);
    },
    renderPlaceHolder: function(instance) {
        var data = instance._data;
        if (data.model) {
            instance.param = instance._stage.getModelValue(data.model);
        } else if (data.param) {
            instance.param = instance._stage.params[data.param.trim()];
        } else {

            // Get the model values individually
            // Either as a direct literal attribute, param or from model
            var type = data.type;
            if (type === undefined) {
                if (data['param-type']) type = instance.evaluateExpr(data['param-type'].trim());
                else if (data['model-type']) type = instance._stage.getModelValue(data['model-type'].trim());
            }

            var count = data.count;
            if (count === undefined) {
                if (data['param-count']) count = instance.evaluateExpr(data['param-count'].trim());
                else if (data['model-count']) count = instance._stage.getModelValue(data['model-count'].trim());
                else count = 1;
            }

            var asset = data.asset;
            if (asset === undefined) {
                if (data['param-asset']) asset = instance.evaluateExpr(data['param-asset'].trim());
                else if (data['model-asset']) asset = instance._stage.getModelValue(data['model-asset'].trim());
            }

            instance.param = {
                type: type,
                asset: asset,
                count: count
            }
        }
        console.info("count", count);

        if (instance.param) {

            // Asset is mandatory
            if (instance.param.asset) {
                if (instance.param.type == 'gridLayout') {
                    instance.renderGridLayout(instance, instance, data);
                } else if (instance.param.type == 'image') {
                    instance.renderImage(instance);
                } else if (instance.param.type == 'text') {
                    instance.renderText(instance);
                }
            }
        }
    },
    renderText: function(instance) {
        var param = instance.param;
        var data = instance._data;
        data.$t = param.asset;
        PluginManager.invoke('text', data, instance._parent, instance._stage, instance._theme);
    },
    renderImage: function(instance) {
        var param = instance.param;
        var data = instance._data;
        data.asset = param.asset;
        PluginManager.invoke('image', data, instance._parent, instance._stage, instance._theme);
    },
    renderGridLayout: function(parent, instance, data) {
        console.info("parent", parent);
        var computePixel = function(area, repeat) {
            return Math.floor(Math.sqrt(parseFloat(area / repeat)))
        }

        var paddedImageContainer = function(assetId, pad) {
            var img = new createjs.Bitmap(instance._theme.getAsset(assetId));
            var imgBounds = img.getBounds();
            var imgW = 0;
            var imgH = 0;
            //TODO: this is just temporary fix for placeholder render next page issue
            if (_.isUndefined(imgBounds)) {
                imgW = imgBounds.width;
                imgH = imgBounds.height;
            }
            img.x = parseFloat(pad / 2);
            img.y = parseFloat(pad / 2);
            var imgCont = new createjs.Container();
            imgCont.addChild(img);
            imgCont.cache(0, 0, imgW + pad, imgH + pad);
            return imgCont;
        }

        var enableDrag = function(asset, snapTo) {
            asset.cursor = "pointer";
            asset.on("mousedown", function(evt) {
                this.parent.addChild(this);
                this.offset = {
                    x: this.x - evt.stageX,
                    y: this.y - evt.stageY
                };
            });
            asset.on("pressmove", function(evt) {
                this.x = evt.stageX + this.offset.x;
                this.y = evt.stageY + this.offset.y;
                Renderer.update = true;
            });
            if (snapTo) {
                asset.on("pressup", function(evt) {
                    var plugin = PluginManager.getPluginObject(data.snapTo);
                    var dims = plugin._dimensions;
                    var x = dims.x,
                        y = dims.y,
                        maxX = dims.x + dims.w,
                        maxY = dims.y + dims.h;
                    var snapSuccess = false;
                    if (this.x >= x && this.x <= maxX) {
                        if (this.y >= y && this.y <= maxY) {
                            snapSuccess = true;
                        }
                    }
                    if (!snapSuccess) {
                        this.x = this.origX;
                        this.y = this.origY;
                    }
                });
            }
        }

        var x = 0,
            y = 0,
            area = instance.dimensions().w * instance.dimensions().h,
            pad = instance.dimensions().pad || 0,
            repeat = instance.param.count;

        // This code assumes that the img aspect ratio is 1. i.e. the image is a square
        // Hardcoding the cell size adjusting factor to 1.5. Need to invent a new algorithm
        var pixelPerImg = computePixel(area, repeat || 1) - parseFloat(pad / 1.5);

        var param = instance.param;
        param.paddedImg = paddedImageContainer(param.asset, pad);
        var assetBounds = param.paddedImg.getBounds();
        var assetW = assetBounds.width,
            assetH = assetBounds.height;
        param.paddedImg.scaleY = parseFloat(pixelPerImg / assetH);
        param.paddedImg.scaleX = parseFloat(pixelPerImg / assetW);
        param.paddedImg.x = x + pad;
        param.paddedImg.y = y + pad;

        var instanceBoundary = 0 + instance.dimensions().w;
        for (i = 0; i < param.count; i++) {
            var clonedAsset = param.paddedImg.clone(true);
            if ((x + pixelPerImg) > instanceBoundary) {
                x = 0;
                y += pixelPerImg + pad;
            }
            clonedAsset.x = x + pad;
            clonedAsset.y = y + pad;
            clonedAsset.origX = x + pad;
            clonedAsset.origY = y + pad;
            x += pixelPerImg;
            if (instance._data.enabledrag) {
                enableDrag(clonedAsset, data.snapTo);
            }
            parent.addChild(clonedAsset);
        }
    },
    refresh: function() {
        this._self.removeAllChildren();
        this._currIndex = 0;
        this.renderPlaceHolder(this);
        Renderer.update = true;
    }
});
PluginManager.registerPlugin('placeholder', PlaceHolderPlugin);
