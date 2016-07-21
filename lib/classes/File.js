var parse = require('path').parse;

class File {
	constructor (path, content) {
		this._path = path;
		this._content = content;
		this._parsed = parse(path);
	}

	get path () {
		return this._path;
	}

	get content () {
		return this._content;
	}

	get name () {
		return this._parsed.name;
	}
}

module.exports = File;
