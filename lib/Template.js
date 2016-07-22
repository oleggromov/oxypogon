var path = require('path');
var jade = require('jade');
var moment = require('moment');

const JADE_OPTIONS = {
	pretty: true
};

class Template {
	constructor (name, tplPath) {
		this._name = name;
		this._path = path.resolve(tplPath, name + '.jade');

		this._options = Object.assign({}, JADE_OPTIONS, {
			basedir: path.resolve(tplPath)
		});
	}

	render (data) {
		var renderOptions = Object.assign({}, this._options, {
			data,
			util: { moment }
		});

		return jade.renderFile(this._path, renderOptions);
	}
}

module.exports = Template;
