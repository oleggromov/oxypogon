var Template = require('./Template');

class List {
	constructor (tplName, tplPath) {
		this._template = new Template(tplName, tplPath);
	}

	render (pages, pieces, extra, tags) {
		return this._template.render({
			pages,
			pieces,
			tags,
			extra
		});
	}
}

module.exports = List;
