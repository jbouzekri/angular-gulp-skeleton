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
var ngAnnotate = require('gulp-ng-annotate');
var argv = require('yargs').argv;
var karma = require('karma').server;
var webdriver_update = require('gulp-protractor').webdriver_update;
var protractor = require('gulp-protractor').protractor;
var sass = require('gulp-sass');
var batch = require('gulp-batch');

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

var tdd = false;
if (typeof argv.tdd !== "undefined") {
    tdd = true;
}

// Clean files
gulp.task('clean', function() {
    return gulp.src(config.bases.dist, {read: false})
    .pipe(clean());
});

/*
Copy all file
Use in dev environment
*/
gulp.task('copy-all', ['clean', 'jshint'], function() {
    var otherSrc = [config.bases.src+'*', config.bases.src+'**/*', '!'+config.bases.src+'*.html'];
    if (config.use_sass) {
        otherSrc.push('!src/**/*.css');
    }

    gulp.src([config.bases.src+'*.html'])
    // Manage removing of livereload script
    .pipe(gulpif(!isLivereload || !isWatch, htmlreplace({livereload: ""}, {keepUnassigned: true, keepBlockTags: true})))
    // Switch between sass or css according to configuration
    .pipe(gulpif(config.use_sass, htmlreplace({css: ""}, {keepUnassigned: true})))
    .pipe(gulpif(!config.use_sass, htmlreplace({sass: ""}, {keepUnassigned: true})))
    // Add other src
    .pipe(addsrc(otherSrc, {"base": config.bases.src}))
    .pipe(gulp.dest(config.bases.dist));
});

/*
Copy single files to dist folder
*/
gulp.task('single-files', ['clean'], function() {
    gulp.src(config.path.singlefiles, {base: config.bases.src})
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
gulp.task('js', ['clean', 'jshint'], function () {
    gulp.src(config.path.scripts)
    .pipe(ngAnnotate())
    .pipe(addsrc.prepend(config.path.libs))
    .pipe(uglify())
    .pipe(concat('app.js'))
    .pipe(gulp.dest(config.bases.dist + 'scripts/'));
});

/*
Process html
if prod minify html and put it in dist folder
*/
gulp.task('html', ['clean'], function () {
    gulp.src(config.path.html)
    .pipe(htmlreplace({
        css: 'css/stylesheets.css',
        js: 'scripts/app.js',
        sass: ''
    }))
    .pipe(htmlminify())
    .pipe(gulp.dest(config.bases.dist));
});

/*
Process css
*/
gulp.task('css', ['clean'], function() {
    gulp.src(config.path.css)
    .pipe(minifycss({comments:true, spare:true}))
    .pipe(concat('stylesheets.css'))
    .pipe(gulp.dest(config.bases.dist + 'css/'));
});

/*
Process sass
*/
gulp.task('sass', ['clean'], function () {
    gulp.src(config.path.sass.src)
    .pipe(sass(config.path.sass.conf))
    // If prod env, minify and concat
    .pipe(gulpif(env == "prod", minifycss({comments:true, spare:true})))
    .pipe(gulpif(env == "prod", concat('stylesheets.css')))
    .pipe(gulp.dest(config.bases.dist + 'css/'));
});

/*
Process fonts
*/
gulp.task('fonts', ['clean'], function() {
    gulp.src(config.path.fonts)
    .pipe(gulp.dest(config.bases.dist + 'fonts/'));
});

/*
Process images
*/
gulp.task('img', ['clean'], function() {
    gulp.src(config.path.img)
    .pipe(imagemin())
    .pipe(gulp.dest(config.bases.dist + 'img/'));
});

/**
* Run test once and exit
*/
gulp.task('test:unit', function (done) {
    karma.start({
        configFile: __dirname + '/test/karma.conf.js',
        singleRun: true
    }, done);
});

/*
Download the selenium webdriver
*/
gulp.task('webdriver_update', webdriver_update);

/*
* Run e2e tests
*/
gulp.task('test:e2e', ['build'], function(cb) {
    connect.server(config.serve);

    gulp.src(['test/e2e/**/*.spec.js'], { read:false })
    .pipe(protractor({
        configFile: 'test/protractor.conf.js',
    })).on('error', function(e) {
        console.log(e);
        connect.serverClose();
    }).on('end', function() {
        connect.serverClose();
    });
});

/*
Serve file
*/
gulp.task('serve', ['build'], function (done) {
    connect.server(config.serve);

    if (isWatch && isLivereload) {
        livereload.listen();
    }

    // Call with --watch to enable
    if (isWatch) {
        watch(['src/**/*', '!src/**/*.scss'], {verbose: true})
        .pipe(gulp.dest(config.bases.dist))
        .pipe(gulpif(isLivereload, livereload()));

        if (config.use_sass) {
            watch(config.path.sass.src, {verbose: true})
            .pipe(sass(config.path.sass.conf))
            .pipe(gulp.dest(config.bases.dist + 'css/'))
            .pipe(gulpif(isLivereload, livereload()));
        }
    }

    // Watch for file changes and re-run tests on each change
    // Call with --watch --tdd to enable
    if (isWatch && tdd) {
        karma.start({
            configFile: __dirname + '/test/karma.conf.js'
        }, done);
    }
});

/*
Build task
Different for dev or prod env
*/
var buildDep = ['copy-all', 'fonts'];
if (env === "prod") {
    buildDep = ['js', 'html', 'fonts', 'img', 'single-files'];
    if (!config.use_sass) {
        buildDep.push('css');
    }
}
if (config.use_sass) {
    buildDep.push('sass');
}

gulp.task('build', buildDep);

gulp.task('default', ['build']);
