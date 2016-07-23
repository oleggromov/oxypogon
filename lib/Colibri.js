var Config = require('./Config');
var Page = require('./Page');

var Reader = require('./Reader');
var reader = new Reader;

var Writer = require('./Writer');

class Colibri {
	constructor (config) {
		this._config = new Config(config.build);
		this._extra = config.extra;

		var processSources = this._processSources.bind(this);
		var writePages = this._writePages.bind(this);
		var writeLists = this._writeLists.bind(this);

		this._readAll()
			.then(processSources)
			.then(writeLists)
			.then(writePages)
			.then(Colibri.reportSuccess)
			.catch(Colibri.reportError);
	}

	_processSources (arr) {
		this._pieces = arr[0];
		this._tags = this._extractTags(arr[1]);

		return arr[1];
	}

	_writeLists (pages) {
		var lists = this._config.lists.reduce(function (acc, list) {
			var fittingPages = pages.filter(function (page) {
				return page.fitsPath(list);
			});

			if (fittingPages) {
				if (!acc[list]) {
					acc[list] = [];
				}

				acc[list] = acc[list].concat(fittingPages);
			}

			return acc;
		}, {});

		console.log(this._tags)
		console.log(lists);

		return pages;
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
		return sources.reduce(function (acc, source) {
			acc[source.name] = source.html;
			return acc;
		}, {});
	}

	_getPages (sources) {
		return sources.map(function (source) {
			return new Page(source, this._config);
		}, this);
	}

	_extractTags (pages) {
		var tags = pages.reduce(function (acc, page) {
			var pageTags = page.getTags();

			if (pageTags) {
				pageTags.forEach(function (tag) {
					if (!acc[tag]) {
						acc[tag] = [];
					}

					acc[tag].push(page);
				});
			}

			return acc;
		}, {});

		console.log(`extracted tags: ${Object.keys(tags)}`);

		return tags;
	}
}

Colibri.reportSuccess = function (files) {
	console.log(`Successfully written ${files.length} files`);
}

Colibri.reportError = function (err) {
	console.warn(err);
};

module.exports = Colibri;
