var glob = require('glob');
var path = require('path');

/**
 * Resolves glob pattern into an array of filenames
 * using base and the pattern itself. Returns promise.
 * Resolves promise with an array of objects looking
 * like { type: '', file: '' }
 *
 * @param  {String} base
 * @param  {String} pattern
 * @param  {String} type
 * @return {Promise}
 */
function resolveGlob (base, pattern, type) {
    pattern = path.resolve(base, pattern);

    return new Promise(function (resolve, reject) {
        glob(pattern, {}, function (err, files) {
            if (err) {
                reject(err);
            } else {
                resolve(files.map(_typify.bind(undefined, type)));
            }
        });
    });
}

function _typify (type, name) {
    return {
        type: type,
        file: name
    };
}

module.exports = resolveGlob;
