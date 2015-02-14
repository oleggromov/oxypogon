var jade = require('jade');
var through = require('through2');
var gutil = require('gulp-util');
var meta = require('../meta');

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

		var html = file.contents.toString();
		var options = meta.extract(html);
		options.content = meta.strip(html);

		var articleTemplate = jade.compileFile('src/pages/' + options.template + '/index.jade', jadeOptions);
		delete options.template;

		file.contents = new Buffer(articleTemplate(options));
		file.path = gutil.replaceExtension(file.path, '.html');

		cb(null, file);
	});
};



