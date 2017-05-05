var target;
var buttonSounds = [];
var buttons = [];
Plugin.extend({
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
		if(data.type=="numeric")
		{
			buttons=["1","2","3","4","5","6","7","8","9","0"];
			div.id = "keyboard";
			div.innerHTML = '<div class="container"><div class="key_numeric firstkey" id="0_btn">0</div><div class="key_numeric" id="1_btn">1</div><div class="key_numeric" id="2_btn">2</div><div class="key_numeric" id="3_btn">3</div><div class="key_numeric" id="4_btn">4</div><div class="key_numeric" id="5_btn">5</div><div class="key_numeric" id="6_btn">6</div><div class="key_numeric" id="7_btn">7</div><div class="key_numeric" id="8_btn">8</div><div class="key_numeric" id="9_btn">9</div><div class="key_numeric backspace" id="bk_btn">BK</div><div class="space key_numeric" id="space_btn">SPACE</div></div>';
			
		}else if(data.type=="alphanumeric")
		{
			
			buttons=["1","2","3","4","5","6","7","8","9","0","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"];
			div.id = "keyboardAlphanumeric";
			div.innerHTML = '<div class="container"><div class="key_alphanumeric firstkey" id="0_btn">0</div><div class="key_alphanumeric" id="1_btn">1</div><div class="key_alphanumeric" id="2_btn">2</div><div class="key_alphanumeric" id="3_btn">3</div><div class="key_alphanumeric" id="4_btn">4</div><div class="key_alphanumeric" id="5_btn">5</div><div class="key_alphanumeric" id="6_btn">6</div><div class="key_alphanumeric" id="7_btn">7</div><div class="key_alphanumeric" id="8_btn">8</div><div class="key_alphanumeric" id="9_btn">9</div><div class="key_alphanumeric" id="a_btn">a</div><div class="key_alphanumeric" id="b_btn">b</div><div class="key_alphanumeric" id="c_btn">c</div><div class="key_alphanumeric" id="d_btn">d</div><div class="key_alphanumeric" id="e_btn">e</div><div class="key_alphanumeric" id="f_btn">f</div><div class="key_alphanumeric" id="g_btn">g</div><div class="key_alphanumeric" id="h_btn">h</div><div class="key_alphanumeric" id="i_btn">i</div><div class="key_alphanumeric" id="j_btn">j</div><div class="key_alphanumeric" id="k_btn">k</div><div class="key_alphanumeric" id="l_btn">l</div><div class="key_alphanumeric" id="m_btn">m</div><div class="key_alphanumeric" id="n_btn">n</div><div class="key_alphanumeric" id="o_btn">o</div><div class="key_alphanumeric" id="p_btn">p</div><div class="key_alphanumeric" id="q_btn">q</div><div class="key_alphanumeric" id="r_btn">r</div><div class="key_alphanumeric" id="s_btn">s</div><div class="key_alphanumeric" id="t_btn">t</div><div class="key_alphanumeric" id="u_btn">u</div><div class="key_alphanumeric" id="v_btn">v</div><div class="key_alphanumeric" id="w_btn">w</div><div class="key_alphanumeric" id="x_btn">x</div><div class="key_alphanumeric" id="y_btn">y</div><div class="key_alphanumeric" id="z_btn">z</div><div class="key_alphanumeric backspace_alphanumeric" id="bk_btn">BK</div><div class="space_an key_alphanumeric" id="space_btn">SPACE</div></div>';
			
		}else if(data.type=="custom")
		{
			customButtons = customButtons.replace(/ /g,'');
			buttons = customButtons.split(',');
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
				buttonSounds[i] = new Audio('assets/'+buttons[i]+'.mp3');
			}
			var clearKey = '<div class="key_barakhadi key_barakhadi_clear" id="clear_btn">CLEAR</div>';
			customKeys += clearKey;
			div.innerHTML = '<div class="container">'+customKeys+'</div>';
			
		}
		
        var parentDiv = document.getElementById(Renderer.divIds.gameArea);
		parentDiv.insertBefore(div, parentDiv.childNodes[0]);
		
		
        for (var i = buttons.length - 1; i >= 0; i--) {
           
			this.assignButtonEvent(buttons[i],asset,data.limit);
			
        };
        
		//some spl btns
		var clear_btn = document.getElementById('clear_btn');
	    clear_btn.addEventListener("click",function(){
			var txtObject = PluginManager.getPluginObject(target);
			var currentText = txtObject._self.text;
			txtObject._self.text = "";
			Renderer.update = true;
            
        });
		
		/*var space_btn = document.getElementById('space_btn');
	    space_btn.addEventListener("click",function(){
            var txtObject = PluginManager.getPluginObject(target);
			var currentText = txtObject._self.text;
			if(txtObject._self.text.length < data.limit)
			{
				txtObject._self.text = currentText + " ";
			}
			Renderer.update = true;
        });*/
		
		this._self = new createjs.DOMElement(div);

		var exp = parseFloat(PluginManager.defaultResWidth * data.x / 100);
		var cw = this._parent.dimensions().w;
        var width = parseFloat(cw * data.x / 100);
        var scale = parseFloat(width / exp);
        
		var posX = 0;
		var posY = 0;
		
		if(data.type=="numeric")
		{
			posX = 15;
			posY = 80;
		}else if(data.type=="alphanumeric")
		{
			posX = 20;
			posY = 80;
		}else if(data.type=="custom")
		{
			//posX = 5;
			//posY = 1;
			posX = data.x;
			posY = data.y;
		}
		
		this._self.x =  this._parent.dimensions().w * posX * 0.01;
		this._self.y =  this._parent.dimensions().h * posY * 0.01;
		
		
    },
	hideKeyboard: function(action) {
		this._self.visible= !this._self.visible;
		Renderer.update = true;
	},
	switchTarget:function(action){
		target = action.id;
	},
	assignButtonEvent:function(id,asset,limit){
		var btn = document.getElementById(id+'_btn');
		//console.log("adding listener for "+id+"_btn");
		var instance = this;
        btn.addEventListener("click",function(){
            //var txtArea = document.getElementById(_input);
			var newText = PluginManager.getPluginObject(target);
			if(newText._self.text.length < limit)
			{
				newText._self.text += id;
			}
			buttonSounds[buttons.indexOf(id)].play();
			Renderer.update = true;
			instance._stage.setModelValue(newText._data.model, newText._self.text)
			console.log('Updated model value:',instance._stage.getModelValue(newText._data.model));
	        //txtArea.value = txtArea.value + id;
            
        });
	}
	
});

//PluginManager.registerPlugin('keyboard', CustomKeyboard);
