'use strict';

var gulp = require('gulp');
var slm = require('gulp-slm');
var live = require('gulp-livescript');
var stylus = require('gulp-stylus');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var streamify = require('gulp-streamify');
var uglify = require('gulp-uglify');
var mincss = require('gulp-minify-css');
var mv = require('gulp-rename');
var rm = require('gulp-rimraf');
var sequence = require('run-sequence');

gulp.task('default', function(cb) {
  sequence('copy',
          ['html', 'js', 'css'],
          cb);
});

gulp.task('copy', function() {
  return gulp.src('./src/**/*')
    .pipe(gulp.dest('./build'));
});

gulp.task('slm', function() {
  return gulp.src('./build/**/*.slm')
    .pipe(slm())
    .pipe(gulp.dest('./build'));
});

gulp.task('ls', function() {
  return gulp.src('./build/**/*.ls')
    .pipe(live())
    .pipe(gulp.dest('./build'));
});

gulp.task('stylus', function() {
  return gulp.src('./build/**/*.styl')
    .pipe(stylus())
    .pipe(gulp.dest('./build'));
});

gulp.task('html', ['slm']);

gulp.task('js', ['ls'], function() {
  var bundleStream = browserify('./build/index.js').bundle();

  return bundleStream.pipe(source('app.js'))
    .pipe(streamify(uglify()))
    .pipe(gulp.dest('./build'));
});

gulp.task('css', ['stylus'], function() {
  return gulp.src('./build/index.css')
    .pipe(mv({ basename: "app" }))
    .pipe(mincss())
    .pipe(gulp.dest('./build/'));
});

gulp.task('clean', function() {
  return gulp.src('./build', { read: false })
    .pipe(rm());
});
