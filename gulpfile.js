var gulp = require('gulp');
var concat = require('gulp-concat');
var path = require('path');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var wrap = require('gulp-wrap-js');

gulp.task('js', function () {
    return gulp
        .src('src/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(concat('asyncplify.js'))
        .pipe(wrap('(function () { "use strict"; %= body %}());'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist'));
});

gulp.task('test', ['js'], function () {
    return gulp
        .src(['./tests/**/*.js'])
        .pipe(require('gulp-mocha')());
});

gulp.task('js-min', function () {
    return gulp
        .src('src/**/*.js')
        .pipe(concat('asyncplify.min.js'))
        .pipe(wrap('(function () { "use strict"; %= body %}());'))
        .pipe(uglify())
        .pipe(gulp.dest('dist'));
});

gulp.task('watch', function () {
    return gulp.watch('./src/*.js', ['js']);
});

gulp.task('default', ['watch', 'js']);

gulp.task('perf', ['js'], function () {
   return gulp
        .src('./perf/*.js', {read: false})
        .pipe(require('gulp-bench')());
});
