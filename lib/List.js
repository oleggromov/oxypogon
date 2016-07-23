var Template = require('./Template');

class List {
	constructor (tplName, tplPath) {
		this._template = new Template(tplName, tplPath);
	}

	render (pages, pieces, extra, tags) {
		pages.sort(function (a, b) {
			return Number(new Date(b.date)) - Number(new Date(a.date));
		});

		return this._template.render({
			pages,
			pieces,
			tags,
			extra
		});
	}
}

module.exports = List;
