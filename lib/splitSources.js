function splitSources (sources) {
    var parts = {
        pages: [],
        pieces: []
    };

    var source;
    var tmp;
    for (var key in sources) {
        source = sources[key];
        tmp = source;
        tmp.path = key;

        if (source.type === 'page') {
            parts.pages.push(tmp);
        } else if (source.type === 'piece') {
            parts.pieces.push(tmp);
        }
    }

    return parts;
}

module.exports = splitSources;
