class Page {
	constructor (params) {
		this._url = params.url;
		this._template = params.template;
	}

	render (params, template) {
		return template.render(params);
	}

	/**
	 * @todo This may work in undesired manner because of
	 * omitted filename in page.path. Maybe it's better to refactor the method
	 * to start using honest path resolving algorithm.
	 */
	// fitsPath (path) {
	// 	return new RegExp('^' + path).test(this.path);
	// }

	// get path () {
	// 	return this._path;
	// }

	get template () {
		return this._template;
	}

	get url () {
		return this._url;
	}
}

module.exports = Page;
