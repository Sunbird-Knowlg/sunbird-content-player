const fs = require("fs")
module.exports = function (grunt) {
	// eslint-disable-next-line
	var target = grunt.option("target") || "ekstep"

	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),
		version: "3.2.",
		buildNumber: process.env.BUILD_NUMBER,
		mkdir: {
			all: {
				options: {
					create: ["www"]
				}
			}
		},
		watch: {
			// run unit tests with karma (server needs to be already running)
			/* karma: {
                tasks: ['karma:unit:run'] //NOTE the :run flag
            }, */
			src: {
				files: "../js-libs/**/*.js",
				tasks: ["uglify:renderermin"]
			}
		},
		karma: {
			renderer: {
				configFile: "../js-libs/renderer/test/karma.renderer.config.js"
			},
			app: {
				configFile: "public/test/karma.app.config.js"
			},
			telemetryV3: {
				configFile: "../js-libs/telemetry-lib/test/karma.renderer.config.js"
			},
			telemetryV3Manager: {
				configFile: "../js-libs/telemetry/test/karma.renderer.config.js"
			},
			telemetryFunV3: {
				configFile: "../js-libs/telemetry-lib/test/karma.telemetry.fun.config.js"
			}

		},
		concat: {
			css: {
				src: [
					"public/styles/ionic.css",
					"public/lstyles/bookshelf_slider.css",
					"public/styles/skin02.css",
					"public/styles/toastr.min.css",
					"public/styles/jquery.mCustomScrollbar.min.css"
				],
				dest: "www/styles/renderer.external.min.css"
			},
			externaljs: {
				src: [
					"public/libs/jquery.min.js",
					"public/libs/jquery.easing.1.3.js",
					"public/libs/jquery.bookshelfslider.min.js",
					"public/libs/async.min.js",
					"public/libs/toastr.min.js",
					"public/libs/md5.js",
					"public/libs/jquery.mCustomScrollbar.concat.min.js",
					"public/libs/underscore.js",
					"public/libs/date-format.js",
					"public/libs/ionic.bundle.min.js",
					"public/libs/angular-resource.min.js",
					"public/libs/ng-cordova.min.js",
					"public/libs/ocLazyLoad.js",
					"public/libs/plugin-framework.min.js"
				],
				dest: "www/scripts/renderer.external.min.js"
			},
			script: {
				src: [
					"public/js/globalContext.js",
					"public/js/appMessages.js",
					"public/js/splashScreen.js",
					"public/js/main.js",
					"public/js/app.js",
					"public/js/basePlugin.js",
					"public/services/mainservice.js",
					"public/services/webservice.js",
					"public/services/interfaceService.js",
					"public/js/ekstepRendererApi.js",
					"public/js/content-renderer.js",
					"public/js/baseLauncher.js",
					"public/js/baseEndpage.js",
					"public/services/controllerservice.js",
					"public/js/detectClient.js",
					"public/js/ekstepRendererEvents.js",
					"public/js/iEvaluator.js",
					"public/dispatcher/idispatcher.js",
					"public/dispatcher/web-dispatcher.js",
					"public/dispatcher/device-dispatcher.js"
				],
				dest: "www/scripts/renderer.script.js"
			},
			ekstep: {
				src: ["public/js/appConfig.js", "www/scripts/renderer.script.js"],
				dest: "www/scripts/renderer.script.min.js"
			},
			sunbird: {
				src: ["public/js/appConfig-Sunbird.js", "www/scripts/renderer.script.js"],
				dest: "www/scripts/renderer.script.min.js"
			},
			telemetry: {
				src: [
					"public/libs/class.js",
					"public/libs/date-format.js",
					"../js-libs/build/telemetry.js",
					"../js-libs/telemetry/InActiveEvent.js",
					"../js-libs/telemetry/TelemetryEvent.js",
					"../js-libs/telemetry/TelemetryService.js",
					"../js-libs/telemetry/TelemetryServiceUtil.js",
					"../js-libs/telemetry/TelemetryV1Manager.js",
					"../js-libs/telemetry/TelemetryV2Manager.js",
					"../js-libs/telemetry/TelemetryV3Manager.js"
				],
				dest: "www/scripts/renderer.telemetry.min.js"
			},
			genieservicebridge: {
				src: [
					"www/preview/scripts/telemetry.min.js",
					"public/services/htmlservice.js",
					"public/js/genieservice-bridge.js"
				],
				dest: "www/scripts/genieservice-bridge.min.js"
			},
			telemetryLib: {
				src: [
					"../js-libs/telemetry-lib/ajv.min.js",
					"../js-libs/telemetry-lib/telemetry-spec.js",
					"../js-libs/telemetry-lib/detectClient.js",
					"../js-libs/telemetry-lib/md5.js",
					"../js-libs/telemetry-lib/fingerprint2.min.js",
					"../js-libs/telemetry-lib/telemetrySyncManager.js",
					"../js-libs/telemetry-lib/telemetryV3Interface.js"
				],
				dest: "../js-libs/build/telemetry.js"
			}
		},
		uglify: {
			speech: {
				options: {
					beautify: true,
					mangle: false
				},
				files: {
					"public/js/app/speech.js": ["../js-libs/speech/speech.js", "../js-libs/speech/android-recorder.js"]
				}
			},
			telemetrymin: {
				options: {
					mangle: false
				},
				files: {
					"../js-libs/build/telemetry.min.js": ["../js-libs/build/telemetry.js"]
				}
			},
			authtokengenerator: {
				options: {
					mangle: false
				},
				files: {
					"../js-libs/build/auth-token-generator.min.js": ["../js-libs/auth-token-generator/auth-token-generator.js"]
				}
			},
			htmlinterfacemin: {
				options: {
					mangle: false
				},
				files: {
					"../js-libs/build/htmlinterface.min.js": ["public/js/htmlinterface.js"]
				}
			},
			renderermin: {
				options: {
					beautify: false,
					mangle: false
				},
				files: {
					"public/coreplugins/org.ekstep.ecmlrenderer-1.0/renderer/libs/renderer.min.js": [
						"public/libs/xml2json.min.js",
						"../js-libs/renderer/manager/PluginManager.js",
						"../js-libs/renderer/manager/ControllerManager.js",
						"../js-libs/renderer/manager/AudioManager.js",
						"../js-libs/renderer/controller/Controller.js",
						"../js-libs/renderer/controller/DataController.js",
						"../js-libs/renderer/controller/ItemController.js",
						"../js-libs/renderer/evaluator/ChoiceEvaluator.js",
						"../js-libs/renderer/evaluator/FTBEvaluator.js",
						"../js-libs/renderer/evaluator/MTFEvaluator.js",
						"../js-libs/renderer/manager/AnimationManager.js",
						"../js-libs/renderer/manager/AssetManager.js",
						"../js-libs/renderer/manager/CommandManager.js",
						"../js-libs/renderer/manager/EventManager.js",
						"../js-libs/renderer/manager/OverlayManager.js",
						"../js-libs/renderer/manager/LoadByStageStrategy.js",
						"../js-libs/renderer/manager/RecorderManager.js",
						"../js-libs/renderer/manager/TimerManager.js",
						"../js-libs/renderer/generator/DataGenerator.js",
						"../js-libs/renderer/generator/ItemDataGenerator.js",
						"../js-libs/renderer/command/Command.js",
						"../js-libs/renderer/command/*.js",
						"../js-libs/renderer/plugin/HTMLPlugin.js",
						"../js-libs/renderer/plugin/AnimationPlugin.js",
						"../js-libs/renderer/plugin/LayoutPlugin.js",
						"../js-libs/renderer/plugin/ShapePlugin.js",
						"../js-libs/renderer/plugin/AudioPlugin.js",
						"../js-libs/renderer/plugin/ContainerPlugin.js",
						"../js-libs/renderer/plugin/RepoPlugin.js",
						"../js-libs/renderer/plugin/DivPlugin.js",
						"../js-libs/renderer/plugin/EmbedPlugin.js",
						"../js-libs/renderer/plugin/HotspotPlugin.js",
						"../js-libs/renderer/plugin/ImagePlugin.js",
						"../js-libs/renderer/plugin/InputPlugin.js",
						"../js-libs/renderer/plugin/MCQPlugin.js",
						"../js-libs/renderer/plugin/MTFPlugin.js",
						"../js-libs/renderer/plugin/OptionPlugin.js",
						"../js-libs/renderer/plugin/OptionsPlugin.js",
						"../js-libs/renderer/plugin/PlaceHolderPlugin.js",
						"../js-libs/renderer/plugin/SetPlugin.js",
						"../js-libs/renderer/plugin/SpritePlugin.js",
						"../js-libs/renderer/plugin/StagePlugin.js",
						"../js-libs/renderer/plugin/SummaryPlugin.js",
						"../js-libs/renderer/plugin/TestcasePlugin.js",
						"../js-libs/renderer/plugin/TextPlugin.js",
						"../js-libs/renderer/plugin/ThemePlugin.js",
						"../js-libs/renderer/plugin/TweenPlugin.js",
						"../js-libs/renderer/plugin/ScribblePlugin.js",
						"../js-libs/renderer/plugin/VideoPlugin.js",
						"../js-libs/renderer/plugin/GridlayoutPlugin.js",
						"../js-libs/renderer/plugin/HighlightTextPlugin.js",
						"../js-libs/speech/android-recorder.js",
						"../js-libs/speech/speech.js"
					]
				}
			}
		},
		copy: {
			main: {
				files: [{
					expand: true,
					cwd: "public/",
					src: ["assets/**", "!js/tests/**", "!js/*", "!json/*", "!libs/*", "!styles/**", "templates/*", "index.html", "index_min.html"],
					dest: "www/"
				}, {
					expand: true,
					cwd: "public/player-build/",
					src: "**",
					dest: "www/",
					flatten: false
				},
				{
					expand: true,
					cwd: "public/coreplugins-dist/",
					src: ["chunks/**", "coreplugins.js"],
					dest: "www/",
					flatten: false
				},
				{
					expand: true,
					cwd: "public/youtube/",
					src: ["youtube.html"],
					dest: "www/",
					flatten: false
				}
				]
			},
			previewFiles: {
				files: [{
					expand: true,
					cwd: "public/",
					src: ["img/**", "fonts/**", "templates/**", "libs/**", "json/**", "css/**", "assets/**", "js/**", "webview.html", "preview.html"],
					dest: "www/preview/"
				}, {
					src: ["public/js/app/AppConfig.js"],
					dest: "www/preview/js/AppConfig.js"
				}]
			},
			unsigned: {
				files: [{
					expand: true,
					cwd: "build-config/",
					src: "build-extras.gradle",
					dest: "platforms/android/"
				}, {
					expand: true,
					cwd: "build-config/",
					src: "gradle.properties",
					dest: "platforms/android/"
				}]
			},
			signed: {
				files: [{
					expand: true,
					cwd: "build-config/signedRelease",
					src: "build-extras.gradle",
					dest: "platforms/android/"
				}, {
					expand: true,
					cwd: "build-config/signedRelease",
					src: "gradle.properties",
					dest: "platforms/android/"
				}, {
					expand: true,
					cwd: "build-config/signedRelease",
					src: "ekstep.keystore",
					dest: "platforms/android/"
				}]
			},
			androidLib: {
				files: [{
					expand: true,
					cwd: "build-config",
					src: "AndroidManifest.xml",
					dest: "platforms/android/"
				}]
			},
			customActivity: {
				files: [{
					expand: true,
					cwd: "build-config",
					src: "MainActivity.java",
					dest: "platforms/android/src/org/ekstep/geniecanvas"
				}]
			},
			testinit: {
				files: [{
					expand: true,
					cwd: "www/scripts",
					src: ["renderer.external.min.js", "renderer.script.min.js", "renderer.telemetry.min.js"],
					dest: "dist"
				}, {
					expand: true,
					cwd: "www/coreplugins/org.ekstep.ecmlrenderer-1.0/renderer/libs",
					src: ["renderer.min.js"],
					dest: "dist"
				}]
			},
			toPreview: {
				files: [{
					expand: true,
					cwd: "www",
					src: ["**", "!preview/**"],
					dest: "www/preview"
				}]
			},
			previewHtml: {
				files: [{
					expand: true,
					cwd: "www/preview",
					src: ["preview.html"],
					dest: "www/preview/",
					rename: function (dest, src, data) {
						return dest + src.replace("preview.html", "preview_cdn.html")
					}
				}]
			},
			authtoken: {
				files: [{
					expand: true,
					cwd: "../js-libs/build",
					src: ["auth-token-generator.min.js"],
					ver: "1.0",
					dest: "../js-libs/build/libs/",
					rename: function (dest, src, data) {
						return dest + src.replace(".min.js", "-" + data.ver + ".min.js")
					}
				}]
			},
			telemetry: {
				files: [{
					expand: true,
					cwd: "../js-libs/build",
					src: ["telemetry.min.js"],
					ver: "1.0",
					dest: "../js-libs/build/libs/",
					rename: function (dest, src, data) {
						return dest + src.replace(".min.js", "-" + data.ver + ".min.js")
					}
				}]
			},
			htmlinterface: {
				files: [{
					expand: true,
					cwd: "../js-libs/build",
					src: ["htmlinterface.min.js"],
					ver: "1.0",
					dest: "../js-libs/build/player/",
					rename: function (dest, src, data) {
						return dest + src.replace(".min.js", "-" + data.ver + ".min.js")
					}
				}]
			},
			renderer: {
				files: [{
					expand: true,
					cwd: "public/coreplugins/org.ekstep.ecmlrenderer-1.0/renderer/libs",
					src: ["renderer.min.js"],
					ver: "1.0",
					dest: "../js-libs/build/player/",
					rename: function (dest, src, data) {
						return dest + src.replace(".min.js", "-" + data.ver + ".min.js")
					}
				}]
			}
		},
		clean: {
			before: ["www", "platforms/android/assets/www", "platforms/android/build"],
			after: ["www/TelemetrySpecRunner.html", "www/WorksheetSpecRunner.html", "www/webview.html", "www/preview.html"],
			samples: ["www/stories", "www/fixture-stories", "www/worksheets"],
			script: ["www/scripts/renderer.script.js"],
			minjs: ["public/js/*.min.js"],
			minhtml: ["www/index_min.html"],
			preview: {
				src: ["www/**/*", "!www/preview/**"]
			},
			deletefiles: ["www/styles/ionic.css", "www/styles/bookshelf_slider.css", "www/styles/skin02.css", "www/styles/toastr.min.css", "www/styles/jquery.mCustomScrollbar.min.css", "www/libs", "www/js", "www/coreplugins/org.ekstep.collection-1.0"]
		},
		rename: {
			main: {
				src: "www/index_min.html",
				dest: "www/index.html"
			},
			preview: {
				src: "www/index.html",
				dest: "www/preview.html"
			}
		},
		aws_s3: {
			options: {
				region: "ap-south-1",
				uploadConcurrency: 5, // 5 simultaneous uploads
				downloadConcurrency: 5, // 5 simultaneous downloads
				progress: "progressBar",
				accessKeyId: "", // Use the variables
				secretAccessKey: "" // You can also use env variables
			},
			uploadPreviewFilesToDev: {
				options: {
					bucket: "ekstep-public-dev",
					uploadConcurrency: 4,
					progress: "progressBar"
				},
				files: [{
					expand: true,
					cwd: "www/preview",
					src: ["**"],
					dest: "/preview/"
				}]
			},
			cleanDevPreview: {
				options: {
					bucket: "ekstep-public-dev"
				},
				files: [{
					dest: "preview/",
					action: "delete"
				}]
			},
			PluginframeworkFromDev: {
				options: {
					bucket: "ekstep-public-dev"
				},
				files: [{
					dest: "content-editor/scripts/plugin-framework.min.js",
					cwd: "public/libs/",
					action: "download"
				}]
			}
		},
		cordovacli: {
			options: {
				path: "www",
				cli: "cordova" // cca or cordova
			},
			add_platforms: {
				options: {
					command: "platform",
					action: "add",
					platforms: ["android@6.1.2"]
				}
			},
			rm_platforms: {
				options: {
					command: "platform",
					action: "rm",
					platforms: ["android"]
				}
			},
			add_plugins: {
				options: {
					command: "plugin",
					action: "add",
					plugins: [
						"cordova-plugin-device@1.1.4",
						"cordova-plugin-file@4.3.1",
						"cordova-plugin-splashscreen@4.0.1",
						"ionic-plugin-keyboard@2.2.0",
						"cordova-plugin-console@1.0.2",
						"https://github.com/akashgupta9990/cordova-webIntent.git",
						"cordova-plugin-whitelist@1.2.1",
						"cordova-plugin-crosswalk-webview@2.3.0",
						"cordova-plugin-file-transfer@1.6.1",
						"cordova-plugin-inappbrowser@1.6.1",
						"cordova-plugin-market@1.1",
						"https://github.com/cranberrygame/cordova-plugin-navigationbar.git",
						"https://github.com/apache/cordova-plugin-statusbar.git",
						"https://github.com/phonegap/phonegap-mobile-accessibility.git"
					]
				}
			},
			add_genie_services: {
				options: {
					command: "plugin",
					action: "add",
					plugins: [
						"../cordova-plugins/cordova-plugin-genieservices/"
					]
				}
			},
			add_crashlytics_plugin: {
				options: {
					command: "plugin",
					action: "add",
					plugins: [
						"https://github.com/etabard/cordova-fabric-crashlytics-plugin"
					],
					args: ["--variable", "CRASHLYTICS_API_SECRET=a98a1c7293881445c6e471588c3adaaef3814c89bdf26b4c1393196162ba9e1c", "--variable", "CRASHLYTICS_API_KEY=4a735dc3520070ad4ea3339e4d8d2bb00efe8eaa"]
				}
			},
			add_xwalk: {
				options: {
					command: "plugin",
					action: "add",
					plugins: [
						"cordova-plugin-crosswalk-webview@2.3.0"
					],
					args: ["--variable", "XWALK_MODE=embedded"]
				}
			},
			add_xwalk_shared: {
				options: {
					command: "plugin",
					action: "add",
					plugins: [
						"cordova-plugin-crosswalk-webview@2.3.0"
					],
					args: ["--variable", "XWALK_MODE=shared"]
				}
			},
			rm_xwalk: {
				options: {
					command: "plugin",
					action: "rm",
					plugins: [
						"cordova-plugin-crosswalk-webview"
					]
				}
			},
			add_sensibol_recorder: {
				options: {
					command: "plugin",
					action: "add",
					plugins: [
						"../cordova-plugins/cordova-plugin-sensibol/"
					]
				}
			},
			rm_sensibol_recorder: {
				options: {
					command: "plugin",
					action: "rm",
					plugins: [
						"cordova-plugin-sensibol"
					]
				}
			},
			add_android_media: {
				options: {
					command: "plugin",
					action: "add",
					plugins: ["cordova-plugin-media@2.3.0"]
				}
			},
			rm_android_media: {
				options: {
					command: "plugin",
					action: "rm",
					plugins: ["cordova-plugin-media"]
				}
			},
			rm_genie_service: {
				options: {
					command: "plugin",
					action: "rm",
					plugins: ["cordova-plugin-genieservices"]
				}
			},
			build_android: {
				options: {
					command: "build",
					force: true,
					platforms: ["android"]
				}
			}
		},
		replace: {
			sensibol: {
				src: ["www/js/appConfig.js", "www/coreplugins/org.ekstep.ecmlrenderer-1.0/renderer/libs/renderer.min.js"],
				overwrite: true,
				replacements: [{
					from: /AUDIO_RECORDER/g,
					to: "sensibol"
				}]
			},
			android: {
				src: ["www/js/appConfig.js", "www/coreplugins/org.ekstep.ecmlrenderer-1.0/renderer/libs/renderer.min.js"],
				overwrite: true,
				replacements: [{
					from: /AUDIO_RECORDER/g,
					to: "android"
				}]
			},
			build_version: {
				src: ["www/preview/scripts/renderer.script.min.js", "www/preview.html", "www/preview/preview.html"],
				overwrite: true,
				replacements: [{
					from: /BUILD_NUMBER/g,
					to: "<%= buildNumber %>"
				}]
			},
			androidLib: {
				src: ["platforms/android/build.gradle"],
				overwrite: true,
				replacements: [{
					from: "apply plugin: 'com.android.application'",
					to: "apply plugin: 'com.android.library'"
				}, {
					from: "applicationId privateHelpers.extractStringFromManifest(\"package\")",
					to: " "
				}]
			},
			xwalk_library: {
				src: ["platforms/android/cordova-plugin-crosswalk-webview/geniecanvas-xwalk.gradle"],
				overwrite: true,
				replacements: [{
					from: "applicationVariants",
					to: "libraryVariants"
				}]
			},
			build_Number: {
				src: ["www/index.html"],
				overwrite: true,
				replacements: [{
					from: ".js",
					to: ".js?ver=BUILD_NUMBER"
				}, {
					from: ".css",
					to: ".css?ver=BUILD_NUMBER"
				}]
			},
			gradleCanvasVersion: {
				src: ["platforms/android/build-extras.gradle", "www/scripts/renderer.script.min.js"],
				overwrite: true,
				replacements: [{
					from: "genie-canvas-version",
					to: "<%= version %>"
				}]
			},
			previewAppConfigCanvasVersion: {
				src: ["www/preview/scripts/renderer.script.min.js"],
				overwrite: true,
				replacements: [{
					from: "genie-canvas-version",
					to: "<%= version %>"
				}]
			}
		},
		jsdoc: {
			dist: {
				src: ["../js-libs/renderer/**/*.js", "public/js/*.js", "public/coreplugins/**/renderer/js/*.js", "public/coreplugins/**/renderer/*.js", "../README.md"],
				options: {
					destination: "docs"
				}
			}
		},
		// this is only used for deployment
		compress: {
			main: {
				options: {
					archive: "renderer-docs.zip"
				},
				files: [{
					src: ["docs/**"]
				}]
			},
			preview: {
				options: {
					archive: "preview.zip"
				},
				files: [{
					expand: true,
					cwd: "www/preview",
					src: ["**"]
				}]
			},
			libs: {
				options: {
					archive: "libs.zip"
				},
				files: [{
					expand: true,
					cwd: "../js-libs/build",
					src: ["**"]
				}]
			}
		},
		injector: {
			prview: {
				options: {
					ignorePath: "www/",
					addRootSlash: false
				},
				files: {
					"www/index.html": [
						"www/script.*.js",
						"www/*.css"
					]
				}
			},
			previewCdn: {
				options: {
					ignorePath: "www/preview",
					addRootSlash: false,
					prefix: "cdn_url/"
				},
				files: {
					"www/preview/preview_cdn.html": [
						"www/preview/script.*.js",
						"www/preview/*.css"
					]
				}
			}
		}
	})

	grunt.loadNpmTasks("grunt-cordovacli")
	grunt.loadNpmTasks("grunt-contrib-uglify")
	grunt.loadNpmTasks("grunt-contrib-watch")
	grunt.loadNpmTasks("grunt-contrib-copy")
	grunt.loadNpmTasks("grunt-contrib-compress")
	grunt.loadNpmTasks("grunt-aws-s3")
	grunt.loadNpmTasks("grunt-contrib-clean")
	grunt.loadNpmTasks("grunt-rename")
	grunt.loadNpmTasks("grunt-mkdir")
	grunt.loadNpmTasks("grunt-text-replace")
	grunt.loadNpmTasks("grunt-karma")
	grunt.loadNpmTasks("grunt-jsdoc")
	grunt.loadNpmTasks("grunt-contrib-concat")
	grunt.loadNpmTasks("grunt-injector")

	var recorder = grunt.option("recorder") || "android"
	recorder = recorder.toLowerCase().trim()
	if (["android", "sensibol"].indexOf(recorder) === -1) { grunt.fail.fatal("recorder argument value should be any one of: ['android', 'sensibol'].") }

	grunt.registerTask("set-platforms", function () {
		/* if (grunt.file.exists('platforms/android')) {
            grunt.task.run(['cordovacli:rm_platforms', 'cordovacli:add_platforms']);
        } else {
        } */
		grunt.task.run(["cordovacli:rm_platforms", "cordovacli:add_platforms"])
	})

	grunt.registerTask("deploy-preview", function (flavor) {
		if (!flavor) {
			grunt.fail.fatal("deployment argument value should be any one of: ['dev', 'production', 'qa'].")
			return
		}
		grunt.log.writeln("Starting", flavor, "deployment")
		flavor = flavor.toLowerCase().trim()
		var tasks = []
		if (flavor === "dev") {
			tasks.push("deploy-preview-dev")
		}

		if (tasks.length > 0) {
			grunt.task.run(tasks)
		}
	})

	// grunt to download the pluginFramework files
	grunt.registerTask("download-plugin-framework-dev", ["aws_s3:PluginframeworkFromDev"])

	// This is to update the Jenkins version number
	grunt.registerTask("updateVersion", function (jenBuildNumber) {
		// This method need to call after preview build is generated(grunt build-preview);
		if (jenBuildNumber) {
			grunt.config.set("buildNumber", jenBuildNumber)
		}

		var tasks = ["replace:build_version"]
		grunt.task.run(tasks)
	})

	grunt.registerTask("deploy-preview-dev", ["aws_s3:cleanDevPreview", "aws_s3:uploadPreviewFilesToDev"])

	grunt.registerTask("rm-cordova-plugin-sensibol", function () {
		if (grunt.file.exists("plugins/cordova-plugin-sensibol")) grunt.task.run(["cordovacli:rm_sensibol_recorder"])
	})
	grunt.registerTask("add-cordova-plugin-sensibol", function () {
		grunt.task.run(["rm-cordova-plugin-sensibol", "cordovacli:add_sensibol_recorder"])
	})
	grunt.registerTask("rm-cordova-plugin-media", function () {
		if (grunt.file.exists("plugins/cordova-plugin-media")) grunt.task.run(["cordovacli:rm_android_media"])
	})
	grunt.registerTask("add-cordova-plugin-media", function () {
		grunt.task.run(["rm-cordova-plugin-media", "cordovacli:add_android_media"])
	})
	grunt.registerTask("add-speech", function () {
		var tasks = ["add-cordova-plugin-media"]
		if (recorder === "sensibol") { tasks.push("add-cordova-plugin-sensibol") }
		tasks.push("uglify:speech")
		tasks.push("replace:" + recorder)
		grunt.task.run(tasks)
	})
	grunt.registerTask("rm-cordova-plugin-genieservices", function () {
		if (grunt.file.exists("plugins/cordova-plugin-genieservices")) grunt.task.run(["cordovacli:rm_genie_service"])
	})
	grunt.registerTask("add-cordova-plugin-genieservices", function () {
		grunt.task.run(["rm-cordova-plugin-genieservices", "cordovacli:add_genie_services"])
	})
	grunt.registerTask("rm_custom_plugins", function () {
		if (grunt.file.exists("plugins/org.ekstep.genie.service.plugin")) grunt.task.run(["cordovacli:rm_genie_service"])
		if (grunt.file.exists("plugins/org.ekstep.recorder.service.plugin")) grunt.task.run(["cordovacli:rm_sensibol_recorder"])
	})
	grunt.registerTask("set-android-library", ["copy:androidLib", "replace:androidLib"])
	grunt.registerTask("set-xwalkshared-library", ["copy:customActivity", "cordovacli:rm_xwalk", "cordovacli:add_xwalk_shared", "replace:xwalk_library"])

	// Build web prview
	grunt.registerTask("init", ["uglify:renderermin", "copy:main", "injector:prview"])
	grunt.registerTask("build-preview", ["clean", "mkdir:all", "init", "rename:preview", "clean:minhtml", "copy:toPreview", "clean:preview", "copy:previewHtml", "injector:previewCdn"])

	grunt.registerTask("backup-config-xml", function () {
		grunt.file.copy("./config.xml", "./config.latest.xml")
		grunt.file.copy("./config.dist.xml", "./config.xml")
	})

	grunt.registerTask("revert-config-xml", function () {
		grunt.file.copy("./config.latest.xml", "./config.xml")
		fs.unlink("./config.latest.xml")
		fs.unlink("./config.dist.xml")
	})

	// Build AAR
	grunt.registerTask("init-setup", ["set-platforms", "add-cordova-plugin-genieservices"])
	grunt.registerTask("build-aarshared-xwalk", ["init", "rename:main", "injector:prview", "cordovacli:add_plugins", "copy:unsigned", "replace:gradleCanvasVersion", "add-speech", "set-android-library", "set-xwalkshared-library", "cordovacli:build_android"])
	grunt.registerTask("build-app", ["clean", "mkdir:all", "backup-config-xml", "init-setup", "build-aarshared-xwalk", "revert-config-xml"])

	// Added on 16/04/18. Simple command to build aar file. There is no xwalk build required. This changes made to share build for Sunbird.
	grunt.registerTask("build-aar", ["mkdir:all", "build-aarshared-xwalk"])

	grunt.registerTask("build-jsdoc", ["jsdoc", "compress:main"])

	grunt.registerTask("test-setup", ["new-buildPreview", "copy:testinit", "clean"])
	grunt.registerTask("player-test", ["karma:app"])
	grunt.registerTask("renderer-test", ["karma:renderer"])
	grunt.registerTask("build-telemetry-lib", ["concat:telemetryLib", "uglify:telemetrymin", "uglify:authtokengenerator", "uglify:htmlinterfacemin"])
	grunt.registerTask("renderer-telemetryV3", ["karma:telemetryV3"])
	grunt.registerTask("telemetry-lib-test", ["karma:telemetryFunV3"])
	grunt.registerTask("telemetry-test-v3", ["karma:telemetryV3Manager"])

	grunt.registerTask("generate-libs", ["copy:authtoken", "copy:telemetry", "copy:htmlinterface", "copy:renderer"])
}
