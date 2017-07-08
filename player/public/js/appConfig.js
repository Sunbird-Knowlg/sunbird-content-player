AppConfig = {
    version: "BUILD_NUMBER",
    processing_timeout: 10, // in minutes
    host: "",
    recorder: "AUDIO_RECORDER",
    flavor: "DEPLOYMENT",
    s3_content_host: "/assets/public/content/",
    preview_pluginspath: "/content-plugins",
    device_pluginspath: "/widgets/content-plugins",
    core_pluginspath: 'coreplugins',
    apislug: '/action',

    mimetypes:["application/vnd.ekstep.ecml-archive", "application/vnd.ekstep.html-archive"],
    default_metadata: {"identifier": "org.ekstep.item.sample", "mimeType": "application/vnd.ekstep.ecml-archive", "name": "Content Preview ", "author": "EkStep", "localData": {"name": "Content Preview ", "loadingMessage": "Without requirements or design, programming is the art of adding bugs to an empty text file. ...", "identifier": "org.ekstep.item.sample", "pkgVersion": 1 }, "isAvailable": true, "path": ""},
    content_launchers: [{
        mimeType: 'application/vnd.ekstep.html-archive',
        id: 'org.ekstep.htmlrenderer',
        ver: 1.0,
        type: 'plugin'
    }, {
        mimeType: 'application/vnd.ekstep.ecml-archive',
        id: 'org.ekstep.ecmlrenderer',
        ver: 1.0,
        type: 'plugin'
    }],
    assetbase : 'assets/icons/',
    default_plugins: [
        {id: 'org.ekstep.launcher',ver: 1.0,type: 'plugin'},
        {id: 'org.ekstep.repo',ver: 1.0, type: 'plugin'},
        {id: 'org.ekstep.collection',ver: 1.0,type: 'plugin'}

    ],
    overlay: {
        userSwitcherEnabled: true,
        showUser: true,
        showOverlay: true,
        showNext: true,
        showPrevious: true,
        showSubmit: false,
        showReload: true,
        menu: {
            showTeachersInstruction: true
        },
    },
    splash: {
		text: "Powered by EkStep",
		icon: "assets/icons/icn_genie.png",
		bgImage: "assets/icons/background_1.png",
		download_link: "https://www.ekstep.in"
	}
}
