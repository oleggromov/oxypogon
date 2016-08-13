const URL_REGEXP = function (url) {
	return new RegExp(`^${url}`);
}

class Page {
	constructor (params) {
		this._url = params.url;
		this._template = params.template;
	}

	render (params, template) {
		return template.render(params);
	}

	fitsUrl (url) {
		return (URL_REGEXP(url)).test(this._url);
	}

	get template () {
		return this._template;
	}

	get url () {
		return this._url;
	}
}

module.exports = Page;
