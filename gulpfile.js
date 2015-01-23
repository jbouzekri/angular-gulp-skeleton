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
var argv = require('yargs').argv;

// Config
var config = require('./config.json');

var env = config.env;
if (typeof argv.env !== "undefined") {
    env = argv.env;
}

// Clean files
gulp.task('clean-js', function() {
    return gulp.src(config.bases.dist+'**/*.js', {read: false})
    .pipe(clean());
});
gulp.task('clean-css', function() {
    return gulp.src(config.bases.dist+'**/*.css', {read: false})
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
gulp.task('clean', ['clean-html', 'clean-fonts', 'clean-css', 'clean-js', 'clean-img']);

/*
Process scripts and concatenate them into one output file
*/
gulp.task('js', ['clean-js'], function () {
  gulp.src(config.path.scripts)
  .pipe(jshint())
  .pipe(jshint.reporter('default'))
  // if prod, uglify and concat with lib scripts and put in dist folder
  .pipe(gulpif(env == "prod", uglify()))
  .pipe(gulpif(env == "prod", addsrc.prepend(config.path.libs)))
  .pipe(gulpif(env == "prod", concat('app.js')))
  .pipe(gulpif(env == "prod", gulp.dest(config.bases.dist + 'scripts/')));
});

/*
Process html
if prod minify html and put it in dist folder
*/
gulp.task('html', ['clean-html'], function () {
    gulp.src(config.path.html)
    .pipe(gulpif(env == "prod", htmlreplace({
        css: 'css/stylesheets.css',
        js: 'scripts/app.js'
    })))
    .pipe(gulpif(env == "prod", htmlminify()))
    .pipe(gulpif(env == "prod", gulp.dest(config.bases.dist)));
});

/*
Process css
*/
gulp.task('css', ['clean-css'], function() {
    gulp.src(config.path.css)
    .pipe(gulpif(env == "prod", minifycss({comments:true, spare:true})))
    .pipe(gulpif(env == "prod", concat('stylesheets.css')))
    .pipe(gulpif(env == "prod", gulp.dest(config.bases.dist + 'css/')));
});

/*
Process fonts
*/
gulp.task('fonts', ['clean-fonts'], function() {
    gulp.src(config.path.fonts)
    .pipe(gulpif(env == "prod", gulp.dest(config.bases.dist + 'fonts/')));
});

/*
Process images
*/
gulp.task('img', ['clean-img'], function() {
    gulp.src(config.path.img)
    .pipe(imagemin())
    .pipe(gulp.dest(config.bases.dist + 'img/'));
});

/*
Serve file
serve from dist if gulp serve --env=prod
else serve directly from src
*/
gulp.task('serve', function () {
  connect.server(
      gulpif(env == "dev", config.dev.serve, config.prod.serve)
  );
});

gulp.task('build', ['js', 'html', 'css', 'fonts', 'img']);
