var md = require('markdown-it')();
var metamd = require('metamd');

function transformMarkdown (str) {
    var data = {};

    var parsed = metamd(str);

    data.meta = parsed.data;
    data.html = md.render(parsed.markdown);

    return data;
}

module.exports = transformMarkdown;
