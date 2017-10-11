describe('Animation Plugin test cases', function() {

    // Img plugin is used for all the event manager specs. Make sure the specs of ImagePlugin are successfull
    beforeAll(function(done) {

        spyOn(AnimationPlugin, 'init').and.callThrough();
        spyOn(AnimationPlugin, 'initPlugin').and.callThrough();
        spyOn(AnimationPlugin, 'animate').and.callThrough();

        var themeData = {
            manifest: {
                media: [
                    {id: 'sringeri', src: 'sringeri.png', type: 'image'},
                    {id: 'splash_audio', src: 'splash.ogg', type: 'audio'}
                ]
            },
            stage: [
                {id:"splash", audio: {asset: 'splash_audio'}, img: {asset: 'sringeri'}}
            ]
        }

        // AnimationPlugin.init(themeData, '');
        done();
    });

    it('Animation Plugin init test', function() {
        var themeData = {
            manifest: {
                media: [
                    {id: 'sringeri', src: 'sringeri.png', type: 'image'},
                    {id: 'splash_audio', src: 'splash.ogg', type: 'audio'}
                ]
            },
            stage: [
                {id:"splash", audio: {asset: 'splash_audio'}, img: {asset: 'sringeri'}}
            ]
        };

        AnimationPlugin.init(themeData, '');
        expect(AnimationPlugin.init).toHaveBeenCalled();
        expect(AnimationPlugin.init.calls.count()).toEqual(1);
    });

    it('Animation Plugin initPlugin test', function() {
        expect(AnimationPlugin.initPlugin).toHaveBeenCalled();
        expect(AnimationPlugin.initPlugin.calls.count()).toEqual(0);
    });

    it('Animation Plugin animate test', function() {
        expect(AnimationPlugin.animate).toHaveBeenCalled();
        expect(AnimationPlugin.animate.calls.count()).toEqual(1);
    });

});
