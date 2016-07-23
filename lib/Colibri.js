var Config = require('./Config');
var Page = require('./Page');
var List = require('./List');
var Tag = require('./Tag');
var TagStore = require('./TagStore');

var Reader = require('./Reader');
var reader = new Reader;

var Writer = require('./Writer');

class Colibri {
	constructor (config) {
		this._config = new Config(config.build);
		this._extra = config.extra;
		this._tagStore = new TagStore(this._config.tagBase);

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
		this._tags = this._tagStore.getList();

		console.log(`extracted tags: ${Object.keys(this._tags).join(', ')}`);

		return arr[1];
	}

	_write (pages) {
		var lists = this._getLists(pages);

		return Promise.all([
			Object.keys(lists).map(function (listName) {
				var list = lists[listName];
				var listObj = new List(list, 'list', this._config.getPath('tpl'));
				return this._renderAndWrite(listObj, listName);
			}, this),

			Object.keys(this._tags).map(function (tagName) {
				var tag = this._tags[tagName];
				var listObj = new List(tag.pages, 'list', this._config.getPath('tpl'));
				return this._renderAndWrite(listObj, tag.path + '/');
			}, this),

			pages.map(function (page) {
				return this._renderAndWrite(page, page.path);
			}, this)
		]);
	}

	_renderAndWrite (renderable, path) {
		var writer = new Writer(this._config.getPath('build'));
		var rendered = renderable.render({
			pieces: this._pieces,
			extra: this._extra,
			tags: this._tags
		});
		return writer.write(path, rendered);
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
			return new Page(source, this._config, this._tagStore);
		}, this);
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
