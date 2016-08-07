var mkdirp = require('mkdirp');
var path = require('path');
var fs = require('fs');
var copy = require('fs-extra').copy;

const FILENAME = 'index.html';
const COPY_OPTIONS = {
	preserveTimestamps: true
};

class Writer {
	constructor (cfg) {
		this._build = path.resolve(cfg.build);
		this._content = path.resolve(cfg.content);
	}

	write (content, url) {
		var filename = this._urlToPath(url);

		var dir = path.resolve(this._build, filename);
		var writeFile = this._writeFile.bind(this, content);

		return this._createDir(dir).then(writeFile);
	}

	copy (filesPromise) {
		return new Promise((resolve, reject) => {
			filesPromise
				.then(files => {
					Promise.all(files.map(src => {
						var dest = path.resolve(this._build, path.relative(this._content, src));

						return new Promise((resolve, reject) => {
							copy(src, dest, COPY_OPTIONS, (err) => {
								if (err) {
									reject(new Error(err));
								} else {
									resolve(dest);
								}
							});
						});
					}, this))
					.then(dests => {
						console.log(`copied ${dests}`);
						resolve(dests);
					})
					.catch(err => {
						reject(new Error(err));
					});
				})
				.catch(err => {
					reject(new Error(err));
				});
		});
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
