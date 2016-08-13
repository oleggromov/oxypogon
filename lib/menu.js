const CURRENT_REGEXP = function (url) {
	return new RegExp(`^${url}$`);
};

const SECTION_REGEXP = function (url) {
	return new RegExp(`^${url}\\/`);
};

class Menu {
	constructor (links) {
		this._links = links;
	}

	getLinks (pageUrl) {
		var menu = this._links.map(this._mark.bind(this, pageUrl));
		return menu;
	}

	// getTags (pageUrl) {
	// 	return this._tags.map(this._mark.bind(this, pageUrl));
	// }

	_mark (pageUrl, menuItem) {
		var item = Object.assign({}, menuItem);

		var isCurrentRegexp = CURRENT_REGEXP(item.url);
		var isSectionRegexp = SECTION_REGEXP(item.url);

		if (isCurrentRegexp.test(pageUrl)) {
			item.isCurrent = true;
		} else if (isSectionRegexp.test(pageUrl)) {
			item.isSection = true;
		}

		return item;
	}
}

module.exports = Menu;
