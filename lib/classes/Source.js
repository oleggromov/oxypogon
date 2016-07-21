var metamd = require('metamd');
var md = require('markdown-it')();

class Source {
	constructor (sourceStr) {
		let parsed = metamd(sourceStr);

		this._markdown = parsed.markdown;
		this._meta = parsed.data;
		this._source = sourceStr;
		this._html = md.render(this._markdown);
	}

	get markdown () {
		return this._markdown;
	}

	get meta () {
		return this._meta;
	}

	get html () {
		return this._html;
	}
}

module.exports = Source;
