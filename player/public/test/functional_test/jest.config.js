module.exports = {
    globalSetup: './setup.js',
    globalTeardown: './teardown.js',
    testEnvironment: './puppeteer_environment.js',
    "reporters": [
      "default",
      "jest-screenshot/reporter",
      ["jest-html-reporters", {
        "publicPath": "./testReport",
        "filename": "report.html",
        "expand": true
      }]
    ],
  }
  