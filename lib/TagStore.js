var Tag = require('./Tag');

class TagStore {
	constructor (urlBase) {
		this._urlBase = urlBase;
		this._tags = {};
	}

	add (name, page) {
		if (!this._tags[name]) {
			this._tags[name] = new Tag(name, this._urlBase);
		}

		this._tags[name].add(page);

		return this._tags[name];
	}

	getList () {
		return Object.assign({}, this._tags);
	}
}

module.exports = TagStore;
