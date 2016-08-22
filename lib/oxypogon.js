const Article = require('./article');
const List = require('./list');
const Menu = require('./menu');
const Tag = require('./tag');
const TagStore = require('./tag-store');
const Template = require('./template');
const Source = require('./source');
const Filesystem = require('./filesystem');
const Server = require('./server');

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
	 */
	build () {
		const reportSuccess = Oxypogon.reportSuccess.bind(undefined, new Date);

		this._build()
			.then(reportSuccess)
			.catch(Oxypogon.reportError);
	}

	/**
	 * Builds specified source file and starts watching.
	 *
	 * @param {String} filename
	 */
	watch (filename) {
		if (filename) {
			let startWatching = this._startWatching.bind(this, filename);

			this._build(filename)
				.then(startWatching)
				.catch(Oxypogon.reportError);
		} else {
			Oxypogon.reportError(`Mandatory filename is missing`);
		}
	}

	_startWatching (filename) {
		console.log(`watching for changes: ${filename}`);
		const watcher = this._filesystem.getWatcher(filename);

		console.log('started server on');
		const server = new Server;
		const update = server.update.bind(server);

		watcher.on('change', () => {
			const extract = this._extract.bind(this);
			const render = this._render.bind(this);

			this._read(filename)
				.then(extract)
				.then(render)
				.then(arr => {

					return arr.map(item => {
						return item.url;
					});
				})
				.then(update)
				.catch(Oxypogon.reportError);
		});
	}

	_build (filename) {
		const extract = this._extract.bind(this);
		const render = this._render.bind(this);
		const write = this._write.bind(this);

		return Promise.all([
			// Reading and processing sources.
			this._read(filename)
				.then(extract)
				.then(render)
				.then(write),
			// Copying everything else.
			this._filesystem.copy()
		]);
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
		let pages = arr[1];
		let renderables = [pages];
		renderables.push(this._getLists(pages));
		renderables.push(this._getTagLists(this._tagStore));
		renderables = [].concat.apply([], renderables);

		this._pieces = arr[0];

		return renderables;
	}

	_getLists (pages) {
		return this._config.lists.map(listUrl => {
			console.log(`creating list: ${listUrl}`);

			let listPages = pages.filter(page => {
				return page.fitsUrl(listUrl);
			});

			return new List(listPages, listUrl);
		});
	}

	_getTagLists (tagStore) {
		let tags = tagStore.getArray();

		if (tags.length) {
			console.log(`found tags: ${tagStore.getNames().join(', ')}`);
		}

		return tags.map(tag => {
			console.log(`creating list: ${tag.url}`);
			return new List(tag.pages, tag.url);
		});
	}

	_render (renderables) {
		return Promise.all(renderables.map(renderable => {
			console.log(`rendering page: ${renderable.url}`);
			const template = new Template(renderable.template, this._config.paths.tpl);

			const html = renderable.render({
				pieces: this._pieces,
				extra: this._extra,
				tags: this._tagStore.getList(),
				menu: this._menu.getLinks(renderable.url)
			}, template);

			return {
				html,
				url: renderable.url
			};
		}));
	}

	_write (contentArr) {
		return Promise.all(contentArr.map(content => {
			console.log(`writing page: ${content.url}`);
			return this._filesystem.write(content.html, content.url);
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
