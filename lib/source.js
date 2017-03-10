const metamd = require('metamd');
const marked = require('marked');

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
		this._params = {
			previewSize: params.previewSize || DEFAULT_PREVIEW_SIZE
		};

		const parsed = metamd(content);

		this._markdown = parsed.markdown;
		this._meta = parsed.data;
		this._content = content;
		this._html = marked(this._markdown, {
			renderer: this._getMarkdownRenderer()
		});
		this._title = this._extractTitle(this._html);
		this._removeTitle();
	}

	get markdown () {
		return this._markdown;
	}

	getMeta (key) {
		const value = this._meta[key];

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
		const tokens = marked.lexer(this._markdown);

		let count = 0;
		let previewTokens = [];
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

		return marked.parser(previewTokens, {
			renderer: this._getMarkdownRenderer()
		});
	}

	_extractTitle (html) {
		const match = html.match(TITLE_REGEXP);
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

	_getMarkdownRenderer () {
		if (!this._renderer) {
			this._renderer = new marked.Renderer;
			this._renderer.link = this._renderLink.bind(this);
			this._renderer.image = this._renderImage.bind(this);
		}

		return this._renderer;
	}

	_renderLink (href, title, text) {
		const titleAttr = title ? `title="${title}"` : '';
		const targetAttr = EXT_LINK_REGEXP.test(href) ? 'target="_blank"' : '';

		return `<a href="${href}" ${titleAttr} ${targetAttr}>${text}</a>`;
	}

	_renderImage (src, title, alt) {
		const titleAttr = title ? `title="${title}"` : '';
		const altAttr = alt ? `alt="${alt}"` : '';
		const figCaption = alt ? `<figcaption>${alt}</figcaption>` : '';

		if (!ABSOLUTE_LINK_REGEXP.test(src)) {
			src = `${this._url}/${src}`;
		}

		return `<figure><img src="${src}" ${titleAttr} ${altAttr}>${figCaption}</figure>`;
	}
}

module.exports = Source;
