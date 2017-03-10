const Page = require('./page');

const TPL_NAME = 'list';

class List extends Page {
	constructor (pages, url) {
		super({
			url: url,
			template: TPL_NAME
		});

		this._pages = this._sortPages(pages.concat());
	}

	render (params, template) {
		params.pages = this._pages;
		return super.render(params, template);
	}

	_sortPages (pages) {
		return pages.sort((a, b) => {
			return Number(new Date(b.date)) - Number(new Date(a.date));
		});
	}
}

module.exports = List;
