var gulp = require('gulp')

// plugins
var concat = require('gulp-concat')
var connect = require('gulp-connect');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var clean = require('gulp-clean');
var htmlreplace = require('gulp-html-replace');
var gulpif = require('gulp-if');
var htmlminify = require("gulp-minify-html");
var addsrc = require('gulp-add-src');
var minifycss = require('gulp-minify-css');
var debug = require('gulp-debug');
var imagemin = require('gulp-imagemin');
var watch = require('gulp-watch');
var livereload = require('gulp-livereload');
var argv = require('yargs').argv;
var karma = require('karma').server;

// Config
var config = require('./config.json');

// Read command line params
var env = config.env;
if (typeof argv.env !== "undefined") {
    env = argv.env;
}

var isWatch = false;
if (typeof argv.watch !== "undefined") {
    isWatch = true;
}

var isLivereload = true;
if (typeof argv.livereload !== "undefined") {
    isLivereload = false;
}

// Clean files
gulp.task('clean', function() {
    return gulp.src(config.bases.dist, {read: false})
    .pipe(clean());
});
gulp.task('clean-bower', function() {
    return gulp.src(config.bases.dist+'bower_components/', {read: false})
    .pipe(clean());
});
gulp.task('clean-js', function() {
    return gulp.src(config.bases.dist+'scripts/*', {read: false})
    .pipe(clean());
});
gulp.task('clean-css', function() {
    return gulp.src(config.bases.dist+'css/*', {read: false})
    .pipe(clean());
});
gulp.task('clean-fonts', function() {
    return gulp.src(config.bases.dist+'**/fonts/*', {read: false})
    .pipe(clean());
});
gulp.task('clean-html', function() {
    return gulp.src(config.bases.dist+'**/*.html', {read: false})
    .pipe(clean());
});
gulp.task('clean-img', function() {
    return gulp.src(config.bases.dist+'img/*', {read: false})
    .pipe(clean());
});

/*
Copy all file
Use in dev environment
*/
gulp.task('copy-all', ['clean', 'jshint'], function() {
    gulp.src([config.bases.src+'*.html'])
    // Manage removing of livereload script
    .pipe(gulpif(!isLivereload, htmlreplace({livereload: ""}, {keepUnassigned: true})))
    // Add other src
    .pipe(addsrc([config.bases.src+'*', config.bases.src+'**/*', '!'+config.bases.src+'*.html'], {"base": config.bases.src}))
    .pipe(gulp.dest(config.bases.dist));
});

/*
jshint task
*/
gulp.task('jshint', function () {
    gulp.src(config.path.scripts)
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

/*
Process scripts and concatenate them into one output file
*/
gulp.task('js', ['clean-js', 'jshint'], function () {
    gulp.src(config.path.scripts)
    .pipe(uglify())
    .pipe(addsrc.prepend(config.path.libs))
    .pipe(concat('app.js'))
    .pipe(gulp.dest(config.bases.dist + 'scripts/'));
});

/*
Process html
if prod minify html and put it in dist folder
*/
gulp.task('html', ['clean-html'], function () {
    gulp.src(config.path.html)
    .pipe(htmlreplace({
        css: 'css/stylesheets.css',
        js: 'scripts/app.js'
    }))
    .pipe(htmlminify())
    .pipe(gulp.dest(config.bases.dist));
});

/*
Process css
*/
gulp.task('css', ['clean-css'], function() {
    gulp.src(config.path.css)
    .pipe(minifycss({comments:true, spare:true}))
    .pipe(concat('stylesheets.css'))
    .pipe(gulp.dest(config.bases.dist + 'css/'));
});

/*
Process fonts
*/
gulp.task('fonts', ['clean-fonts'], function() {
    gulp.src(config.path.fonts)
    .pipe(gulp.dest(config.bases.dist + 'fonts/'));
});

/*
Process images
*/
gulp.task('img', ['clean-img'], function() {
    gulp.src(config.path.img)
    .pipe(imagemin())
    .pipe(gulp.dest(config.bases.dist + 'img/'));
});

/**
* Run test once and exit
*/
gulp.task('test', function (done) {
    karma.start({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }, done);
});

/**
* Watch for file changes and re-run tests on each change
*/
gulp.task('tdd', function (done) {
    karma.start({
        configFile: __dirname + '/karma.conf.js'
    }, done);
});

/*
Serve file
*/
gulp.task('serve', ['build'], function () {
    connect.server(config.serve);

    if (isWatch && isLivereload) {
        livereload.listen();
    }

    // Call with --watch to enable
    if (isWatch) {
        watch('src/**/*', {verbose: true})
        .pipe(gulp.dest(config.bases.dist))
        .pipe(gulpif(isLivereload, livereload()));
    }
});

/*
Build task
Different for dev or prod env
*/
var buildDep = ['copy-all'];
if (env === "prod") {
    buildDep = ['js', 'html', 'css', 'fonts', 'img', 'clean-bower'];
}
gulp.task('build', buildDep);

gulp.task('default', ['build']);
