var gulp = require('gulp');
var jade = require('gulp-jade');
var data = require('gulp-data');
var _ = require('lodash');

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
	var previews = require('./helpers/previews').getList;
	var articles = [];

	var menu = [
		{
			caption: 'Articles',
			url: '/articles/',
			active: true,
		},
		{
			caption: 'About me',
			url: '/about/',
			active: false
		}
	];

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
					articles: sortedArticles,
					menu: menu
				}
			})))
			.pipe(gulp.dest(to + 'articles/'));
	}
});

gulp.task('static', function() {
	var from = [
		'src/page/**/*.jade',
		'!src/page/articles/**/*.jade',
		'!src/page/index/*.jade'
	];

	var menu = [
		{
			caption: 'Articles',
			url: '/articles/',
			active: false,
		},
		{
			caption: 'About me',
			url: '/about/',
			active: true
		}
	];

	var options = _.cloneDeep(jadeOptions);

	gulp.src(from)
		.pipe(jade(_.assign(options, {
			locals: {
				menu: menu
			}
		})))
		.pipe(gulp.dest(to));
});


gulp.task('default', ['articles', 'index', 'static']);
