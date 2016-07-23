var Config = require('./Config');
var Page = require('./Page');

var Reader = require('./Reader');
var reader = new Reader;

var Writer = require('./Writer');

class Colibri {
	constructor (config) {
		this._config = new Config(config.build);
		this._extra = config.extra;

		var savePieces = this._savePieces.bind(this);
		var writePages = this._writePages.bind(this);

		this._readAll()
			.then(savePieces)
			.then(writePages)
			.then(Colibri.reportSuccess)
			.catch(Colibri.reportError);
	}

	_savePieces (arr) {
		this._pieces = arr[0];
		return arr[1];
	}

	_writePages (pages) {
		var writer = new Writer(this._config.getPath('build'));

		return Promise.all(pages.map(function (page) {
			var rendered = page.render(this._pieces, this._extra);
			return writer.write(page.path, rendered);
		}, this));
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

Colibri.reportSuccess = function (files) {
	console.log(`Successfully written ${files.length} files`);
}

Colibri.reportError = function (err) {
	console.warn(err);
};

module.exports = Colibri;
