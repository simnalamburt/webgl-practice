'use strict';

var gulp = require('gulp');
var live = require('gulp-livescript');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var streamify = require('gulp-streamify');
var uglify = require('gulp-uglify');
var mincss = require('gulp-minify-css');
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

gulp.task('html', function() {
  return gulp.src('./build/**/*.html')
    .pipe(gulp.dest('./build'));
});

gulp.task('ls', function() {
  return gulp.src('./build/**/*.ls')
    .pipe(live())
    .pipe(gulp.dest('./build'));
});

gulp.task('js', ['ls'], function() {
  var bundleStream = browserify('./build/main.js').bundle();

  return bundleStream.pipe(source('app.js'))
    .pipe(streamify(uglify()))
    .pipe(gulp.dest('./build'));
});

gulp.task('css', function() {
  return gulp.src('./build/app.css')
    .pipe(mincss())
    .pipe(gulp.dest('./build/'));
});

gulp.task('clean', function() {
  return gulp.src('./build', { read: false })
    .pipe(rm());
});
