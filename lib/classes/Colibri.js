var Config = require('./Config');
var Reader = require('./Reader');
var Page = require('./Page');
var reader = new Reader;

class Colibri {
	constructor (config) {
		this._config = new Config(require(config).build);

		var init = this._init.bind(this);

		this._readAll().then(init).catch(Colibri.reportError);
	}

	_init (arr) {
		this._pieces = arr[0];
		this._pages = arr[1];

		// console.log(this._pieces);
		// console.log(this._pages);
	}

	_readAll () {
		var getContent = reader.getContent.bind(reader);
		var getPiecesHash = this._getPiecesHash.bind(this);
		var getPages = this._getPages.bind(this);

		return Promise.all([
			this._config.getSources('piece').then(getContent).then(getPiecesHash),
			this._config.getSources('page').then(getContent).then(getPages)
		]);
	}

	_getPiecesHash (sources) {
		return sources.reduce(function (accumulator, current) {
			accumulator[current.name] = current.html;
			return accumulator;
		}, {});
	}

	_getPages (sources) {
		return sources.map(function (source) {
			return new Page(source, this._config);
		}, this);
	}
}

Colibri.reportError = function (err) {
	console.warn(err);
};

module.exports = Colibri;
