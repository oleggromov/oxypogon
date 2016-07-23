var parse = require('path').parse;
var metamd = require('metamd');
var marked = require('marked');

const TITLE_REGEXP = /\<h1(?:\s+id=\".*?\")?\>(.*?)<\/h1>/;
const CSV_REGEXP = /\s*,\s*/;

const ARR_KEYS = ['tags'];

const PREVIEW_SIZE = 5;
const PREVIEW_TOKENS = ['paragraph', 'code'];

class Source {
	constructor (path, content) {
		let parsed = metamd(content);

		this._markdown = parsed.markdown;
		this._meta = parsed.data;
		this._content = content;
		this._html = marked(this._markdown);
		this._title = this._extractTitle(this._html);

		this._path = path;
		this._parsed = parse(path);
	}

	get markdown () {
		return this._markdown;
	}

	getMeta (key) {
		var value = this._meta[key];

		if (value) {
			if (ARR_KEYS.includes(key)) {
				return this._getArray(value);
			} else {
				return value;
			}
		} else {
			return null;
		}
	}

	get html () {
		return this._html;
	}

	get path () {
		return this._path;
	}

	get name () {
		return this._parsed.name;
	}

	get title () {
		return this._title;
	}

	get preview () {
		var tokens = marked.lexer(this._markdown);

		var count = 0;
		var previewTokens = [];
		previewTokens.links = {};

		for (let i = 0, max = tokens.length; i < max; i++) {
			if (count === PREVIEW_SIZE || (count && tokens[i].type === 'heading')) {
				break;
			}

			if (PREVIEW_TOKENS.includes(tokens[i].type)) {
				previewTokens.push(tokens[i]);
				count++;
			}
		}

		return marked.parser(previewTokens);
	}

	_extractTitle (html) {
		var match = html.match(TITLE_REGEXP);
		if (match) {
			return match[1];
		}
	}

	_getArray (csvString) {
		return csvString.split(CSV_REGEXP);
	}
}

module.exports = Source;
