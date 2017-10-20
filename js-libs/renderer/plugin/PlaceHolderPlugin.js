var PlaceHolderPlugin = Plugin.extend({
    _type: 'placeholder',
    _isContainer: true,
    _render: true,
    initPlugin: function(data) {
        this._self = new createjs.Container();
        var dims = this.relativeDims();
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
            }
            if (count === undefined || count === "") count = 1;

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
    getAssetBound: function (img, pad) {
        var imgBounds = img.getBounds();
        var imgW = imgBounds.width;
        var imgH = imgBounds.height;
        img.x = parseFloat(pad / 2);
        img.y = parseFloat(pad / 2);
        var imgCont = new createjs.Container();
        imgCont.addChild(img);
        imgCont.cache(0, 0, imgW + pad, imgH + pad);
        return imgCont;
    },
    computePixel: function(area, repeat) {
        return Math.floor(Math.sqrt(parseFloat(area / repeat)))
    },
    renderGridLayout: function(parent, instance, data) {
        var assetId = instance.param.asset;
        var assetSrc = instance._theme.getAsset(assetId);
        var img = new createjs.Bitmap(assetSrc);

        var getImage = function(cb) {
          if (_.isUndefined(assetSrc)) {
            console.error('"' + assetId + '" Asset not found. Please check index.ecml.')
            return
          }
            AssetManager.strategy.loadAsset(instance._stage._data.id, assetId, assetSrc, function() {
                assetSrc = instance._theme.getAsset(assetId);
                img = new createjs.Bitmap(assetSrc);
                if(!_.isNull(img.getBounds())){
                    // if !=404 then call getAssetBound
                    // Image is available, Render image inside grid
                    cb();
                 }else{
                    // If the Invlid URL of asset or 404 req
                    console.warn("Unable to find the Bounds value for " + assetId +  ",  Source - " + assetSrc);
                 }
            });
        };

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
        };

        var renderGridImages = function() {
          var x = 0,
              y = 0,
              area = instance.dimensions().w * instance.dimensions().h,
              pad = instance.dimensions().pad || 0,
              n = instance.param.count,
              rectHeight = instance.dimensions().h,
              rectWidth = instance.dimensions().w;

          // This code assumes that the img aspect ratio is 1. i.e. the image is a square
          // var pixelPerImg = instance.computePixel(area, repeat) - parseFloat(pad / 1.5);

          var imgCountRow = Math.ceil(Math.sqrt(n * rectHeight / rectWidth));
          if (Math.floor(imgCountRow * rectWidth / rectHeight) * imgCountRow < n)
            var pixelPerImgX = rectWidth / Math.ceil(imgCountRow * rectWidth / rectHeight);
          else
            pixelPerImgX = rectHeight / imgCountRow;

          var imgCountCol = Math.ceil(Math.sqrt(n * rectWidth / rectHeight));
          if (Math.floor(imgCountCol * rectHeight / rectWidth) * imgCountCol < n)
            var pixelPerImgY = rectHeight / Math.ceil(rectHeight * imgCountCol / rectWidth);
          else
            pixelPerImgY = rectWidth / imgCountCol;
          var pixelPerImg = (pixelPerImgX) > (pixelPerImgY) ? pixelPerImgX : pixelPerImgY;

          var param = instance.param;
          var paddedImg = instance.getAssetBound(img, pad);
          var assetBounds = paddedImg.getBounds();
          var assetW = assetBounds.width,
              assetH = assetBounds.height;
          paddedImg.scaleY = parseFloat(pixelPerImg / assetH);
          paddedImg.scaleX = parseFloat(pixelPerImg / assetW);
          paddedImg.x = x + pad;
          paddedImg.y = y + pad;
          var instanceBoundary = 0 + instance.dimensions().w;
          for (var i = 0; i < param.count; i++) {
              var clonedAsset = paddedImg.clone(true);
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
              Renderer.update = true;
              parent.addChild(clonedAsset);
          }
        };

        if (_.isNull(img.getBounds())) {
            // image is not avialbel. Get image from loader and then start render images in grid
            getImage(renderGridImages);
        } else {
            // Image is avialable, hence direclty render image inside grid
            renderGridImages();
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
