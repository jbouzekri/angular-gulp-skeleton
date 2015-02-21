var skeletonConfig = require('../config.json');

exports.config = {
    // The address of a running selenium server.
    seleniumServerJar: '../node_modules/gulp-protractor/node_modules/protractor/selenium/selenium-server-standalone-2.44.0.jar', // Make use you check the version in the folder
    //seleniumAddress: 'http://localhost:4444/wd/hub',
    // Capabilities to be passed to the webdriver instance.
    capabilities: {
        'browserName': 'chrome'
    },

    baseUrl: 'http://localhost:'+skeletonConfig.serve.port+'/',

    // Options to be passed to Jasmine-node.
    jasmineNodeOpts: {
        showColors: true,
        defaultTimeoutInterval: 30000
    }
};
