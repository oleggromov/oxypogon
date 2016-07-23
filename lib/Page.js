var path = require('path');

var Source = require('./Source');
var Template = require('./Template');

class Page {
	constructor (source, config) {
		this._source = source;
		this._config = config;
		this._path = this._getPath();
		this._template = new Template(this._source.getMeta('template'), config.getPath('tpl'));
	}

	render (pieces, extra) {
		return this._template.render({
			source: this._source,
			pieces,
			extra
		});
	}

	get path () {
		return this._path;
	}

	get source () {
		return this._source;
	}

	_getPath () {
		var content = path.resolve(this._config.getPath('content'));
		return path.parse(path.relative(content, this._source.path)).dir;
	}
}

module.exports = Page;
