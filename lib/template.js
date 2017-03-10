const path = require('path');
const jade = require('jade');
const moment = require('moment');

const JADE_OPTIONS = {
	pretty: true
};

class Template {
	constructor (name, base) {
		this._filename = path.resolve(base, `${name}.jade`);

		this._options = Object.assign({}, JADE_OPTIONS, {
			basedir: path.resolve(base)
		});
	}

	render (data) {
		const renderOptions = Object.assign({}, this._options, {
			data,
			util: { moment }
		});

		return jade.renderFile(this._filename, renderOptions);
	}
}

module.exports = Template;
