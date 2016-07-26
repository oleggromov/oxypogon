var fs = require('fs');
var path = require('path');
var glob = require('glob');
var Source = require('./Source');

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

		return new Promise(function (resolve, reject) {
			Promise.all(promises).then(function (pathsArray) {
				pathsArray = [].concat.apply([], pathsArray);
				resolve(pathsArray)
			}).catch(function (err) {
				reject(new Error(err));
			});
		});
	}

	_resolveGlob (pattern) {
		pattern = path.resolve(this._paths.content, pattern);

		return new Promise(function (resolve, reject) {
			glob(pattern, {}, function (err, files) {
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
		return new Promise(function (resolve, reject) {
			fs.readFile(file, 'utf8', function (err, content) {
				if (err) {
					reject(new Error(err));
				} else {
					resolve(new Source(file, content));
				}
			});
		});
	}
}

module.exports = Reader;
