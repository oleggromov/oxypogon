var resolveGlob = require('./resolveGlob');

/**
 * Gets a sources part of config and processes it
 * to extract pages' and pieces' filenames. Returns promise
 * which is fulfilled with an array of filenames with types.
 *
 * @param {Object} sources
 * @return {Promise}
 */
function getAllFilenames (base, sources) {
    var _getPages = _getPromises.bind(undefined, base, 'page');
    var _getPieces = _getPromises.bind(undefined, base, 'piece');

    var promises = sources.pages
        .map(_getPages)
        .concat(sources.pieces.map(_getPieces));

    return new Promise(function (resolve, reject) {
        var _resolveBinded = _resolveFlat.bind(undefined, resolve);
        var _rejectBinded = _reject.bind(undefined, reject);

        Promise.all(promises).then(_resolveBinded).catch(_rejectBinded);
    });
}

function _getPromises (base, type, list) {
    return resolveGlob(base, list, type);
}

function _resolveFlat (resolve, arrs) {
    var flat = [].concat.apply([], arrs);
    resolve(flat);
}

function _reject (reject, err) {
    reject(err);
}

module.exports = getAllFilenames;
