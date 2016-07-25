var path = require('path');

const SPACE_REPLACER = function (str) {
	return str.replace(/\s+/g, '-');
};

class Tag {
	constructor (name, baseUrl) {
		this._pages = [];
		this._name = name;
		this._path = path.join(baseUrl, SPACE_REPLACER(this._name));
	}

	add (page) {
		if (!this._pages.includes(page)) {
			this._pages.push(page);
		}
	}

	get name () {
		return this._name;
	}

	get count () {
		return this._pages.length;
	}

	get url () {
		return `/${this._path}`;
	}

	get path () {
		return this._path;
	}

	get pages () {
		return this._pages.concat();
	}
}

module.exports = Tag;
