var resolve = require('path').resolve;
var glob = require('glob');

const SOURCE_TYPES = ['page', 'piece'];

class Config {
	constructor (cfg) {
		this._sources = cfg.sources;
		this._paths = cfg.paths;
		this._lists = cfg.lists;
		this._tagBase = cfg.tagBase;

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
		if (!SOURCE_TYPES.includes(type)) {
			throw new Error(`${type} is not in the list!`);
		}

		if (!this._promises[type]) {
			this._promises[type] = this._getGlobList(type);
		}

		return this._promises[type];
	}

	get lists () {
		return this._lists;
	}

	get tagBase () {
		return this._tagBase;
	}

	_getGlobList (type) {
		var promises = this._sources[type].map(this._getGlob, this);

		return new Promise(function (resolve, reject) {
			Promise.all(promises).then(function (pathsArray) {
				resolve([].concat.apply([], pathsArray))
			}).catch(function (err) {
				reject(err);
			});
		});
	}

	_getGlob (string) {
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

module.exports = Config;
