var metamd = require('metamd');
var marked = require('marked');

const TITLE_REGEXP = /\<h1(?:\s+id=\".*?\")?\>(.*?)<\/h1>/;
const CSV_REGEXP = /\s*,\s*/;

const ARR_KEYS = ['tags'];

const PREVIEW_SIZE = 5;
const PREVIEW_TOKENS = ['paragraph', 'code'];

class Source {
	/**
	 * Name is arbitrary when creating source of a piece (index)
	 * and url is arbitrary, in turn, when creating source of a piece.
	 */
	constructor (name, url, content) {
		this._name = name;
		this._url = url;

		let parsed = metamd(content);

		this._markdown = parsed.markdown;
		this._meta = parsed.data;
		this._content = content;
		this._html = marked(this._markdown);
		this._title = this._extractTitle(this._html);
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

	get name () {
		return this._name;
	}

	get url () {
		return this._url;
	}

	get html () {
		return this._html;
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