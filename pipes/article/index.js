var jade = require('jade');
var through = require('through2');
var gutil = require('gulp-util');

module.exports = function (jadeOptions) {
	return through.obj(function(file, enc, cb) {
		if (file.isNull()) {
			cb(null, file);
			return;
		}

		if (file.isStream()) {
			cb(new gutil.PluginError('gulp-markdown', 'Streaming not supported'));
			return;
		}

		var html = file.contents.toString();
		var options = extractOptions(html);
		options.content = html;

		var article = jade.compileFile('src/pages/' + options.template + '/index.jade', jadeOptions);
		delete options.template;

		file.contents = new Buffer(article(options));
		file.path = gutil.replaceExtension(file.path, '.html');

		cb(null, file);
	});
};


function extractOptions (htmlString) {
	var match = htmlString.match(/^<!---\s+((.+\n+)+)-->/);

	return match ? JSON.parse(match[1]) : {};
}