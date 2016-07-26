var Tag = require('./Tag');

class TagStore {
	constructor (base) {
		this._base = base;
		this._tags = {};
	}

	add (name, page) {
		if (!this._tags[name]) {
			this._tags[name] = new Tag(name, this._base);
		}

		this._tags[name].add(page);

		return this._tags[name];
	}

	getList () {
		return Object.assign({}, this._tags);
	}

	getNames () {
		return Object.keys(this._tags);
	}

	getArray () {
		return this.getNames().map(name => {
			return this._tags[name];
		});
	}
}

module.exports = TagStore;
