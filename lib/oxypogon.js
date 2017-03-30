const Article = require('./article');
const List = require('./list');
const Menu = require('./menu');
const Tag = require('./tag');
const TagStore = require('./tag-store');
const Source = require('./source');
const Filesystem = require('./filesystem');
const OxypogonRenderer = require('../../oxypogon-renderer');
const wrapIntoHtml = require('./wrap-into-html');

class Oxypogon {
	constructor (config) {
		this._config = config.build;
		this._buildConfig = config.buildConfig || {};
		this._extra = config.extra;
		this._tagStore = new TagStore(config.build.tagBaseUrl);
		this._menu = new Menu(this._getAllCategories());

		this._filesystem = new Filesystem(config.build);
	}

	build () {
		const extract = this._extract.bind(this);
		const render = this._render.bind(this);
		const reportSuccess = Oxypogon.reportSuccess.bind(undefined, new Date);

		Promise.all([
			// Reading and processing sources.
			this._read().then(extract).then(render),
			// Copying everything else.
			this._filesystem.copy()
		])
		.then(reportSuccess)
		.catch(Oxypogon.reportError);
	}

	_read () {
		const getSources = this._getSources.bind(this);
		const getPiecesHash = this._getPiecesHash.bind(this);
		const getArticles = this._getArticles.bind(this);

		return Promise.all([
			this._filesystem.read('piece').then(getSources).then(getPiecesHash),
			this._filesystem.read('page').then(getSources).then(getArticles)
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
			let article = new Article(source, this._tagStore);
			article.category = this._getCategory(article);
			return article;
		});
	}

	_extract (arr) {
		const pages = arr[1];
		let renderables = [pages];
		renderables.push(this._getLists(pages));
		renderables.push(this._getTagLists(this._tagStore));
		renderables = [].concat.apply([], renderables);

		this._pieces = arr[0];

		return renderables;
	}

	_getLists (pages) {
		return this._config.lists.map(list => {
			console.log(`creating list: ${list.url}`);

			const listPages = pages.filter(page => {
				return page.fitsUrl(list.url);
			});

			return new List(listPages, list.url);
		});
	}

	/**
	 * Returns an exact category of the article
	 * by getting an article and testing it against
	 * all the lists from the config.
	 *
	 * @private
	 * @param {Page|Article} article
	 * @return {Object}
	 */
	_getCategory (article) {
		return this._getAllCategories().filter(list => {
			return article.fitsUrl(list.url);
		})[0];
	}

	/**
	 * Returns all lists that are major categories
	 * and should be displayed in menu or used for
	 * article classification.
	 *
	 * @return {Object[]} [description]
	 */
	_getAllCategories () {
		return this._config.lists.filter(list => list.isCategory);
	}

	_getTagLists (tagStore) {
		const tags = tagStore.getArray();

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
		const renderer = new OxypogonRenderer({
			basepath: this._config.paths.components
		});

		return Promise.all(renderables.map(renderable => {
			console.log(`writing page: ${renderable.url}`);

			const html = renderer.render(renderable.template, {
				pieces: this._pieces,
				extra: this._extra,
				tags: this._tagStore.getList(),
				menu: this._menu.getLinks(renderable.url)
			});

			const pageHtml = wrapIntoHtml({
				title: '?',
				body: html
			});

			return this._filesystem.write(pageHtml, renderable.url);
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
