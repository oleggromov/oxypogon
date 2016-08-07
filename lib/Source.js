var metamd = require('metamd');
var marked = require('marked');

const EXT_LINK_REGEXP = /^(https?\:)?\/\//;
const ABSOLUTE_LINK_REGEXP = /^\//;
const TITLE_REGEXP = /\<h1(?:\s+\w+=\".*?\")*\>(.*?)<\/h1>/;
const CSV_REGEXP = /\s*,\s*/;

const ARR_KEYS = ['tags'];

const DEFAULT_PREVIEW_SIZE = 5;
const PREVIEW_TOKENS = ['paragraph', 'code'];
const BREAK_ON_TOKEN = 'heading';

class Source {
	/**
	 * Name is arbitrary when creating source of a piece (index)
	 * and url is arbitrary, in turn, when creating source of a piece.
	 */
	constructor (name, url, content, params) {
		this._name = name;
		this._url = url;
		this._params = this._getParams(params);

		let parsed = metamd(content);

		this._markdown = parsed.markdown;
		this._meta = parsed.data;
		this._content = content;
		this._html = this._renderMarkdown(this._markdown);
		this._title = this._extractTitle(this._html);
		this._removeTitle();
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
			if (count === this._params.previewSize || (count && tokens[i].type === BREAK_ON_TOKEN)) {
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

	_removeTitle () {
		this._html = this._html.replace(TITLE_REGEXP, '')
	}

	_getArray (csvString) {
		return csvString.split(CSV_REGEXP);
	}

	_renderMarkdown (markdown) {
		var renderer = new marked.Renderer;
		renderer.link = this._renderLink.bind(this);
		renderer.image = this._renderImage.bind(this);

		return marked(this._markdown, { renderer });
	}

	_renderLink (href, title, text) {
		var titleAttr = title ? `title="${title}"` : '';
		var targetAttr = EXT_LINK_REGEXP.test(href) ? 'target="_blank"' : '';

		return `<a href="${href}" ${titleAttr} ${targetAttr}>${text}</a>`;
	}

	_renderImage (src, title, alt) {
		var titleAttr = title ? `title="${title}"` : '';
		var altAttr = alt ? `alt="${alt}"` : '';

		if (!ABSOLUTE_LINK_REGEXP.test(src)) {
			src = this._url	+ '/' + src;
		}

		return `<img src="${src}" ${titleAttr} ${altAttr}>`;
	}

	_getParams (params) {
		params.previewSize = params.previewSize || DEFAULT_PREVIEW_SIZE;
		return params;
	}
}

module.exports = Source;
