var jade = require('jade');
var through = require('through2');
var gutil = require('gulp-util');
var meta = require('../meta');
var markdown = require('../markdown');
var moment = require('moment');
var _ = require('lodash');

module.exports = function (jadeOptions) {
	return through.obj(function(file, enc, cb) {
		if (file.isNull()) {
			cb(null, file);
			return;
		}

		if (file.isStream()) {
			cb(new gutil.PluginError('pipe-article', 'Streaming not supported'));
			return;
		}

		var source = file.contents.toString();
		var options = meta.extract(source);
		options.content = meta.strip(markdown.getContent(source));
		options.title = markdown.getTitle(source);

		var articleTemplate = jade.compileFile('src/page/' + options.page + '/index.jade', jadeOptions);
		delete options.page;

		options = _.assign(options, jadeOptions.locals);

		options.date = moment(options.date).format('LLL');

		file.contents = new Buffer(articleTemplate(options));
		file.path = gutil.replaceExtension(file.path, '.html');

		cb(null, file);
	});
};
