var fs = require('fs');
var path = require('path');
var glob = require('glob');

const ENCODING = 'utf8';
const PIPE_FUNCTION = function (arg) {
	return arg;
};

class Reader {
	constructor (cfg) {
		this._content = cfg.content;
		this._copy = cfg.copy;
		this._paths = cfg.paths;
	}

	/**
	 * Returns a Promise which is resolved with an array of { name, url, content }
	 *
	 * @param {String} type
	 * @param {Function} [filter] A fitler to reduce filenames array.
	 * @return {Promise}
	 */
	read (type, filter) {
		let readAll = this._readAll.bind(this);
		if (typeof filter !== 'function') {
			filter = PIPE_FUNCTION;
		}

		return this._getFilesList(this._content[type])
			.then(filter)
			.then(readAll);
	}

	getFilesToCopy () {
		return this._getFilesList(this._copy);
	}

	_getFilesList (globs) {
		let promises = globs.map(this._resolveGlob, this);

		return new Promise((resolve, reject) => {
			Promise.all(promises).then(pathsArray => {
				pathsArray = [].concat.apply([], pathsArray);
				resolve(pathsArray)
			}).catch(err => {
				reject(new Error(err));
			});
		});
	}

	_resolveGlob (pattern) {
		pattern = path.resolve(this._paths.content, pattern);

		return new Promise((resolve, reject) => {
			glob(pattern, {}, (err, files) => {
				if (err) {
					reject(new Error(err));
				} else {
					resolve(files);
				}
			});
		});
	}

	_readAll (files) {
		var promises = files.map(this._read, this);
		return Promise.all(promises);
	}

	_read (file) {
		return new Promise((resolve, reject) => {
			fs.readFile(file, ENCODING, (err, content) => {
				if (err) {
					reject(new Error(err));
				} else {
					resolve(this._getFileObject(file, content));
				}
			});
		});
	}

	_getFileObject (file, content) {
		return {
			name: this._getName(file),
			url: this._pathToUrl(file, this._paths.content),
			content
		};
	}

	_pathToUrl (file, base) {
		var trimmed = path.parse(path.relative(base, file)).dir;
		return `/${trimmed}`;
	}

	_getName (file) {
		return path.parse(file).name;
	}
}

module.exports = Reader;
