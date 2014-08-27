'use strict';

var gulp = require('gulp');

var save = function() { return gulp.dest('./build'); };

gulp.task('default', function(cb) {
  var sequence = require('run-sequence');

  sequence('copy',
          ['html', 'js', 'css'],
          cb);
});

gulp.task('copy', function() {
  return gulp.src('./src/**/*')
    .pipe(save());
});

gulp.task('slm', function() {
  var slm = require('gulp-slm');

  return gulp.src('./build/**/*.slm')
    .pipe(slm())
    .pipe(save());
});

gulp.task('ls', function() {
  var live = require('gulp-livescript');

  return gulp.src('./build/**/*.ls')
    .pipe(live())
    .pipe(save());
});

gulp.task('stylus', function() {
  var stylus = require('gulp-stylus');

  return gulp.src('./build/**/*.styl')
    .pipe(stylus())
    .pipe(save());
});

gulp.task('html', ['slm']);

gulp.task('js', ['ls'], function() {
  var browserify = require('browserify');
  var mv = require('vinyl-source-stream');
  var min = function() { return require('gulp-streamify')(require('gulp-uglify')()); };

  return browserify('./build/index.js').bundle()
    .pipe(mv('app.js'))
    .pipe(min())
    .pipe(save());
});

gulp.task('css', ['stylus'], function() {
  var mv = require('gulp-rename');
  var min = require('gulp-minify-css');

  return gulp.src('./build/index.css')
    .pipe(mv('app.css'))
    .pipe(min())
    .pipe(save());
});

gulp.task('clean', function() {
  var rm = require('gulp-rimraf');

  return gulp.src('./build', { read: false })
    .pipe(rm());
});
