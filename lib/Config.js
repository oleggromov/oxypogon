var path = require('path');

class Config {
	constructor (cfg) {
		this._paths = cfg.paths;
		this._lists = cfg.lists;

		this._promises = {};
	}

	getPath (type) {
		return path.resolve(this._paths[type]);
	}

	get lists () {
		return this._lists;
	}
}

module.exports = Config;
