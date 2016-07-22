var parse = require('path').parse;
var metamd = require('metamd');
var md = require('markdown-it')();

class Source {
	constructor (path, content) {
		let parsed = metamd(content);

		this._markdown = parsed.markdown;
		this._meta = parsed.data;
		this._content = content;
		this._html = md.render(this._markdown);
		this._title = this._extractTitle(this._html);

		this._path = path;
		this._parsed = parse(path);
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

	get path () {
		return this._path;
	}

	get name () {
		return this._parsed.name;
	}

	get title () {
		return this._title;
	}

	_extractTitle (html) {
		var match = html.match(/\<h1\>(.*?)<\/h1>/);
		if (match) {
			return match[1];
		}
	}
}

module.exports = Source;
