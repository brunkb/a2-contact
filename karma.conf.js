// Karma configuration
// Generated on Wed Jul 15 2015 09:44:02 GMT+0200 (Romance Daylight Time)

module.exports = function (config) {
  config.set({

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      '**/*.js': ['sourcemap'],
      'tmp/test/**/!(spec|mock).js': ['coverage'],
    },

    // list of files / patterns to load in the browser
    files: [

      'node_modules/es6-shim/es6-shim.js',
      'node_modules/systemjs/dist/system-polyfills.js', // PhantomJS2 (and possibly others) might require it

      'node_modules/angular2/bundles/angular2-polyfills.js',
      'node_modules/angular2/es6/dev/src/testing/shims_for_IE.js',
      'node_modules/reflect-metadata/Reflect.js',

      'node_modules/systemjs/dist/system.src.js',
      { pattern: 'node_modules/rxjs/**/*.js', included: false, watched: false, served: true },
      { pattern: 'node_modules/angular2/**/*.js', included: false, watched: false, served: true },

      { pattern: 'client/**/*.html', included: false, watched: true, served: true },
      { pattern: 'tmp/test/**', included: false, watched: true, served: true },

      'test-main.js'
    ],

    proxies: {
      '/base/tmp/test/': '/base/client/'
    },

    // list of files / patterns to exclude
    exclude: [
      'node_modules/angular2/examples/**',
      'node_modules/angular2/ts/**',
      'node_modules/angular2/typings/**',
      'node_modules/angular2/**/*_spec.js',
      'node_modules/angular2/**/*.min.js',
      'node_modules/rxjs/bundles/**',
      'node_modules/rxjs/testing/**'
    ],

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['mocha', 'coverage'],

    coverageReporter: {
      dir: 'tmp',
      reporters: [
        { type: 'text-summary' },
        { type: 'json', subdir: 'coverage' }
      ]
    },

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
    browsers: [
      //'Chrome',
      'PhantomJS'
    ],

    customLaunchers: {
      Chrome_travis_ci: {
        base: 'Chrome',
        flags: ['--no-sandbox']
      }
    }
  });

  if (process.env.TRAVIS) {
    config.browsers = ['Chrome_travis_ci'];
    config.singleRun = true;
  }
};
