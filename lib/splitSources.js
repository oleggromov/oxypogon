var path = require('path');

function splitSources (sources) {
    var parts = {
        pages: [],
        pieces: {}
    };

    var source;
    var tmp;
    var piece;
    for (var key in sources) {
        source = sources[key];
        tmp = source;
        tmp.path = key;

        if (source.type === 'page') {
            parts.pages.push(tmp);
        } else if (source.type === 'piece') {
            piece = _getPiece(tmp);
            parts.pieces[piece.name] = piece.html;
        }
    }

    return parts;
}

function _getPiece (piece) {
    var name = path.parse(piece.path).name;

    return {
        name: name,
        html: piece.rendered.html
    };
}

module.exports = splitSources;
