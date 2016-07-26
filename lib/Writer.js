var mkdirp = require('mkdirp');
var path = require('path');
var fs = require('fs');

const FILENAME = 'index.html';

class Writer {
	constructor (basePath) {
		this._base = path.resolve(basePath);
	}

	write (content, url) {
		var filename = this._urlToPath(url);

		var dir = path.resolve(this._base, filename);
		var writeFile = this._writeFile.bind(this, content);

		return this._createDir(dir).then(writeFile);
	}

	_createDir (dir) {
		return new Promise((resolve, reject) => {
			mkdirp(dir, err => {
				if (err) {
					reject(new Error(err));
				} else {
					resolve(dir);
				}
			});
		});
	}

	_writeFile (content, dir) {
		var filename = path.resolve(dir, FILENAME);

		return new Promise ((resolve, reject) => {
			fs.writeFile(filename, content, err => {
				if (err) {
					reject(new Error(err));
				} else {
					let file = path.relative('.', filename);
					resolve(filename);
				}
			});
		});
	}

	_urlToPath (url) {
		return url.replace(/^\//, '');
	}
}

module.exports = Writer;
