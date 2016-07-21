var fs = require('fs');

class Reader {
	constructor () {}

    /**
     * Reads content of each file in array and returns
     * a promise that is resolved with an array of objects
     * like { file: '', content: '' }
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
	                resolve({ file, content });
	            }
	        });
	    });
    }
}

module.exports = Reader;
