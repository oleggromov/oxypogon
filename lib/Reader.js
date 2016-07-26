var fs = require('fs');
var path = require('path');
var glob = require('glob');
var Source = require('./Source');

const ENCODING = 'utf8';

class Reader {
	constructor (cfg) {
		this._content = cfg.content;
		this._paths = cfg.paths;
		this._promises = {};
	}

	/**
	 * Returns a Promise which is resolved with a list of sources of given type.
	 *
	 * @param {String} type
	 * @return {Promise}
	 */
	getSources (type) {
		if (!this._promises[type]) {
			let readAll = this._readAll.bind(this);
			this._promises[type] = this._getFilesList(type).then(readAll);
		}

		return this._promises[type];
	}

	_getFilesList (type) {
		var promises = this._content[type].map(this._resolveGlob, this);

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
					let url = this._pathToUrl(file, this._paths.content);
					let name = this._getName(file);
					let source = new Source(name, url, content);
					resolve(source);
				}
			});
		});
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
