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
                        'public/js/app/AppMessages.js',
                        'public/js/app/speech.js',
                        'public/js/app/renderer.js'
                    ],
                    'public/js/app/telemetry-lib-0.3.min.js': [
                        'public/js/thirdparty/exclude/date-format.js',
                        'public/js/app/telemetry/FilewriterService.js',
                        'public/js/app/telemetry/TelemetryEvent.js',
                        'public/js/app/telemetry/*.js'
                    ]
                }
            },
            speech: {
                options: {
                    beautify: true
                },
                files:{
                    'public/js/app/speech.js': ['../speech/speech.js', '../speech/android-recorder.js']
                }
            },
            renderer: {
                options: {
                    beautify: true
                },
                files: {
                    'public/js/app/renderer.js': [
                        'public/js/thirdparty/exclude/xml2json.js',
                        'public/js/thirdparty/exclude/createjs-2015.11.26.min.js',
                        'public/js/thirdparty/exclude/cordovaaudioplugin-0.6.1.min.js',
                        'public/js/thirdparty/exclude/creatine-1.0.0.min.js',
                        'public/js/thirdparty/exclude/Class.js',
                        '../renderer/controller/Controller.js',
                        '../renderer/plugin/Plugin.js',
                        '../renderer/manager/*.js',
                        '../renderer/controller/*Controller.js',
                        '../renderer/generator/*.js',
                        '../renderer/evaluator/*.js',
                        '../renderer/plugin/ShapePlugin.js',
                        '../renderer/plugin/*Plugin.js',
                        '../renderer/renderer/*.js'
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
                        'cordova-plugin-device@1.1.1',
                        'cordova-plugin-file@4.1.0',
                        'cordova-plugin-splashscreen@3.1.0',
                        'com.ionic.keyboard@1.0.4',
                        'cordova-plugin-console@1.0.2',
                        'cordova-plugin-whitelist@1.2.1',
                        'cordova-plugin-crosswalk-webview@1.5.0',
                        'cordova-plugin-file-transfer@1.5.0',
                        'https://github.com/Initsogar/cordova-webintent.git', // no registry in npm and cordova plugins
                        'com.lampa.startapp@0.0.5',
                        'cordova-plugin-inappbrowser@1.2.0',
                        'cordova-plugin-market@1.1'
                    ]
                }
            },
            add_genie_services: {
                options: {
                    command: 'plugin',
                    action: 'add',
                    plugins: [
                        '../cordova-plugins/cordova-plugin-genieservices/'
                    ]
                }
            },
            add_crashlytics_plugin: {
                options: {
                    command: 'plugin',
                    action: 'add',
                    plugins: [
                        'https://github.com/etabard/cordova-fabric-crashlytics-plugin'
                    ],
                    args:['--variable','CRASHLYTICS_API_SECRET=a98a1c7293881445c6e471588c3adaaef3814c89bdf26b4c1393196162ba9e1c','--variable','CRASHLYTICS_API_KEY=4a735dc3520070ad4ea3339e4d8d2bb00efe8eaa']
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
                        '../cordova-plugins/cordova-plugin-sensibol/'
                    ]
                }
            },
            rm_sensibol_recorder: {
                options: {
                    command: 'plugin',
                    action: 'rm',
                    plugins: [
                        'cordova-plugin-sensibol'
                    ]
                }
            },
            add_android_media: {
                options: {
                    command: 'plugin',
                    action: 'add',
                    plugins: ['cordova-plugin-media@1.0.1']
                }
            },
            rm_android_media: {
                options: {
                    command: 'plugin',
                    action: 'rm',
                    plugins: ['cordova-plugin-media']
                }
            },
            rm_genie_service: {
                options: {
                    command: 'plugin',
                    action: 'rm',
                    plugins: ['cordova-plugin-genieservices']
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

    grunt.registerTask('rm-cordova-plugin-sensibol', function() {
        if (grunt.file.exists('plugins/cordova-plugin-sensibol')) grunt.task.run(['cordovacli:rm_sensibol_recorder']);
    });
    grunt.registerTask('add-cordova-plugin-sensibol', function() {
        grunt.task.run(['rm-cordova-plugin-sensibol', 'cordovacli:add_sensibol_recorder']);
    });
    grunt.registerTask('rm-cordova-plugin-media', function() {
        if (grunt.file.exists('plugins/cordova-plugin-media')) grunt.task.run(['cordovacli:rm_android_media']);
    });
    grunt.registerTask('add-cordova-plugin-media', function() {
        grunt.task.run(['rm-cordova-plugin-media', 'cordovacli:add_android_media']);
    });
    grunt.registerTask('add-speech', function() {
        var tasks = ['add-cordova-plugin-media'];
        if (recorder == "sensibol")
            tasks.push('add-cordova-plugin-sensibol');
        tasks.push('uglify:speech');
        tasks.push('replace:'+recorder);
        grunt.task.run(tasks);
    });

    grunt.registerTask('rm-cordova-plugin-genieservices', function() {
        if (grunt.file.exists('plugins/cordova-plugin-genieservices')) grunt.task.run(['cordovacli:rm_genie_service']);
    });
    grunt.registerTask('add-cordova-plugin-genieservices', function() {
        grunt.task.run(['rm-cordova-plugin-genieservices', 'cordovacli:add_genie_services']);
    });    

    grunt.registerTask('rm_custom_plugins', function() {
        if (grunt.file.exists('plugins/org.ekstep.genie.service.plugin')) grunt.task.run(['cordovacli:rm_genie_service']);
        if (grunt.file.exists('plugins/org.ekstep.recorder.service.plugin')) grunt.task.run(['cordovacli:rm_sensibol_recorder']);
    });

    grunt.registerTask('default', ['uglify:renderer', 'uglify:speech', 'uglify:js']);
    grunt.registerTask('build-all', ['uglify:renderer', 'uglify:speech', 'uglify:js', 'aws_s3:uploadJS']);
    grunt.registerTask('build-js', ['uglify:renderer', 'uglify:speech', 'uglify:js', 'aws_s3:cleanJS', 'aws_s3:uploadJS', 'clean:minjs']);
    grunt.registerTask('update_custom_plugins', ['rm_custom_plugins', 'add-cordova-plugin-genieservices']);
    grunt.registerTask('build-unsigned-apk-xwalk', ['uglify:renderer', 'uglify:speech', 'uglify:js', 'clean:before', 'copy:main', 'copy:unsigned', 'rename', 'clean:after', 'clean:samples', 'cordovacli:add_plugins', 'update_custom_plugins', 'cordovacli:add_crashlytics_plugin', 'add-speech', 'cordovacli:build_android_release', 'clean:minjs']);
    grunt.registerTask('build-apk', ['uglify:renderer', 'uglify:speech', 'uglify:js', 'clean:before', 'copy:main', 'copy:unsigned', 'rename', 'clean:after', 'clean:samples', 'cordovacli:add_plugins', 'cordovacli:rm_xwalk', 'update_custom_plugins', 'add-speech', 'cordovacli:build_android', 'clean:minjs']);
    grunt.registerTask('build-unsigned-apk', ['uglify:renderer', 'uglify:speech', 'uglify:js', 'clean:before', 'copy:main', 'copy:unsigned', 'rename', 'clean:after', 'clean:samples', 'cordovacli:add_plugins', 'cordovacli:rm_xwalk', 'update_custom_plugins', 'add-speech', 'cordovacli:build_android_release', 'clean:minjs']);
    grunt.registerTask('build-signed-apk', ['uglify:renderer', 'uglify:speech', 'uglify:js', 'clean:before', 'copy:main', 'copy:signed', 'rename', 'clean:after', 'clean:samples', 'cordovacli:add_plugins', 'cordovacli:rm_xwalk', 'update_custom_plugins', 'add-speech', 'cordovacli:build_android_release', 'clean:minjs']);
    grunt.registerTask('build-apk-quick', ['uglify:renderer', 'uglify:speech', 'uglify:js', 'clean:before', 'copy:main', 'copy:unsigned', 'rename', 'clean:after', 'clean:samples', 'update_custom_plugins', 'add-speech', 'cordovacli:build_android', 'clean:minjs']);
    grunt.registerTask('install-apk-xwalk', ['uglify:renderer', 'uglify:speech', 'uglify:js', 'clean:before', 'copy:main', 'copy:unsigned', 'rename', 'clean:after', 'clean:samples', 'cordovacli:add_plugins', 'update_custom_plugins', 'add-speech', 'cordovacli:run_android', 'clean:minjs']);
    grunt.registerTask('install-apk', ['uglify:renderer', 'uglify:speech', 'uglify:js', 'clean:before', 'copy:main', 'copy:unsigned', 'rename', 'clean:after', 'clean:samples', 'cordovacli:add_plugins', 'cordovacli:rm_xwalk', 'update_custom_plugins', 'add-speech', 'cordovacli:run_android', 'clean:minjs']);
    grunt.registerTask('install-apk-quick', ['uglify:renderer', 'uglify:speech', 'uglify:js', 'clean:before', 'copy:main', 'copy:unsigned', 'rename', 'clean:after', 'clean:samples', 'update_custom_plugins', 'add-speech', 'cordovacli:run_android', 'clean:minjs']);


    grunt.registerTask('build-apk-xwalk', ['uglify:renderer', 'uglify:speech', 'uglify:js', 'clean:before', 'copy:main', 'copy:unsigned', 'rename', 'clean:after', 'clean:samples', 'cordovacli:add_plugins', 'update_custom_plugins', 'cordovacli:add_crashlytics_plugin', 'add-speech', 'cordovacli:build_android', 'clean:minjs']);
    grunt.registerTask('build-signed-apk-xwalk', ['uglify:renderer', 'uglify:speech', 'uglify:js', 'clean:before', 'copy:main', 'copy:signed', 'rename', 'clean:after', 'clean:samples', 'cordovacli:add_plugins', 'update_custom_plugins', 'cordovacli:add_crashlytics_plugin', 'add-speech', 'cordovacli:build_android_release', 'clean:minjs']);

    grunt.registerTask('init-setup', ['mkdir:all', 'copy:main', 'set-platforms', 'add-cordova-plugin-genieservices']);

    grunt.registerTask('ci-build-debug', ['build-apk-xwalk']);
    grunt.registerTask('ci-build-signed', ['build-signed-apk-xwalk']);

};
