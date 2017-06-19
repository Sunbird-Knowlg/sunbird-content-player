Plugin.extend({
    initialize: function() {
        console.info('ECML Renderer initialize')
        EkstepRendererAPI.addEventListener('renderer:ecml:launch', this.launch, this);
    },
    launch: function(event, data){
        console.log('ECML Renderer init');
    }
});

//# sourceURL=HTMLRendererePlugin.js