module.exports = function(config) {
    config.set({
        browsers: ['Chrome'],
        frameworks: ['jasmine'],
        files: [
            'src/bower_components/angular/angular.js',
            'src/bower_components/angular-mocks/angular-mocks.js',
            'src/app.js',
            'src/scripts/**/*.js',
            'test/**/*.spec.js'
        ]
    });
};
