// Karma configuration

module.exports = function (config) {
    config.set({
        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['browserify', 'mocha'],


        // list of files / patterns to load in the browser
        files: [
            'test/**/*.js'
        ],

        preprocessors: {
            'test/**/*.js': [ 'browserify' ]
        },


        // list of files to exclude
        exclude: [],

        plugins: [
            'karma-mocha',
            'karma-chrome-launcher',
            'karma-phantomjs-launcher',
            'karma-browserify',
            'karma-spec-reporter'
        ],

        browserify: {
            debug: true
        },


        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['spec'],


        // web server port
        port: 9876,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,


        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['PhantomJS'],


        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true
    });
};