Plugin.extend({
	target: '',
	buttonSounds:[],
	buttons:[],
	_testis: undefined,
    _type: 'keyboard',
    _isContainer: false,
    _render: true,
	//_input:"",
    initPlugin: function(data) {
        var dims = this.relativeDims();
        var div = document.getElementById(data.id);
		var asset = data.asset;
        if (div) {
            jQuery("#" + data.id).remove();
        }
        
		div = document.createElement('div');
        target = data.target;
		var customButtons;
		
		if(data.keys)
		{
			customButtons = this._stage.getModelValue(data.keys);
		}
		
		if(data.type=="custom")
		{
			customButtons = customButtons.replace(/ /g,'');
			buttons = customButtons.split(',');
			var clearKey;
			clearKey = '<div class="key_barakhadi key_barakhadi_clear key_barakhadi_clear_24" id="clear_btn"></div>';
			if(buttons.length<24)
			{
				var difference = 24-buttons.length;
				for(var i=0; i<difference; i++)
				{
					buttons.push("");
				}
				
			}else if(buttons.length>24)
			{
				clearKey = '<div class="key_barakhadi key_barakhadi_clear" id="clear_btn"></div>';
			}
			if(buttons.length>26)
			{				
				var newbuttons = buttons.splice(0,26);
				buttons = newbuttons;
			}
			
			div.id = "keyboardBarakhadi";
			div.innerHTML = '';

			var customKeys = '';
			for(var i=0; i<buttons.length; i++)
			{
				if(i%12 == 0){
					customKeys += '<div class="key_barakhadi firstkey" id="'+buttons[i]+'_btn">'+buttons[i]+'</div>';
				}else{
					customKeys += '<div class="key_barakhadi" id="'+buttons[i]+'_btn">'+buttons[i]+'</div>';
				}
			}
			
			
			
			customKeys += clearKey;
			div.innerHTML = '<div class="container">'+customKeys+'</div>';
			
		}
		
        var parentDiv = document.getElementById(Renderer.divIds.gameArea);
		parentDiv.insertBefore(div, parentDiv.childNodes[0]);
		
		
        for (var i = buttons.length - 1; i >= 0; i--) {
           
			this.assignButtonEvent(buttons[i],asset,data.limit);
			
        };
        
		var clear_btn = document.getElementById('clear_btn');
	    clear_btn.addEventListener("click",function(){
			var txtObject = PluginManager.getPluginObject(target);
			var currentText = txtObject._self.text;
			txtObject._self.text = "";
			Renderer.update = true;
            
        });
			
		this._self = new createjs.DOMElement(div);
		
    },
	switchTarget:function(action){
		target = action.id;
	},
	assignButtonEvent:function(id,asset,limit){
		var btn = document.getElementById(id+'_btn');
		var instance = this;
        btn.addEventListener("click",function(){
            var newText = PluginManager.getPluginObject(target);
			if(newText._self.text.length < limit)
			{
				newText._self.text += id;
			}
			Renderer.update = true;
			instance._stage.setModelValue(newText._data.model, newText._self.text)
			
            
        });
	}
	
});

