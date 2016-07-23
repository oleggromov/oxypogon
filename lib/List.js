var Template = require('./Template');

class List {
	constructor (pages, tplName, tplPath) {
		this._pages = pages.concat().sort(function (a, b) {
			return Number(new Date(b.date)) - Number(new Date(a.date));
		});
		this._template = new Template(tplName, tplPath);
	}

	render (pieces, extra, tags) {
		return this._template.render({
			pages: this._pages,
			pieces,
			tags,
			extra
		});
	}
}

module.exports = List;
