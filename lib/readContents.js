var fs = require('fs');
var path = require('path');

/**
 * Reads contents of each file in array and returns
 * a promise that is resolved with an array of objects
 * like { path: '', contents: '' }
 *
 * @param {Array} paths
 * @return {Promise}
 */
function readContents (paths) {
    var promises = paths.map(_promiseRead);

    return Promise.all(promises);
}

function _promiseRead (path) {
    return new Promise(function (resolve, reject) {
        fs.readFile(path, 'utf8', function (err, contents) {
            if (err) {
                reject(err);
            } else {
                resolve({
                    path: path,
                    contents: contents
                });
            }
        });
    });
}

module.exports = readContents;
