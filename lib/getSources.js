var getAllFilenames = require('./getAllFilenames');
var readContents = require('./readContents');

function getSources (base, configSources) {
    var sources = {};

    return new Promise(function (resolve, reject) {
        var _resolveSources = _saveContentAndResolve.bind(undefined, resolve);

        getAllFilenames(base, configSources)
            .then(_mapAndRead)
            .then(_resolveSources)
            .catch(function (err) {
                reject(err);
            });
    });
}

function _mapAndRead (files) {
    sources = _getMap(files);

    var pathArr = files.map(_getOnlyPath);
    return readContents(pathArr);
}

function _getMap (files) {
    var map = {};

    files.forEach(function (file) {
        map[file.path] = {
            type: file.type
        };
    });

    return map;
}

function _getOnlyPath (file) {
    return file.path;
}

function _saveContentAndResolve (resolve, contents) {
    contents.forEach(function (file) {
        sources[file.path].contents = file.contents;
    });

    resolve(sources);
}

module.exports = getSources;