var gulp = require('gulp')

/*
Tasks dependencies
*/
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

/*
Config
Load custom tasks configuration
*/
var config = require('./config.json');

/*
Read command line parameters
*/
// --env parameter. Default to the one in config.json
var env = config.env;
if (typeof argv.env !== "undefined") {
    env = argv.env;
}
// --watch parameter (used in serve task in dev env).
var isWatch = false;
if (typeof argv.watch !== "undefined") {
    isWatch = true;
}
// --no-livereload parameter (used in serve task in dev env) to disable live reload
var isLivereload = true;
if (typeof argv.livereload !== "undefined") {
    isLivereload = false;
}
// --tdd parameter (used with --watch parameter) to enable running unit test on each changes
var tdd = false;
if (typeof argv.tdd !== "undefined") {
    tdd = true;
}

/*
Clean files
Remove the dist/ folder
*/
gulp.task('clean', function() {
    return gulp.src(config.bases.dist, {read: false})
    .pipe(clean());
});

/*
Copy all file
Use in dev environment to build the project
It moves files from src/ to dist/ with almost no files transformation
*/
gulp.task('copy-all', ['clean', 'jshint'], function() {
    /*
    Starts by processing main index.html file
    It removes livereload js if functionality has been disabled and sass stylesheets if using css without processor
    */

    // prepare list of files to pipe after processing index.html file
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
    // Copy to dist folder
    .pipe(gulp.dest(config.bases.dist));
});

/*
Copy single files to dist folder
For example favicon.ico
*/
gulp.task('single-files', ['clean'], function() {
    gulp.src(config.path.singlefiles, {base: config.bases.src})
    .pipe(gulp.dest(config.bases.dist));
});

/*
jshint task
Apply jshint to all src js files
*/
gulp.task('jshint', function () {
    gulp.src(config.path.scripts)
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

/*
Process scripts, ng annotate, uglify and concatenate them into one output file
Use in production environment
*/
gulp.task('js', ['clean', 'jshint'], function () {
    gulp.src(config.path.scripts)
    // ng annotate project js files
    .pipe(ngAnnotate())
    // Pipe libraries js files
    .pipe(addsrc.prepend(config.path.libs))
    // uglify and concat in one single file
    .pipe(uglify())
    .pipe(concat('app.js'))
    // Put in dist/scripts folder
    .pipe(gulp.dest(config.bases.dist + 'scripts/'));
});

/*
Process html, replace stylesheets and javascript blocks with minified version and minify html
Use in production environment
*/
gulp.task('html', ['clean'], function () {
    gulp.src(config.path.html)
    // Replace stylesheets and javascript blocks with minified version
    .pipe(htmlreplace({
        css: 'css/stylesheets.css',
        js: 'scripts/app.js',
        sass: ''
    }))
    // Minify html
    .pipe(htmlminify())
    // Put in dist/ folder
    .pipe(gulp.dest(config.bases.dist));
});

/*
Process css, minify it and concat them in a single file
Use in production environment
*/
gulp.task('css', ['clean'], function() {
    gulp.src(config.path.css)
    // minify css
    .pipe(minifycss({comments:true, spare:true}))
    // Concat them
    .pipe(concat('stylesheets.css'))
    // Put in dist/css/ folder
    .pipe(gulp.dest(config.bases.dist + 'css/'));
});

/*
Process sass
- transforms to css
- if prod environement, minifiy and concat them
- Put in dist/css/ folder
*/
gulp.task('sass', ['clean'], function () {
    gulp.src(config.path.sass.src)
    // transforms to css
    .pipe(sass(config.path.sass.conf))
    // If prod env, minify and concat
    .pipe(gulpif(env == "prod", minifycss({comments:true, spare:true})))
    .pipe(gulpif(env == "prod", concat('stylesheets.css')))
    // Put in dist/css/ folder
    .pipe(gulp.dest(config.bases.dist + 'css/'));
});

/*
Process fonts
Copy fonts from project and libraries in dist/fonts/ folder
*/
gulp.task('fonts', ['clean'], function() {
    gulp.src(config.path.fonts)
    .pipe(gulp.dest(config.bases.dist + 'fonts/'));
});

/*
Process images
Minify them and copy to dist/img/ folder
Use in production environment
*/
gulp.task('img', ['clean'], function() {
    gulp.src(config.path.img)
    // Minify images
    .pipe(imagemin())
    // Put in dist/img/ folder
    .pipe(gulp.dest(config.bases.dist + 'img/'));
});

/*
Run unit tests once and exit
*/
gulp.task('test:unit', function (done) {
    karma.start({
        configFile: __dirname + '/test/karma.conf.js',
        singleRun: true
    }, done);
});

/*
Download the selenium webdriver
Use by npm install to download automatically the selenium web driver
*/
gulp.task('webdriver_update', webdriver_update);

/*
Run e2e tests
The site should be available on localhost:8888 before running this command.
Moreover check the configuration of protractor.conf.js file (mainly the selenium driver)
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

    // If call with --watch without --no-livereload
    if (isWatch && isLivereload) {
        livereload.listen();
    }

    // Call with --watch to enable
    if (isWatch) {
        // Watch changes in all files except scss files
        watch(['src/**/*', '!src/**/*.scss'], {verbose: true})
        // Copy them in dist/ folder
        .pipe(gulp.dest(config.bases.dist))
        // Then launch live reload if enabled
        .pipe(gulpif(isLivereload, livereload()));

        // If sass has been enabled. Custom watch to launch preprocessing
        if (config.use_sass) {
            // Watch changes in scss files
            watch(config.path.sass.src, {verbose: true})
            // Process them with node-sass
            .pipe(sass(config.path.sass.conf))
            // Copy them to dist/css/ folder
            .pipe(gulp.dest(config.bases.dist + 'css/'))
            // Then launch live reload if enabled
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
    buildDep = ['js', 'html', 'fonts', 'img'];
    if (!config.use_sass) {
        buildDep.push('css');
    }
}
if (config.use_sass) {
    buildDep.push('sass');
}

gulp.task('build', buildDep);

gulp.task('default', ['build']);
