/**
 *
 * @author Jitendra Singh Sankhwar
 */
var fs = require('fs');

exports.getContentList = function(cb) {
    fs.readFile('fixtures/stories.json', 'utf8', function(err, data) {
        if (err) {
            cb(err);
        } else {
            var obj = JSON.parse(data);
            if (obj != null) {
                cb(null, obj.result);
            } else {
                cb('Content list not found for stories.');
            }
        }
    });
}