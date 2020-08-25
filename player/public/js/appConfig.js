AppConfig = {
	version: "BUILD_NUMBER",
	appQualifier: "org.ekstep.genieservices",
	processing_timeout: 10, // in minutes
	host: "",
	canvasVersion: "genie-canvas-version",
	recorder: "AUDIO_RECORDER",
	flavor: "DEPLOYMENT",
	heartBeatTime: 180000,
	isCorePluginsPackaged: true, // Default to TRUE, For local development turn off this flag.
	s3ContentHost: "/assets/public/content/",
	previewPluginspath: "/content-plugins",
	devicePluginspath: "/widgets/content-plugins",
	corePluginspath: "coreplugins",
	apislug: "/action",
	telemetryEventsConfigFields: ["env", "sid", "uid", "did", "channel", "etags", "pdata", "cdata", "app", "dims", "partner", "tags", "rollup", "contextRollup", "mode", "enableTelemetryValidation", "timeDiff"],
	mimetypes: [
		"application/vnd.ekstep.ecml-archive", "application/vnd.ekstep.html-archive", "application/vnd.ekstep.h5p-archive", "application/epub", "video/mp4", "application/pdf", "video/x-youtube", "video/webm"
	],
	whiteListUrl: [
		'self',
		'https://*.blob.core.windows.net/**',
		'https://*.s3-ap-south-1.amazonaws.com/**',
		'https://ekstep-public-*.s3-ap-south-1.amazonaws.com/**'
	],
	defaultMetadata: {
		"identifier": "org.ekstep.item.sample",
		"mimeType": "application/vnd.ekstep.ecml-archive",
		"name": "Content Preview ",
		"author": "EkStep",
		"localData": {
			"name": "Content Preview ",
			"loadingMessage": "Without requirements or design, programming is the art of adding bugs to an empty text file. ...",
			"identifier": "org.ekstep.item.sample",
			"pkgVersion": 1
		},
		"isAvailable": true,
		"path": ""
	},
	questionMinFontSize: '1.285em',
	contentLaunchers: [{
		mimeType: ["application/vnd.ekstep.html-archive", "application/vnd.ekstep.h5p-archive"],
		id: "org.ekstep.htmlrenderer",
		ver: 1.0,
		type: "plugin"
	}, {
		mimeType: ["application/vnd.ekstep.ecml-archive"],
		id: "org.ekstep.ecmlrenderer",
		ver: 1.0,
		type: "plugin"
	},
	{
		mimeType: ["application/epub"],
		id: "org.ekstep.epubrenderer",
		ver: 1.0,
		type: "plugin"
	},
	{
		mimeType: ["video/mp4", "video/webm"],
		id: "org.ekstep.videorenderer",
		ver: 1.1,
		type: "plugin"
	},
	{
		mimeType: [ "video/x-youtube"],
		id: "org.ekstep.youtuberenderer",
		ver: 1.0,
		type: "plugin"
	},
	{
		mimeType: ["application/pdf"],
		id: "org.ekstep.pdfrenderer",
		ver: 1.0,
		type: "plugin"
	},
	{
		mimeType: ["text/x-url"],
		id: "org.ekstep.extcontentpreview",
		ver: 1.0,
		type: "plugin"
	}

	],
	assetbase: "assets/icons/",
	defaultPlugins: [{
		id: "org.ekstep.launcher",
		ver: 1.0,
		type: "plugin"
	}, {
		id: "org.ekstep.repo",
		ver: 1.0,
		type: "plugin"
	}, {
		id: "org.ekstep.telemetrysync",
		ver: 1.0,
		type: "plugin"
	}, {
		id: "org.ekstep.toaster",
		ver: 1.0,
		type: "plugin"
	}, {
		id: "org.ekstep.alert",
		ver: 1.0,
		type: "plugin"
	}, {
		id: "org.ekstep.userswitcher",
		ver: 1.0,
		type: "plugin"
	}],
	overlay: {
		enableUserSwitcher: true,
		showUser: true,
		showOverlay: true,
		showNext: true,
		showPrevious: true,
		showSubmit: false,
		showReload: true,
		showContentClose: false,
		menu: {
			showTeachersInstruction: true
		}
	},
	splash: {
		text: "Powered by EkStep",
		icon: "assets/icons/icn_genie.png",
		bgImage: "assets/icons/background_1.png",
		webLink: "https://www.ekstep.in"
	},
	showEndPage: true,
	env: "contentplayer",
	pdata: { "id": "in.ekstep", "ver": "1.0", "pid": "contentplayer" },
	channel: "in.ekstep",
	etags: {
		app: [],
		partner: [],
		dims: []
	},
	tags: [],
	context: {},
	rollup: {},
	config: {}
}
