var Article = require('./article');
var List = require('./list');
var Menu = require('./menu');
var Tag = require('./tag');
var TagStore = require('./tag-store');
var Template = require('./template');
var Source = require('./source');
var Filesystem = require('./filesystem');

class Oxypogon {
	constructor (config) {
		this._config = config.build;
		this._buildConfig = config.buildConfig || {};
		this._extra = config.extra;
		this._tagStore = new TagStore(config.build.tagBaseUrl);
		this._menu = new Menu(config.menu);

		this._filesystem = new Filesystem(config.build);
	}

	/**
	 * Builds all sources from the config and reports success or error.
	 *
	 * @param {String} [filename] Optional filename to filter pages list.
	 */
	build (filename) {
		const extract = this._extract.bind(this);
		const render = this._render.bind(this);
		const reportSuccess = Oxypogon.reportSuccess.bind(undefined, new Date);

		Promise.all([
			// Reading and processing sources.
			this._read(filename).then(extract).then(render),
			// Copying everything else.
			this._filesystem.copy()
		])
		.then(reportSuccess)
		.catch(Oxypogon.reportError);
	}

	_read (filename) {
		const getSources = this._getSources.bind(this);
		const getPiecesHash = this._getPiecesHash.bind(this);
		const getArticles = this._getArticles.bind(this);

		return Promise.all([
			this._filesystem.read('piece').then(getSources).then(getPiecesHash),
			this._filesystem.read('page', filename).then(getSources).then(getArticles)
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

			return this._filesystem.write(html, renderable.url);
		}));
	}

	static reportSuccess (start) {
		const duration = (new Date - start) / 1000;
		console.log(`Site is successfully built in ${duration} ms`);
	}

	static reportError (err) {
		console.warn(err);
	}
}

module.exports = Oxypogon;
