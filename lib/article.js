const Page = require('./page');
const Source = require('./source');
const Tag = require('./tag');

class Article extends Page {
	constructor (source, tagStore) {
		super({
			url: source.url,
			template: source.getMeta('template')
		});

		this._source = source;
		this._tags = this._getTags(tagStore);
	}

	render (params, template) {
		params.page = this;
		return super.render(params, template);
	}

	get title () {
		return this._source.title;
	}

	get date () {
		return this._source.getMeta('date');
	}

	get written () {
		return this._source.getMeta('written');
	}

	get more () {
		return this._source.getMeta('more');
	}

	get html () {
		return this._source.html
	}

	get preview () {
		return this._source.preview;
	}

	get tags () {
		return this._tags;
	}

	/**
	 * A common interface to get a piece of meta information from a source.
	 *
	 * @throws {Error} if key value is empty
	 * @param {String} name Key name
	 * @return {?}
	 */
	getMeta (name) {
		const value = this._source.getMeta(name);
		if (!value) {
			throw new Error(`no value for ${name} in the article source`);
		}

		return value;
	}

	_getTags (tagStore) {
		const tags = this._source.getMeta('tags');
		if (tags) {
			return tags.map(tag => {
				return tagStore.add(tag, this);
			});
		} else {
			return null;
		}
	}
}

module.exports = Article;
