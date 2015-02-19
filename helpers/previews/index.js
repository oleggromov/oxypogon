var through = require('through2');
var meta = require('../meta');
var _ = require('lodash');
var path = require('path');
var marked = require('marked');

module.exports = function(previews) {
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

		var tokens = marked.lexer(source);
		preview.preview = getPreview(tokens);
		preview.title = getTitle(tokens);

		previews.push(preview);

		callback(null, file);
	});
};

function getPreview(tokens) {
	var limit = 5;
	var count = 0;
	var previewTokens = [];
	previewTokens.links = {};

	for (var i = 0, max = tokens.length; i < max; i++) {
		if (count == limit || (count && tokens[i].type == 'heading')) {
			break;
		}

		if (tokens[i].type == 'paragraph') {
			previewTokens.push(tokens[i]);
			count++;
		}
	}


	return marked.parser(previewTokens);
}

function getTitle(tokens) {
	for (var i = 0, max = tokens.length; i < max; i++) {
		if (tokens[i].type == 'heading') {
			return tokens[i].text;
		}
	}
}
