AppConfig = {
	version: "BUILD_NUMBER",
	PROCESSING_TIMEOUT: 10, // in minutes
	production: "//api.ekstep.in",
	recorder: "AUDIO_RECORDER",
	flavor: "production",
	S3_CONTENT_HOST: "/assets/public/content/",
	PREVIEW_PLUGINSPATH: "/content-plugins",
	DEVICE_PLUGINSPATH: "/widgets/content-plugins",
	contentApi: '/action/content/v3/read/',
	languageApi: '/action/language/v3/',
	telemetryApi: '/action/data/v3/telemetry'
}