describe('Gridlayout Plugin test cases', function() {








    // <grid cols="2" h="20" id="grid1" iterate="testdata3.users" var="user" w="30" x="32" y="47">
    //            <shape fill="#0099FF " h="100" stroke="black" type="rect" w="100" x="0" y="0"/>
    //            <text color="black" fontsize="600" h="90" model="user.name" valign="middle" w="90" x="40" y="10"/>
    //        </grid>

    beforeEach(function(done) {            
        var parent = {
            dimensions: function() {
                return {
                    x: 0,
                    y: 0,
                    w: 500,
                    h: 500
                }
            },
            addChild: function() {}
        }
        var data = data || {
        		"x": 0,
                "y": 0,
                "w": 50,
                "h": 50 ,
                "cols":"2"
        };
        Renderer.theme = { _currentStage: '' };
        this.plugin = PluginManager.invoke('grid', data, parent);
        this.layoutPlugin = PluginManager.invoke()
        done();
    });

    it('Gridlayout plugin initPlugin', function() {
        // expect(true).toEqual(this.plugin._self.hitArea instanceof createjs.Shape);
    });


});