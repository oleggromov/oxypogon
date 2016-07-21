var Source = require('./Source');

class Piece extends Source {
	constructor (file) {
		super(file.content);
		this._name = file.name;
	}

	get name () {
		return this._name;
	}
}

module.exports = Piece;
