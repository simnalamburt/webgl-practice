'use strict';

var gulp = require('gulp');
var rename = require('gulp-rename');
var live = require('gulp-livescript');
var uglify = require('gulp-uglify');
var rm = require('gulp-rimraf');

gulp.task('clean', function() {
  return gulp.src('script.ls.js', { read: false })
    .pipe(rm());
});

gulp.task('js', function() {
  return gulp.src('script.ls')
    .pipe(live())
    .pipe(uglify())
    .pipe(rename({ extname: '.ls.js' }))
    .pipe(gulp.dest('.'));
});

gulp.task('build', ['js']);

gulp.task('default', function() {
  gulp.start('build');
});
