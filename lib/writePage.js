var mkdirp = require('mkdirp');
var path = require('path');
var fs = require('fs');

var config;

module.exports = function (cfg) {
    config = cfg;
    return writePage;
};


function writePage (page) {
    var source = path.parse(page.path);
    var _writeBinded = _writeFile.bind(undefined, page, source);

    return _createPageDir(source)
        .then(_writeBinded);
}

function _createPageDir (source) {
    var pp = path.relative(config.source, source.dir);
    var buildPath = path.resolve(config.dest, pp);

    return new Promise(function (resolve, reject) {
        mkdirp(buildPath, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(buildPath);
            }
        });
    });
}

function _writeFile (page, source, buildPath) {
    var filename = path.resolve(buildPath, source.name + '.html');

    return new Promise(function (resolve, reject) {
        fs.writeFile(filename, page.rendered.fullPage, function (err) {
            if (err) {
                reject(err);
            } else {
                var size = page.rendered.fullPage.length;
                resolve(filename, size);
            }
        });
    });
}
