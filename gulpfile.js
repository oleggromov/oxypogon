var gulp = require('gulp');
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
		.pipe(article(jadeOptions))
		.pipe(gulp.dest(to));
});

gulp.task('index', function() {
	var _ = require('lodash');
	var previews = require('./helpers/previews').getList;
	var articles = [];

	var options = _.cloneDeep(jadeOptions);

	gulp.src('src/content/articles/**/*.md')
		.pipe(previews(articles))
		.pipe(data(sortAndBuild));

	function sortAndBuild() {
		var sortedArticles = _.sortBy(articles, function(article) {
			return -(new Date(article.date));
		});

		gulp.src('src/page/articles/index.jade')
			.pipe(jade(_.assign(options, {
				locals: {
					articles: sortedArticles
				}
			})))
			.pipe(gulp.dest(to + 'articles/'));
	}
});

gulp.task('static', function() {
	var from = [
		'src/page/**/*.jade',
		'!src/page/articles/**/*.jade',
		'!src/page/article/*.jade',
		'!src/page/index/*.jade'
	];

	gulp.src(from)
		.pipe(jade(jadeOptions))
		.pipe(gulp.dest(to));
});


gulp.task('default', ['articles', 'index', 'static']);
