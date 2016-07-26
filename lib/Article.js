var Page = require('./Page');
var Source = require('./Source');
var Tag = require('./Tag');

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

	_getTags (tagStore) {
		var tags = this._source.getMeta('tags');
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
