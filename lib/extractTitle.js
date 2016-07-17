module.exports = function (html) {
    var match = html.match(/\<h1\>(.*?)<\/h1>/);
    if (match) {
        return match[1];
    }
};
