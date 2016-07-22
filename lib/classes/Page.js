var path = require('path');

var Source = require('./Source');
// var Template = require('./Template');

class Page {
	constructor (source, config) {
		this._source = source;
		this._config = config;

		this._path = this._getPath();
		this._title = this._extractTitle(this._source.html);

		// this._template = new Template(this._source.meta.template);
	}

	set pieces (pieces) {
		this._pieces = pieces;
	}

	_getPath () {
		var content = path.resolve(this._config.getPath('content'));
		return path.parse(path.relative(content, this._source.path)).dir;
	}

	_extractTitle (html) {
		var match = html.match(/\<h1\>(.*?)<\/h1>/);
		if (match) {
			return match[1];
		}
	}
}

module.exports = Page;
