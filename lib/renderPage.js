var path = require('path');
var jade = require('jade');
var moment = require('moment');

module.exports = function (base) {
    var JADE_OPTIONS = {
        pretty: true,
        basedir: path.resolve(base)
    };

    return function render (params) {
        var tpl = path.resolve(base, params.tpl + '.jade');

        var options = Object.assign(JADE_OPTIONS, {
            content: params.content,
            meta: params.meta,
            common: params.common,
            pieces: params.pieces,
            moment: moment
        });

        return jade.renderFile(tpl, options);
    }
};
