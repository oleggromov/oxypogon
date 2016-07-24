var path = require('path');
var Template = require('./Template');

class Page {
	constructor (params) {
		this._path = this._getPath(params.path.content, params.path.page);
		this._template = new Template(params.template, params.path.template);
	}

	render (params) {
		params.page = this;
		return this._template.render(params);
	}

	/**
	 * @todo This may work in undesired manner because of
	 * omitted filename in page.path. Maybe it's better to refactor the method
	 * to start using honest path resolving algorithm.
	 */
	fitsPath (path) {
		return new RegExp('^' + path).test(this.path);
	}

	get title () {
		throw new Error('No title in Page baseclass');
	}

	get path () {
		return this._path;
	}

	get url () {
		return `/${this._path}`;
	}

	_getPath (basePath, pagePath) {
		var base = path.resolve(basePath);
		return path.parse(path.relative(base, pagePath)).dir;
	}
}

module.exports = Page;
