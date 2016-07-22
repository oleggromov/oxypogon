var fs = require('fs');
var Source = require('./Source');

class Reader {
    /**
     * Reads content of each file in array and returns
     * a promise that is resolved with an array of Sources.
     *
     * @param {Array} paths
     * @return {Promise}
     */
    getContent (files) {
        var promises = files.map(this._read, this);
        return Promise.all(promises);
    }

    _read (file) {
    	return new Promise(function (resolve, reject) {
	        fs.readFile(file, 'utf8', function (err, content) {
	            if (err) {
	                reject(new Error(err));
	            } else {
	                resolve(new Source(file, content));
	            }
	        });
	    });
    }
}

module.exports = Reader;
