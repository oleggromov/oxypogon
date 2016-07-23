var path = require('path');

const SPACE_REPLACER = function (str) {
	return str.replace(/\s+/g, '-');
};

class Tag {
	constructor (name, url) {
		this._pages = [];
		this._name = name;
		this._url = path.join('/', url, SPACE_REPLACER(this._name));
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
		return this._url;
	}
}

module.exports = Tag;
