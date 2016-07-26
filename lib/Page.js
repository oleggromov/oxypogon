class Page {
	constructor (params) {
		this._url = params.url;
		this._template = params.template;
	}

	render (params, template) {
		return template.render(params);
	}

	fitsUrl (url) {
		return (new RegExp(`^${url}`)).test(this._url);
	}

	get template () {
		return this._template;
	}

	get url () {
		return this._url;
	}
}

module.exports = Page;
