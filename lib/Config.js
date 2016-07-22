var resolve = require('path').resolve;
var glob = require('glob');

class Config {
	constructor (confObj) {
		this._sources = confObj.sources;
		this._paths = confObj.paths;

		this._promises = {};
	}

	getPath (type) {
		return resolve(this._paths[type]);
	}

	/**
	 * Returns a Promise which is resolved with a list of sources of given type.
	 *
	 * @param {String} type
	 * @return {Promise}
	 */
	getSources (type) {
		if (!Config.SOURCE_TYPES.includes(type)) {
			throw new Error(type + ' is not in list!');
		}

		if (!this._promises[type]) {
			this._promises[type] = this._getPromise(type);
		}

		return this._promises[type];
	}

	_getPromise (type) {
		var promises = this._sources[type].map(this._getGlobPromise, this);

		return new Promise(function (resolve, reject) {
			Promise.all(promises).then(function (pathsArray) {
				resolve([].concat.apply([], pathsArray))
			}).catch(function (err) {
				reject(err);
			});
		});
	}

	_getGlobPromise (string) {
		var pattern = resolve(this.getPath('content'), string);

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
}

Config.SOURCE_TYPES = ['page', 'piece'];

module.exports = Config;
