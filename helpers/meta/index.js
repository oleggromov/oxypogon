module.exports = {
	extract: extractMeta,
	strip: stripMeta
};

var metaRegexp = /^<!---\s+((.+\n+)+)-->/;

function extractMeta(htmlString) {
	var match = htmlString.match(metaRegexp);

	return match ? JSON.parse(match[1]) : {};
}

function stripMeta(htmlString) {
	return htmlString.replace(metaRegexp, '');
}
