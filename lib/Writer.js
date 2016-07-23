var mkdirp = require('mkdirp');
var path = require('path');
var fs = require('fs');

const FILENAME = 'index.html';

class Writer {
	constructor (basePath) {
		this._base = path.resolve(basePath);
	}

	write (file, content) {
		var dir = path.resolve(this._base, file);

		var writeFile = this._writeFile.bind(this, content);

		return this._createDir(dir)
			.then(writeFile);
	}

	_createDir (dir) {
		return new Promise (function (resolve, reject) {
			mkdirp(dir, function (err) {
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

		return new Promise (function (resolve, reject) {
			fs.writeFile(filename, content, function (err) {
				if (err) {
					reject(new Error(err));
				} else {
					let file = path.relative('.', filename);
					console.log(`written ${file}`);
					resolve(filename);
				}
			});
		});
	}
}

module.exports = Writer;
