const SPACE_REPLACER = function (str) {
	return str.replace(/\s+/g, '-');
};

class Tag {
	constructor (name, base) {
		this._pages = [];
		this._name = name;
		this._url = `${base}/${SPACE_REPLACER(name)}`;
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

	get pages () {
		return this._pages.concat();
	}
}

module.exports = Tag;
