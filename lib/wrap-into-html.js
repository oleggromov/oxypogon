module.exports = function (params) {
	return `<!doctype html>
		<html>
		<head>
			<meta charset="utf-8">
			<title>${params.title}</title>
			${params.head}
		</head>
		<body>
			${params.body}
			${params.scripts}
		</body>
		</html>
	`;
}


// const path = require('path');
// const moment = require('moment');
// const OxypogonRenderer = require('../oxypogon-renderer');

// class Template {
// 	constructor (component, path) {
// 		this._component = component;
// 	}

// 	render (data) {
// 		// data, moment

// 		// const renderOptions = Object.assign({}, this._options, {
// 		// 	data,
// 		// 	util: { moment }
// 		// });

// 		return `<!doctype html>
// 			<html>
// 			<head>
// 				<meta charset="utf-8">
// 				<title>${title}</title>
// 				${head}
// 			</head>
// 			<body>
// 				${body}
// 				${scripts}
// 			</body>
// 			</html>
// 		`;
// };


// 	}
// }

// module.exports = Template;
