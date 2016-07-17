var resolveGlob = require('./resolveGlob');

/**
 * Gets a sources part of config and processes it
 * to extract pages' and pieces' filenames. Returns promise
 * which is fulfilled with an array of filenames with types.
 *
 * @param {Object} sources
 * @return {Promise}
 */
function getAllFilenames (sources) {
    var promises = [];

    var _pushPages = _pushPromises.bind(undefined, promises, sources.base, 'page');
    var _pushPieces = _pushPromises.bind(undefined, promises, sources.base, 'piece');

    sources.pages.forEach(_pushPages);
    sources.pieces.forEach(_pushPieces);

    return new Promise(function (resolve, reject) {
        var _resolveBinded = _resolveFlat.bind(undefined, resolve);
        var _rejectBinded = _reject.bind(undefined, reject);

        Promise.all(promises).then(_resolveBinded).catch(_rejectBinded);
    });
}

function _pushPromises (arr, base, type, list) {
    arr.push(resolveGlob(base, list, type));
}

function _resolveFlat (resolve, arrs) {
    var flat = [].concat.apply([], arrs);
    resolve(flat);
}

function _reject (reject, err) {
    reject(err);
}

module.exports = getAllFilenames;
