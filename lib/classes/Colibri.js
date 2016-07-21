var Config = require('./Config');
var Reader = require('./Reader');
var reader = new Reader;

class Colibri {
    constructor (config) {
        this._config = new Config(require(config).build);

        // this._config.getSources('page')
        //     .then(reader.getContent.bind(reader))
        //     .then(function (sources) {
        //         console.log('pages:\n', sources);
        //     })
        //     .catch(this._reportError);

        this._config.getSources('piece')
        	.then(reader.getContent.bind(reader))
        	.then(function (sources) {
	            console.log('pieces:\n', sources);
	        }).catch(this._reportError);
    }

    _reportError (err) {
        console.warn(err);
    }
}

module.exports = Colibri;