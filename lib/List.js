var Renderable = require('./Renderable');

class List {
	constructor (pages, tplName, tplPath) {
		this._pages = pages.concat().sort(function (a, b) {
			return Number(new Date(b.date)) - Number(new Date(a.date));
		});

		this._renderable = new Renderable(tplName, tplPath);
	}

	render (params) {
		params.pages = this._pages;
		return this._renderable.render(params);
	}
}

module.exports = List;
