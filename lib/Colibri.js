var Config = require('./Config');
var Page = require('./Page');
var List = require('./List');
var Tag = require('./Tag');

var Reader = require('./Reader');
var reader = new Reader;

var Writer = require('./Writer');

class Colibri {
	constructor (config) {
		this._config = new Config(config.build);
		this._extra = config.extra;

		var processSources = this._processSources.bind(this);
		var write = this._write.bind(this);

		this._readAll()
			.then(processSources)
			.then(write)
			.then(Colibri.reportSuccess)
			.catch(Colibri.reportError);
	}

	_processSources (arr) {
		this._pieces = arr[0];
		this._tags = this._extractTags(arr[1]);

		return arr[1];
	}

	_write (pages) {
		return Promise.all([
			this._writeLists(pages),
			this._writePages(pages)
		]);
	}

	_writeLists (pages) {
		var writer = new Writer(this._config.getPath('build'));
		var lists = this._getLists(pages);

		return Promise.all([Object.keys(lists).map(function (listName) {
			var list = lists[listName];
			var listObj = new List('list', this._config.getPath('tpl'));
			var rendered = listObj.render(list, this._pieces, this._extra, this._tags);
			return writer.write(listName, rendered);
		}, this)]);
	}

	_writePages (pages) {
		var writer = new Writer(this._config.getPath('build'));

		return Promise.all(pages.map(function (page) {
			var rendered = page.render(this._pieces, this._extra, this._tags);
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
		var tagBase = this._config.tagBase;

		var tags = pages.reduce(function (acc, page) {
			var pageTags = page.getTags();

			if (pageTags) {
				pageTags.forEach(function (tag) {
					if (!acc[tag]) {
						acc[tag] = new Tag(tag, tagBase);
					}

					acc[tag].add(page);
				});
			}

			return acc;
		}, {});

		console.log(`extracted tags: ${Object.keys(tags)}`);

		return tags;
	}

	_getLists (pages) {
		return this._config.lists.reduce(function (acc, list) {
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
		}, {})
	}
}

Colibri.reportSuccess = function () {
	console.log('Site is successfully built');
}

Colibri.reportError = function (err) {
	console.warn(err);
};

module.exports = Colibri;
