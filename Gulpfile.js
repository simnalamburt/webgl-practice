'use strict';

var gulp = require('gulp');
var live = require('gulp-livescript');
var min = require('gulp-uglify');
var rm = require('gulp-rimraf');

gulp.task('ls', function() {
  return gulp.src('./src/**/*.ls')
    .pipe(live())
    .pipe(min())
    .pipe(gulp.dest('./build'));
});

gulp.task('js', ['ls'], function() {
  return gulp.src('./src/**/*.js')
    .pipe(min())
    .pipe(gulp.dest('./build'));
});

gulp.task('html', function() {
  return gulp.src('./src/**/*.html')
    .pipe(gulp.dest('./build'));
});

gulp.task('default', ['js', 'html']);

gulp.task('clean', function() {
  return gulp.src('./build', { read: false })
    .pipe(rm());
});
