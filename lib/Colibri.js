var path = require('path');

var Config = require('./Config');
var Article = require('./Article');
var List = require('./List');
var Menu = require('./Menu');
var Tag = require('./Tag');
var TagStore = require('./TagStore');
var Template = require('./Template');

var Reader = require('./Reader');
var Writer = require('./Writer');

class Colibri {
	constructor (config) {
		this._config = new Config(config.build);
		this._extra = config.extra;
		this._tagStore = new TagStore(config.build.tagBaseUrl);
		this._menu = new Menu(config.menu);

		var extract = this._extract.bind(this);
		var render = this._render.bind(this);

		this._reader = new Reader(config.build);
		this._writer = new Writer(this._config.getPath('build'));

		this._read()
			.then(extract)
			.then(render)
			.then(Colibri.reportSuccess)
		.catch(Colibri.reportError);
	}

	_read () {
		var getPiecesHash = this._getPiecesHash.bind(this);
		var getArticles = this._getArticles.bind(this);

		return Promise.all([
			this._reader.getSources('piece').then(getPiecesHash),
			this._reader.getSources('page').then(getArticles)
		]);
	}

	_getPiecesHash (sources) {
		return sources.reduce((acc, source) => {
			acc[source.name] = source.html;
			return acc;
		}, {});
	}

	_getArticles (sources) {
		return sources.map(source => {
			return new Article(source, this._tagStore);
		});
	}

	_extract (arr) {
		var pages = arr[1];
		var renderables = [pages];
		renderables.push(this._getLists(pages));
		renderables.push(this._getTagLists(this._tagStore));
		renderables = [].concat.apply([], renderables);

		this._pieces = arr[0];

		return renderables;
	}

	_getLists (pages) {
		return this._config.lists.map(listUrl => {
			console.log(`creating list: ${listUrl}`);

			var listPages = pages.filter(page => {
				return page.fitsUrl(listUrl);
			});

			return new List(listPages, listUrl);
		});
	}

	_getTagLists (tagStore) {
		console.log(`found tags: ${tagStore.getNames().join(', ')}`);

		return tagStore.getArray().map(tag => {
			console.log(`creating list: ${tag.url}`);
			return new List(tag.pages, tag.url);
		});
	}

	_render (renderables) {
		return Promise.all(renderables.map(renderable => {
			console.log(`writing page: ${renderable.url}`);

			var template = new Template(renderable.template, this._config.getPath('tpl'));

			var html = renderable.render({
				pieces: this._pieces,
				extra: this._extra,
				tags: this._tagStore.getList(),
				menu: this._menu.getLinks(renderable.url)
			}, template);

			return this._writer.write(html, renderable.url);
		}));
	}

	static reportSuccess () {
		console.log('Site is successfully built');
	}

	static reportError (err) {
		console.warn(err);
	}
}

module.exports = Colibri;
