var marked = require('marked');

module.exports = {
	getPreview: getPreview,
	getTitle: getTitle,
	getContent: getContent
};

function getPreview(source) {
	var tokens = marked.lexer(source);

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

function getTitle(source) {
	var tokens = marked.lexer(source);

	for (var i = 0, max = tokens.length; i < max; i++) {
		if (tokens[i].type == 'heading') {
			return tokens[i].text;
		}
	}
}

function getContent(source) {
	return marked(source);
}
