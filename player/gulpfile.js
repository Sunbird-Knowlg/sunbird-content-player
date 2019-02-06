var gulp = require("gulp")

gulp.task("build-telemetry-schema", function () {
	var fs = require("fs")
	var specFile = "../js-libs/telemetry-lib/telemetry-spec.js"
	var schemas = []

	if (fs.existsSync(specFile)) {
		fs.unlinkSync(specFile)
	}
	var files = fs.readdirSync("../js-libs/telemetry-lib/schema/")
	files.forEach(function (file) {
		if (file !== "event.json" && file !== "spec.js") {
			var data = fs.readFileSync("../js-libs/telemetry-lib/schema/" + file, "utf8")
			schemas.push(JSON.parse(data))
		}
	})

	fs.writeFileSync(specFile, "var telemetrySchema = " + JSON.stringify(schemas))
})
