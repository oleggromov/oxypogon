var gulp = require('gulp');
var markdown = require('gulp-markdown');
var jade = require('gulp-jade');
var data = require('gulp-data');

var to = 'build/';
var jadeOptions = {
	basedir: 'src/',
	pretty: true
};

gulp.task('articles', function() {
	var article = require('./helpers/article');
	var from = 'src/content/**/*.md';

	gulp.src(from)
		.pipe(markdown())
		.pipe(article(jadeOptions))
		.pipe(gulp.dest(to));
});

gulp.task('list', function() {
	var _ = require('lodash');
	var previews = require('./helpers/previews');
	var articles = [];

	var options = _.cloneDeep(jadeOptions);

	gulp.src('src/content/useful/**/*.md')
		.pipe(previews(articles))
		.pipe(data(sortAndBuild));

	function sortAndBuild () {
		var sortedArticles = _.sortBy(articles, function(article) {
			return -(new Date(article.date));
		});

		gulp.src('src/pages/index.jade')
			.pipe(jade(_.assign(options, {
				locals: {
					articles: sortedArticles
				}
			})))
			.pipe(gulp.dest(to));
	}
});

gulp.task('static', function() {
	var from = [
		'src/pages/**/*.jade',
		'!src/pages/useful/**/*.jade',
		'!src/pages/index.jade'
	];

	gulp.src(from)
		.pipe(jade(jadeOptions))
		.pipe(gulp.dest(to));
});


gulp.task('default', ['articles', 'list', 'static']);
