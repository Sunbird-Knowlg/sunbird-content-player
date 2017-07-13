AppConfig = {
    version: "BUILD_NUMBER",
    processing_timeout: 10, // in minutes
    host: "",
    recorder: "AUDIO_RECORDER",
    flavor: "DEPLOYMENT",
    s3ContentHost: "/assets/public/content/",
    previewPluginspath: "/content-plugins",
    devicePluginspath: "/widgets/content-plugins",
    corePluginspath: 'coreplugins',
    apislug: '/action',
    telemetryEventsConfigFields: ['sid', 'uid','did', 'channel', 'etags', 'pdata', 'cdata', 'app', 'dims', 'partner'],
    configFields: ['origin', 'contentId', 'appInfo', 'languageInfo', 'contentExtras', 'appQualifier', 'mode', 'sid', 'uid', 'did', 'channel', 'etags', 'pdata', 'cdata', 'contentLaunchers', 'overlay', 'splash', 'showEndPage', 'app', 'dims', 'partner'],
    mimetypes: [
        "application/vnd.ekstep.ecml-archive", "application/vnd.ekstep.html-archive"
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
    contentLaunchers: [
        {
            mimeType: 'application/vnd.ekstep.html-archive',
            id: 'org.ekstep.htmlrenderer',
            ver: 1.0,
            type: 'plugin'
        }, {
            mimeType: 'application/vnd.ekstep.ecml-archive',
            id: 'org.ekstep.ecmlrenderer',
            ver: 1.0,
            type: 'plugin'
        }
    ],
    assetbase: 'assets/icons/',
    defaultPlugins: [
        {
            id: 'org.ekstep.launcher',
            ver: 1.0,
            type: 'plugin'
        }, {
            id: 'org.ekstep.repo',
            ver: 1.0,
            type: 'plugin'
        }, {
            id: 'org.ekstep.collection',
            ver: 1.0,
            type: 'plugin'
        }

    ],
    overlay: {
        enableUserSwitcher: true,
        showUser: true,
        showOverlay: true,
        showNext: true,
        showPrevious: true,
        showSubmit: false,
        showReload: true,
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
    uid: 'anonymous'
}
