var Page = require('./Page');

const TPL_NAME = 'list';

class List extends Page {
	constructor (pages, listPath, config) {
		super({
			path: {
				page: listPath,
				content: config.getPath('content'),
				template: config.getPath('tpl')
			},
			template: TPL_NAME
		})

		this._pages = this._sortPages(pages.concat());
	}

	render (params) {
		params.pages = this._pages;
		return super.render(params);
	}

	_sortPages (pages) {
		return pages.sort((a, b) => {
			return Number(new Date(b.date)) - Number(new Date(a.date));
		});
	}
}

module.exports = List;
