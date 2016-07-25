var path = require('path');

var Config = require('./Config');
var Article = require('./Article');
var List = require('./List');
var Menu = require('./Menu');
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
		this._menu = new Menu(config.menu);

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

	_getPiecesHash (sources) {
		return sources.reduce((acc, source) => {
			acc[source.name] = source.html;
			return acc;
		}, {});
	}

	_getArticles (sources) {
		return sources.map(source => {
			return new Article(source, this._config, this._tagStore);
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
		return this._config.lists.map(listPath => {
			console.log(`creating list: ${listPath}`);

			var listPages = pages.filter(page => {
				return page.fitsPath(listPath);
			});

			return new List(listPages, this._getListPath(listPath), this._config);
		});
	}

	_getTagLists (tagStore) {
		console.log(`found tags: ${tagStore.getNames().join(', ')}`);

		return tagStore.getArray().map(tag => {
			console.log(`creating list: ${tag.path}`);
			return new List(tag.pages, this._getListPath(tag.path), this._config);
		});
	}

	/* @todo remove this dirty hack */
	_getListPath (listPath) {
		return path.resolve(this._config.getPath('content'), listPath + '/NOTHING')
	}

	_render (renderables) {
		var writer = new Writer(this._config.getPath('build'));

		return Promise.all(renderables.map(renderable => {
			console.log(`writing page: ${renderable.path}`)

			var html = renderable.render({
				pieces: this._pieces,
				extra: this._extra,
				tags: this._tagStore.getList(),
				menu: this._menu.getLinks(renderable.url)
			});

			return writer.write(html, renderable.path);
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
