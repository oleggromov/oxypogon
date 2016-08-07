var Article = require('./Article');
var List = require('./List');
var Menu = require('./Menu');
var Tag = require('./Tag');
var TagStore = require('./TagStore');
var Template = require('./Template');
var Source = require('./Source');

var Reader = require('./Reader');
var Writer = require('./Writer');

class Oxypogon {
	constructor (config) {
		this._config = config.build;
		this._buildConfig = config.buildConfig || {};
		this._extra = config.extra;
		this._tagStore = new TagStore(config.build.tagBaseUrl);
		this._menu = new Menu(config.menu);

		this._reader = new Reader(config.build);
		this._writer = new Writer(config.build.paths.build);

		var extract = this._extract.bind(this);
		var render = this._render.bind(this);
		var copy = this._copy.bind(this);

		Promise.all([
			// Reading and processing sources.
			this._read().then(extract).then(render),
			// Copying everything else.
			this._copy()
		])
		.then(Oxypogon.reportSuccess)
		.catch(Oxypogon.reportError);
	}

	_read () {
		var getSources = this._getSources.bind(this);
		var getPiecesHash = this._getPiecesHash.bind(this);
		var getArticles = this._getArticles.bind(this);

		return Promise.all([
			this._reader.read('piece').then(getSources).then(getPiecesHash),
			this._reader.read('page').then(getSources).then(getArticles)
		]);
	}

	_getSources (arr) {
		return arr.map(item => {
			return new Source(item.name, item.url, item.content, {
				previewSize: this._buildConfig.previewSize
			});
		});
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
		var tags = tagStore.getArray();

		if (tags.length) {
			console.log(`found tags: ${tagStore.getNames().join(', ')}`);

			return tags.map(tag => {
				console.log(`creating list: ${tag.url}`);
				return new List(tag.pages, tag.url);
			});
		} else {
			return [];
		}
	}

	_render (renderables) {
		return Promise.all(renderables.map(renderable => {
			console.log(`writing page: ${renderable.url}`);

			var template = new Template(renderable.template, this._config.paths.tpl);

			var html = renderable.render({
				pieces: this._pieces,
				extra: this._extra,
				tags: this._tagStore.getList(),
				menu: this._menu.getLinks(renderable.url)
			}, template);

			return this._writer.write(html, renderable.url);
		}));
	}

	_copy () {
		return this._writer.copy(this._reader.getFilesToCopy());
	}

	static reportSuccess () {
		console.log('Site is successfully built');
	}

	static reportError (err) {
		console.warn(err);
	}
}

module.exports = Oxypogon;
