var path = require('path');

var Config = require('./Config');
var Article = require('./Article');
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

		var extract = this._extract.bind(this);
		var render = this._render.bind(this);

		this._read()
			.then(extract)
			.then(render)
			.then(Colibri.reportSuccess)
			.catch(Colibri.reportError);
	}

	_read () {
		var getContent = reader.getContent.bind(reader);
		var getPiecesHash = this._getPiecesHash.bind(this);
		var getArticles = this._getArticles.bind(this);

		return Promise.all([
			this._config.getSources('piece').then(getContent).then(getPiecesHash),
			this._config.getSources('page').then(getContent).then(getArticles)
		]);
	}

	_extract (arr) {
		var pages = arr[1];
		var renderables = [pages];

		this._pieces = arr[0];

		renderables.push(this._getLists(pages));
		renderables.push(this._getTagLists(this._tagStore));

		return [].concat.apply([], renderables);
	}

	_getLists (pages) {
		console.log(`generating lists: ${this._config.lists.join(', ')}`);

		return this._config.lists.map(function (listPath) {
			var listPath = path.resolve(this._config.getPath('content'), listPath + '/NOTHING');
			var listPages = pages.filter(function (page) {
				return page.fitsPath(listPath);
			});

			return new List(pages, this._config.getPath('tpl'), this._config.getPath('content'), listPath);
		}, this);
	}

	_getTagLists (tagStore) {
		console.log(`extracted tags: ${tagStore.getNames().join(', ')}`);

		return tagStore.getArray().map(function (tag) {
			var tagPath = path.resolve(this._config.getPath('content'), tag.path + '/NOTHING');
			return new List(tag.pages, this._config.getPath('tpl'), this._config.getPath('content'), tagPath);
		}, this);
	}

	_render (renderables) {
		var writer = new Writer(this._config.getPath('build'));

		return Promise.all(renderables.map(function (renderable) {
			console.log(`writing ${renderable.path}`)

			var html = renderable.render({
				pieces: this._pieces,
				extra: this._extra,
				tags: this._tagStore.getList()
			});

			writer.write(html, renderable.path);
		}, this));
	}

	_getPiecesHash (sources) {
		return sources.reduce(function (acc, source) {
			acc[source.name] = source.html;
			return acc;
		}, {});
	}

	_getArticles (sources) {
		return sources.map(function (source) {
			return new Article(source, this._config, this._tagStore);
		}, this);
	}

	static reportSuccess () {
		console.log('Site is successfully built');
	}

	static reportError (err) {
		console.warn(err);
	}
}

module.exports = Colibri;
