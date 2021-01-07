/**
 * Should contains only build specific configs
 */

module.exports = {
	ekstep: {
		configFile: "./public/js/appConfig.js",
		splashScreen: {
			backgroundImage: "./public/assets/icons/background_1.png"
		},
		plugins: [{ id: "org.ekstep.overlay", ver: "1.0", minify: true, package: true },
			{ id: "org.ekstep.nextnavigation", ver: "1.0", minify: false, package: true },
			{ id: "org.ekstep.previousnavigation", ver: "1.0", minify: false, package: true },
			{ id: "org.ekstep.userswitcher", ver: "1.0", minify: true, package: true },
			{ id: "org.ekstep.ecmlrenderer", ver: "1.0", minify: true, package: false },
			{ id: "org.ekstep.endpage", ver: "1.0", minify: false, package: true },
			{ id: "org.sunbird.assess.endpage", ver: "1.0", minify: false, package: true }
		]
	},
	sunbird: {
		configFile: "./public/js/appConfig-Sunbird.js",
		splashScreen: {
			backgroundImage: "./public/assets/icons/splacebackground_1.png"
		},
		plugins: [
			{ id: "org.ekstep.overlay", ver: "1.0", minify: true, package: true },
			{ id: "org.ekstep.nextnavigation", ver: "1.0", minify: false, package: true },
			{ id: "org.ekstep.previousnavigation", ver: "1.0", minify: false, package: true },
			{ id: "org.sunbird.player.userswitcher", ver: "1.0", minify: true, package: true },
			{ id: "org.ekstep.ecmlrenderer", ver: "1.0", minify: true, package: false },
			{ id: "org.sunbird.player.endpage", ver: "1.1", minify: false, package: true },
			{ id: "org.ekstep.videorenderer", ver: "1.1", minify: false, package: true },
			{ id: "org.ekstep.pdfrenderer", ver: "1.0", minify: false, package: true },
			{ id: "org.ekstep.epubrenderer", ver: "1.0", minify: false, package: true },
			{ id: "org.sunbird.assess.endpage", ver: "1.0", minify: false, package: true },
			{ id: "org.ekstep.youtuberenderer", ver: "1.0", minify: false, package: true }
		]
	}
}
