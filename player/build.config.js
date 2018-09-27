/**
 * Should contains only build specific configs 
 */

module.exports = {
    ekstep: {
        configFile: './public/js/appConfig.js',
        splashScreen: {
            backgroundImage: "./public/assets/icons/background_1.png"
        },
        plugins: [
            "org.ekstep.overlay-1.0",
            "org.ekstep.userswitcher-1.0",
            "org.ekstep.ecmlrenderer-1.0",

        ],
    },
    sunbird: {
        configFile: './public/js/appConfig-Sunbird.js',
        splashScreen: {
            backgroundImage: "./public/assets/icons/splacebackground_1.png"
        },
        plugins: [
            "org.sunbird.player.userswitcher-1.0",
            "org.ekstep.ecmlrenderer-1.0",
            "org.ekstep.overlay-1.0"
        ]
    }
}