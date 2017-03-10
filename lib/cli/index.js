const argv = require('yargs').argv;
const Oxypogon = require('../oxypogon');

const COMMANDS = {
	build: {
		method: 'build'
	}
};
const CONFIG_NAME = '.oxypogon.conf.js';

function getArguments (argsArray) {
	if (argsArray) {
		return argsArray.map(arg => {
			return argv[arg] || null;
		});
	}
}

module.exports = function () {
	const cmd = argv['_'].length ? argv['_'][0] : null;

	if (cmd && COMMANDS[cmd]) {
		let command = COMMANDS[cmd];
		let config = require(`${process.cwd()}/${CONFIG_NAME}`);
		let oxypogon = new Oxypogon(config);
		let methodArgs = getArguments(command.args);
		oxypogon[command.method].apply(oxypogon, methodArgs);
	} else {
		console.error(`invalid command ${cmd}`);
	}
};
