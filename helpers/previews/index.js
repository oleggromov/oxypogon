var through = require('through2');
var meta = require('../meta');
var _ = require('lodash');
var path = require('path');
var markdown = require('../markdown');
var moment = require('moment');

module.exports.getList = function(previews) {
	return through.obj(function(file, enc, callback) {
		if (file.isNull()) {
			callback(null, file);
			return;
		}

		if (file.isStream()) {
			callback(new gutil.PluginError('pipe-article', 'Streaming not supported'));
			return;
		}

		var source = file.contents.toString();
		var articleMeta = meta.extract(source);

		var preview = _.pick(articleMeta, [
			'date',
			'more'
		]);

		var filePath = path.dirname(file.path);
		preview.url = filePath.replace(file.cwd + '/src/content', '') + '/';
		preview.preview = markdown.getPreview(source);
		preview.title = markdown.getTitle(source);
		preview.date = moment(preview.date).format('LLL');

		previews.push(preview);

		callback(null, file);
	});
};
