var Source = require('./Source');

class Page {
	constructor (sourceStr, templateData) {
		this._source = new Source(sourceStr);
		this._tplData = templateData;

		this._tplData.pieces = this._tplData.pieces.map(function (piece) {
			return piece.html;
		});
	}
}

module.exports = Page;
