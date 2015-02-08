var gulp = require('gulp');
var jade = require('gulp-jade');

gulp.task('jade', function() {
	var from = 'src/pages/**/*.jade';
	var to = 'build/';
	var options = {
		basedir: 'src/',
		pretty: true
	};

	gulp.src(from)
		.pipe(jade(options))
		.pipe(gulp.dest(to));
});

gulp.task('markdown', function() {
	console.log('ok');
});

gulp.task('default', ['jade']);