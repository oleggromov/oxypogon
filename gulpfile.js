var gulp = require('gulp');
var jade = require('gulp-jade');
var data = require('gulp-data');
var watch = require('gulp-watch');
var _ = require('lodash');
var to = 'build/';
var jadeOptions = {
	basedir: 'src/',
	pretty: true
};

var menuGlobal = require('./src/menu.js');

gulp.task('clean', function () {
	var del = require('del');
	return del(to + '*');
});

gulp.task('articles', ['clean'], function() {
	var article = require('./helpers/article');
	var from = 'src/content/**/*.md';

	var menu = _.cloneDeep(menuGlobal);

	var options = _.cloneDeep(jadeOptions);

	gulp.src(from)
		.pipe(article(_.assign(options, {
			locals: {
				menu: menu
			}
		})))
		.pipe(gulp.dest(to));
});

gulp.task('index', ['clean'], function() {
	var previews = require('./helpers/previews').getList;
	var articles = [];

	var menu = _.cloneDeep(menuGlobal);
	menu[0].active = true;

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

// gulp.task('pages', ['clean'], function() {
// 	var from = [
// 		'src/page/**/*.jade',
// 		'!src/page/articles/**/*.jade',
// 		'!src/page/index/*.jade'
// 	];

// 	var menu = _.cloneDeep(menuGlobal);
// 	// menu[1].active = true;

// 	var options = _.cloneDeep(jadeOptions);

// 	gulp.src(from)
// 		.pipe(jade(_.assign(options, {
// 			locals: {
// 				menu: menu
// 			}
// 		})))
// 		.pipe(gulp.dest(to));
// });

gulp.task('static', function () {
	gulp.src(['src/static/**/*']).pipe(gulp.dest(to + 'static/'));
});

gulp.task('watch', function() {
  gulp.watch('src/static/**/*', ['static']);
});

gulp.task('default', ['clean', 'articles', 'index', 'static']);
