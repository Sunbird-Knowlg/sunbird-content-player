module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        mkdir: {
            all: {
              options: {
                    create: ['www']
                },
            },
        },
        uglify: {
            js: {
                files: {
                    'public/js/app/quizapp-0.3.min.js': [
                        'public/js/app/GlobalContext.js',
                        'public/js/app/AppConfig.js',
                        'public/js/app/ApMessages.js',
                        'public/js/thirdparty/exclude/xml2json.js',
                        'public/js/thirdparty/exclude/createjs-2015.05.21.min.js',
                        'public/js/thirdparty/exclude/cordovaaudioplugin-0.6.1.min.js',
                        'public/js/thirdparty/exclude/creatine-1.0.0.min.js',
                        'public/js/thirdparty/exclude/Class.js',
                        'public/js/app/controller/Controller.js',
                        'public/js/app/plugin/Plugin.js',
                        'public/js/app/manager/*.js',
                        'public/js/app/controller/*Controller.js',
                        'public/js/app/generator/*.js',
                        'public/js/app/evaluator/*.js',
                        'public/js/app/plugin/*Plugin.js',
                        'public/js/app/renderer/*.js',
                        'public/js/app/cordova-plugin/DownloaderService.js',
                        'public/js/app/cordova-plugin/AndroidRecorderService.js',
                        'public/js/app/service/*.js'
                    ],
                    'public/js/app/telemetry-lib-0.3.min.js': [
                        'public/js/thirdparty/exclude/date-format.js',
                        'public/js/app/telemetry/FilewriterService.js',
                        'public/js/app/telemetry/TelemetryEvent.js',
                        'public/js/app/telemetry/*.js'
                    ]
                }
            }
        },
        copy: {
            main: {
                files: [
                    {
                        expand: true,
                        cwd: 'public/',
                        src: ['**', '!**/controller/**', '!**/evaluator/**', '!**/manager/**', '!**/plugin/**', '!**/renderer/**', '!**/generator/**', '!**/telemetry/**', '!**/test/**', '!**/tests/**', '!**/libs/**', '!**/jasmine-2.3.4/**', '!**/exclude/**'],
                        dest: 'www/'
                    }
                ]
            },
            unsigned: {
                files: [
                    {
                        expand: true,
                        cwd: 'build-config/',
                        src: 'build-extras.gradle',
                        dest: 'platforms/android/'
                    },
                    {
                        expand: true,
                        cwd: 'build-config/',
                        src: 'gradle.properties',
                        dest: 'platforms/android/'
                    }
                ]
            },
            signed: {
                files: [
                    {
                        expand: true,
                        cwd: 'build-config/signedRelease',
                        src: 'build-extras.gradle',
                        dest: 'platforms/android/'
                    },
                    {
                        expand: true,
                        cwd: 'build-config/signedRelease',
                        src: 'gradle.properties',
                        dest: 'platforms/android/'
                    },
                    {
                        expand: true,
                        cwd: 'build-config/signedRelease',
                        src: 'ekstep.keystore',
                        dest: 'platforms/android/'
                    }
                ]
            }
        },
        clean: {
            before: ["www", "platforms/android/assets/www", "platforms/android/build"],
            after: ["www/TelemetrySpecRunner.html", "www/WorksheetSpecRunner.html"],
            samples: ["www/stories", "www/worksheets"],
            minjs: ['public/js/app/*.min.js']
        },
        rename: {
            main: {
                src: 'www/index_min.html',
                dest: 'www/index.html'
            }
        },
        compress: {
            story: {
                options: {
                    archive: 'samples/haircut_story_0.2.zip'
                },
                filter: 'isFile',
                expand: true,
                cwd: 'public/stories/haircut_story/',
                src: ['**/*'],
                dest: '/'
            },
            worksheet: {
                options: {
                    archive: 'samples/addition_by_grouping_0.2.zip'
                },
                filter: 'isFile',
                expand: true,
                cwd: 'public/worksheets/addition_by_grouping/',
                src: ['**/*'],
                dest: '/'
            }
        },
        aws_s3: {
            options: {
                accessKeyId: process.env.AWSAccessKeyId, // Use the variables
                secretAccessKey: process.env.AWSSecretKey, // You can also use env variables
                region: 'ap-southeast-1',
                uploadConcurrency: 5, // 5 simultaneous uploads
                downloadConcurrency: 5 // 5 simultaneous downloads
            },
            uploadJS: {
                options: {
                    bucket: 'ekstep-public',
                    mime: {
                        'public/js/app/quizapp-0.3.min.js': 'application/javascript',
                        'public/js/app/telemetry-lib-0.3.min.js': 'application/javascript'
                    }
                },
                files: [{
                    expand: true,
                    cwd: 'public/js/app/',
                    src: ['*-0.3.min.js'],
                    dest: 'js/'
                }]
            },
            cleanJS: {
                options: {
                    bucket: 'ekstep-public'
                },
                files: [{
                    dest: 'js/quizapp-0.3.min.js',
                    exclude: "**/.*",
                    action: 'delete'
                },
                {
                    dest: 'js/telemetry-lib-0.3.min.js',
                    exclude: "**/.*",
                    action: 'delete'
                }]
            },
            uploadSamples: {
                options: {
                    bucket: 'ekstep-public',
                    mime: {
                        'samples/haircut_story_0.2.zip': 'application/zip',
                        'samples/addition_by_grouping_0.2.zip': 'application/zip'
                    }
                },
                files: [{
                    expand: true,
                    cwd: 'samples/',
                    src: ['**'],
                    dest: 'samples/'
                }]
            }
        },
        cordovacli: {
            options: {
                path: 'www',
                cli: 'cordova'  // cca or cordova
            },
            add_platforms: {
                options: {
                    command: 'platform',
                    action: 'add',
                    platforms: ['android']
                }
            },
            rm_platforms: {
                options: {
                    command: 'platform',
                    action: 'rm',
                    platforms: ['android']
                }
            },
            add_plugins: {
                options: {
                    command: 'plugin',
                    action: 'add',
                    plugins: [
                        'device',
                        'file',
                        'media',
                        'splashscreen',
                        'com.ionic.keyboard',
                        'console',
                        'cordova-plugin-whitelist',
                        'cordova-plugin-crosswalk-webview',
                        'cordova-plugin-file-transfer',
                        'https://github.com/Initsogar/cordova-webintent.git',
                        'com.lampa.startapp',
                        'cordova-plugin-inappbrowser',
                        'https://github.com/xmartlabs/cordova-plugin-market',
                        'cordova-plugin-media'
                    ]
                }
            },
            add_custom_plugins: {
                options: {
                    command: 'plugin',
                    action: 'add',
                    plugins: [
                        './custom-plugins/PlatformService/',
                        './custom-plugins/DownloaderService/',
                        './custom-plugins/GenieService/'
                    ]
                }
            },
            add_xwalk: {
                options: {
                    command: 'plugin',
                    action: 'add',
                    plugins: [
                        'cordova-plugin-crosswalk-webview'
                    ]
                }
            },
            rm_xwalk: {
                options: {
                    command: 'plugin',
                    action: 'rm',
                    plugins: [
                        'cordova-plugin-crosswalk-webview'
                    ]
                }
            },
            add_sensibol_recorder: {
                options: {
                    command: 'plugin',
                    action: 'add',
                    plugins: [
                        './custom-plugins/RecorderService/'
                    ]
                }
            },
            rm_sensibol_recorder: {
                options: {
                    command: 'plugin',
                    action: 'rm',
                    plugins: [
                        'org.ekstep.recorder.service.plugin'
                    ]
                }
            },
            rm_platform_service: {
                options: {
                    command: 'plugin',
                    action: 'rm',
                    plugins: ['org.ekstep.platform.service.plugin']
                }
            },
            rm_downloader_service: {
                options: {
                    command: 'plugin',
                    action: 'rm',
                    plugins: ['org.ekstep.downloader.service.plugin']
                }  
            },
            rm_genie_service: {
                options: {
                    command: 'plugin',
                    action: 'rm',
                    plugins: ['org.ekstep.genie.service.plugin']
                }  
            },
            build_android: {
                options: {
                    command: 'build',
                    platforms: ['android']
                }
            },
            build_android_release: {
                options: {
                    command: 'build',
                    platforms: ['android'],
                    args: ['--release']
                }
            },
            run_android: {
                options: {
                    command: 'run',
                    platforms: ['android']
                }
            }
        },
        replace: {
            sensibol: {
                src: ['www/js/app/AppConfig.js', 'www/js/app/quizapp-0.3.min.js'],
                overwrite: true,
                replacements: [{
                    from: /AUDIO_RECORDER/g,
                    to: "sensibol"
                }]
            },
            android: {
                src: ['www/js/app/AppConfig.js', 'www/js/app/quizapp-0.3.min.js'],
                overwrite: true,
                replacements: [{
                    from: /AUDIO_RECORDER/g,
                    to: "android"
                }]
            }
        }
    });

    grunt.loadNpmTasks('grunt-cordovacli');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-aws-s3');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-rename');
    grunt.loadNpmTasks('grunt-mkdir');
    grunt.loadNpmTasks('grunt-text-replace');

    var recorder = grunt.option('recorder') || "android";
    recorder = recorder.toLowerCase().trim();
    if (['android', 'sensibol'].indexOf(recorder) == -1)
        grunt.fail.fatal("recorder argument value should be any one of: ['android', 'sensibol'].");

    grunt.registerTask('set-platforms', function() {
        if (grunt.file.exists('platforms/android')) {
            grunt.task.run(['cordovacli:rm_platforms', 'cordovacli:add_platforms']);
        } else {
            grunt.task.run(['cordovacli:add_platforms']);
        }
    });

    grunt.registerTask('add-recorder', function() {
        if (recorder == "sensibol") grunt.task.run(['cordovacli:add_sensibol_recorder']);
        grunt.task.run(['replace:'+recorder]);
    });

    grunt.registerTask('rm_custom_plugins', function() {
        if (grunt.file.exists('plugins/org.ekstep.platform.service.plugin')) grunt.task.run(['cordovacli:rm_platform_service']);
        if (grunt.file.exists('plugins/org.ekstep.downloader.service.plugin')) grunt.task.run(['cordovacli:rm_downloader_service']);
        if (grunt.file.exists('plugins/org.ekstep.genie.service.plugin')) grunt.task.run(['cordovacli:rm_genie_service']);
        if (grunt.file.exists('plugins/org.ekstep.recorder.service.plugin')) grunt.task.run(['cordovacli:rm_sensibol_recorder']);
    });

    grunt.registerTask('default', ['uglify:js']);
    grunt.registerTask('build-all', ['uglify:js', 'compress:story', 'compress:worksheet', 'aws_s3:uploadJS', 'aws_s3:uploadSamples']);
    grunt.registerTask('build-js', ['uglify:js', 'aws_s3:cleanJS', 'aws_s3:uploadJS', 'clean:minjs']);
    grunt.registerTask('build-samples', ['compress:story', 'compress:worksheet', 'aws_s3:uploadSamples']);
    grunt.registerTask('add_custom_plugins', ['cordovacli:add_custom_plugins']);
    grunt.registerTask('update_custom_plugins', ['rm_custom_plugins', 'cordovacli:add_custom_plugins']);
    grunt.registerTask('build-unsigned-apk-xwalk', ['uglify:js', 'clean:before', 'copy:main', 'copy:unsigned', 'rename', 'clean:after', 'clean:samples', 'cordovacli:add_plugins', 'update_custom_plugins', 'add-recorder', 'cordovacli:build_android_release', 'clean:minjs']);
    grunt.registerTask('build-apk', ['uglify:js', 'clean:before', 'copy:main', 'copy:unsigned', 'rename', 'clean:after', 'clean:samples', 'cordovacli:add_plugins', 'cordovacli:rm_xwalk', 'update_custom_plugins', 'add-recorder', 'cordovacli:build_android', 'clean:minjs']);
    grunt.registerTask('build-unsigned-apk', ['uglify:js', 'clean:before', 'copy:main', 'copy:unsigned', 'rename', 'clean:after', 'clean:samples', 'cordovacli:add_plugins', 'cordovacli:rm_xwalk', 'update_custom_plugins', 'add-recorder', 'cordovacli:build_android_release', 'clean:minjs']);
    grunt.registerTask('build-signed-apk', ['uglify:js', 'clean:before', 'copy:main', 'copy:signed', 'rename', 'clean:after', 'clean:samples', 'cordovacli:add_plugins', 'cordovacli:rm_xwalk', 'update_custom_plugins', 'add-recorder', 'cordovacli:build_android_release', 'clean:minjs']);
    grunt.registerTask('build-apk-quick', ['uglify:js', 'clean:before', 'copy:main', 'copy:unsigned', 'rename', 'clean:after', 'clean:samples', 'update_custom_plugins', 'add-recorder', 'cordovacli:build_android', 'clean:minjs']);
    grunt.registerTask('install-apk-xwalk', ['uglify:js', 'clean:before', 'copy:main', 'copy:unsigned', 'rename', 'clean:after', 'clean:samples', 'cordovacli:add_plugins', 'update_custom_plugins', 'add-recorder', 'cordovacli:run_android', 'clean:minjs']);
    grunt.registerTask('install-apk', ['uglify:js', 'clean:before', 'copy:main', 'copy:unsigned', 'rename', 'clean:after', 'clean:samples', 'cordovacli:add_plugins', 'cordovacli:rm_xwalk', 'update_custom_plugins', 'add-recorder', 'cordovacli:run_android', 'clean:minjs']);
    grunt.registerTask('install-apk-quick', ['uglify:js', 'clean:before', 'copy:main', 'copy:unsigned', 'rename', 'clean:after', 'clean:samples', 'update_custom_plugins', 'add-recorder', 'cordovacli:run_android', 'clean:minjs']);
    

    grunt.registerTask('build-apk-xwalk', ['uglify:js', 'clean:before', 'copy:main', 'copy:unsigned', 'rename', 'clean:after', 'clean:samples', 'cordovacli:add_plugins', 'update_custom_plugins', 'add-recorder', 'cordovacli:build_android', 'clean:minjs']);
    grunt.registerTask('build-signed-apk-xwalk', ['uglify:js', 'clean:before', 'copy:main', 'copy:signed', 'rename', 'clean:after', 'clean:samples', 'cordovacli:add_plugins', 'update_custom_plugins', 'add-recorder', 'cordovacli:build_android_release', 'clean:minjs']);

    grunt.registerTask('init-setup', ['mkdir:all', 'copy:main', 'set-platforms', 'cordovacli:add_custom_plugins']);

    grunt.registerTask('ci-build-debug', ['build-apk-xwalk']);
    grunt.registerTask('ci-build-signed', ['build-signed-apk-xwalk']);

};
