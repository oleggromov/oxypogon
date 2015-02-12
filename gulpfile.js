var gulp = require('gulp');
var markdown = require('gulp-markdown');
var jade = require('gulp-jade');
var article = require('./pipes/article');

var to = 'build/';
var jadeOptions = {
	basedir: 'src/',
	pretty: true
};

gulp.task('articles', function() {
	var from = 'src/content/**/*.md';

	gulp.src(from)
		.pipe(markdown())
		.pipe(article(jadeOptions))
		.pipe(gulp.dest(to));
});

gulp.task('jade', function() {
	var from = [
		'src/pages/**/*.jade',
		'!src/pages/useful/**/*.jade'
	];

	gulp.src(from)
		.pipe(jade(jadeOptions))
		.pipe(gulp.dest(to));
});


gulp.task('default', ['articles', 'jade']);
