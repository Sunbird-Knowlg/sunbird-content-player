Plugin.extend({
    _type: 'karaoke',
    _isContainer: false,
    _render: true,
    initPlugin: function(data) {
        var timer;
        console.log(timer);

        var wordIdx = 0;
        var wordQueue = data.wordqueue.data.split(",");
        timer = new Tock({
            callback: function () {
                if (wordIdx >= wordQueue.length) {
                    return;
                }

                seekTime = parseFloat(timer.msToTime(timer.lap()).split(":")[1]);
                wordTime = parseFloat(wordQueue[wordIdx]);

                if (seekTime >= wordTime) {
                    console.log(seekTime + "<=>" + wordQueue[wordIdx]);
                    $('.word').css('background-color', '');
                    $("#word-" + (wordIdx + 1)).css('background-color', 'yellow');
                    wordIdx++;
                }
            }
        });

        timer.start();
    }
});
