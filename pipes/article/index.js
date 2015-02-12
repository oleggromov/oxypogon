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
			cb(new gutil.PluginError('pipe-article', 'Streaming not supported'));
			return;
		}

		var html = file.contents.toString();
		var options = extractOptions(html);
		options.content = stripOptions(html);

		var article = jade.compileFile('src/pages/' + options.template + '/index.jade', jadeOptions);
		delete options.template;

		file.contents = new Buffer(article(options));
		file.path = gutil.replaceExtension(file.path, '.html');

		cb(null, file);
	});
};

var optionsRegexp = /^<!---\s+((.+\n+)+)-->/;

function extractOptions (htmlString) {
	var match = htmlString.match(optionsRegexp);

	return match ? JSON.parse(match[1]) : {};
}

function stripOptions (htmlString) {
	return htmlString.replace(optionsRegexp, '');
}
