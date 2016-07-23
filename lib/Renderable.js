var Template = require('./Template');

class Renderable {
	constructor (tplName, tplPath) {
		this._template = new Template(tplName, tplPath);
	}

	render (params) {
		return this._template.render(params);
	}
}

module.exports = Renderable;
