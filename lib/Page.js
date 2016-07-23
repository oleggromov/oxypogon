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

	render (pieces, extra, tags) {
		return this._template.render({
			source: this._source,
			pieces,
			tags,
			extra
		});
	}

	get path () {
		return this._path;
	}

	get url () {
		return `/${this._path}`;
	}

	get title () {
		return this._source.title;
	}

	get date () {
		return this._source.getMeta('date');
	}

	get more () {
		return this._source.getMeta('more');
	}

	get preview () {
		return this._source.preview;
	}

	getTags () {
		return this._source.getMeta('tags');
	}

	/**
	 * @todo This may work in undesired manner because of
	 * omitted filename in page.path. Maybe it's better to refactor the method
	 * to start using honest path resolving algorithm.
	 */
	fitsPath (path) {
		return new RegExp('^' + path).test(this.path);
	}

	_getPath () {
		var content = path.resolve(this._config.getPath('content'));
		return path.parse(path.relative(content, this._source.path)).dir;
	}
}

module.exports = Page;
