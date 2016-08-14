var Article = require('./article');
var List = require('./list');
var Menu = require('./menu');
var Tag = require('./tag');
var TagStore = require('./tag-store');
var Template = require('./template');
var Source = require('./source');

var Reader = require('./reader');
var Writer = require('./writer');
var Watcher = require('./watcher');

class Oxypogon {
	constructor (config) {
		this._config = config.build;
		this._buildConfig = config.buildConfig || {};
		this._extra = config.extra;
		this._tagStore = new TagStore(config.build.tagBaseUrl);
		this._menu = new Menu(config.menu);

		this._reader = new Reader(config.build);
		this._writer = new Writer(config.build.paths);
	}

	build () {
		this._build()
			.then(reportSuccess)
			.catch(Oxypogon.reportError);
	}

	_build (pagesFilter) {
		let extract = this._extract.bind(this);
		let render = this._render.bind(this);
		let write = this._write.bind(this);
		let copy = this._copy.bind(this);
		let reportSuccess = this._reportSuccess.bind(this, new Date);

		return Promise.all([
			// Reading and processing sources.
			this._read(pagesFilter).then(extract).then(render).then(write),
			// Copying everything else.
			this._copy()
		]);
	}

	watch (filename) {
		let pagesFilter = (filenames) => {
			return filenames.filter(current => {
				if (current.indexOf(filename) !== -1) {
					return true;
				}
			});
		};
		let watch = this._watch.bind(this, filename, pagesFilter);
		this._build(pagesFilter).then(watch).catch(Oxypogon.reportError);
	}

	_watch (filename, pagesFilter, builtFiles) {
		let watcher = new Watcher(filename, this._config.paths, builtFiles[0]);
		watcher.on('change', () => {
			let update = watcher.update.bind(watcher);

			this._build(pagesFilter)
				.then(update)
				.catch(Oxypogon.reportError);
		});
	}

	_read (pagesFilter) {
		var getSources = this._getSources.bind(this);
		var getPiecesHash = this._getPiecesHash.bind(this);
		var getArticles = this._getArticles.bind(this);

		return Promise.all([
			this._reader.read('piece').then(getSources).then(getPiecesHash),
			this._reader.read('page', pagesFilter).then(getSources).then(getArticles)
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
			console.log(`rendering page: ${renderable.url}`);

			var template = new Template(renderable.template, this._config.paths.tpl);

			var html = renderable.render({
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

	_write (results) {
		return Promise.all(results.map(htmlPlusUrl => {
			return this._writer.write(htmlPlusUrl.html, htmlPlusUrl.url);
		}));
	}

	_copy () {
		var copy = this._writer.copy.bind(this._writer);

		return this._reader.getFilesToCopy().then(copy).then(copied => {
			copied.map(dest => {
				console.log(`copied file: ${dest}`);
			});
		});
	}

	_reportSuccess (start) {
		let duration = (new Date - start) / 1000;
		console.log(`Site is successfully built in ${duration} ms`);
	}

	static reportError (err) {
		console.warn(err);
	}
}

module.exports = Oxypogon;
