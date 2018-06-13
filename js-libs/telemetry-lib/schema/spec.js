
var fs = require('fs');
var specFile = 'telemetry-spec.js';
var schemas = [];

if(fs.existsSync(specFile)) {
    fs.unlinkSync(specFile);
}
var files = fs.readdirSync('.');
files.forEach(function(file) {
    if(file != 'event.json' && file != 'spec.js') {
        var data = fs.readFileSync(file, 'utf8');
        schemas.push(JSON.parse(data));
    }
})

fs.writeFileSync(specFile, 'var telemetrySchema = ' + JSON.stringify(schemas));

var Ajv = require('ajv');
var ajv = new Ajv({schemas: schemas});
var event = '{"actor":{"id":"d2fc1853-ce1a-4c1a-be62-fe097296ee31","type":"User"},"context":{"cdata":[{"id":"e6bf1ec6e14ac14373dbb2d02f12c914","type":"ContentSession"}],"channel":"505c7c48ac6dc1edc9b08f21db5a571d","did":"4c363654b47f57799c1e699a17ee1b44576f926d","env":"contentplayer","pdata":{"id":"prod.diksha.app","pid":"sunbird.app.contentplayer","ver":"2.0.93"},"rollup":{},"sid":"823ad8b1-df4d-49f3-adde-4f7449333ee9"},"edata":{"id":{"type":"renderer:device:back"},"pageid":"scene842d1c19-d1df-495d-83aa-5e0f805bdb24","subtype":"","type":"TOUCH"},"eid":"INTERACT","ets":1.52744477028E12,"mid":"d2d5d9ed-2fcc-4ff4-8cb7-287d51e9427a","object":{"id":"do_30080790","type":"Content","ver":"1.0"},"tags":[],"ver":"3.0","@version":"1","@timestamp":"2018-05-27T18:13:04.708Z","metadata":{"checksum":"d2d5d9ed-2fcc-4ff4-8cb7-287d51e9427a"},"uuid":"3e41aba3-0c25-4d7a-a3bf-aa79b1073c4920","key":"3e41aba3-0c25-4d7a-a3bf-aa79b1073c4920","type":"events","ts":"2018-05-27T18:12:50.280+0000"}';
var validate = ajv.getSchema('http://api.ekstep.org/telemetry/interact');
console.log()
var valid = validate(JSON.parse(event));
if (valid) {
    console.log('Valid!');
} else {
    console.log('Invalid: ' + ajv.errorsText(validate.errors));
}
