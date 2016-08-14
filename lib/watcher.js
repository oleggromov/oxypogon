const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

const CLIENT_SCRIPT = fs.readFileSync(`${__dirname}/watcher-client-script.html`);
const ENCODING = 'utf8';

class Watcher extends EventEmitter {
	constructor (filename, config, builtFiles) {
		super();

		this._build = path.resolve(config.build);
		this._content = path.resolve(config.content);
		this._filename = path.resolve(process.cwd(), filename);
		console.log(`watching for changes: ${filename}`);

		this._url = path.relative(this._content, filename).replace('index.md', '');
		this._builtFilename = builtFiles.find(name => {
			if (name.indexOf(this._url) !== -1) {
				return true;
			}
		});

		this._createServer();
		fs.watch(this._filename, this.emit.bind(this));
	}

	update () {
		let send = this._send.bind(this);

		return this._readFile().then(send);
	}

	_send (content) {
		this._io.emit('update', content);
		console.log(`sent ${content.length} bytes to client`);
		return content;
	}

	_createServer () {
		const express = require('express')();
		const st = require('express').static;
		const http = require('http').Server(express);
		this._io = require('socket.io')(http);

		express.use('/static', st('./static'));

		this._readFile().then(content => {
			content = this._appendScript(content);

			express.get(`/${this._url}`, (req, res) => {
				res.send(content);
			});

			http.listen(3000, () => {
				console.log(`listening: localhost:3000/${this._url}`);
			});
		});
	}

	_readFile () {
		return new Promise((resolve, reject) => {
			fs.readFile(this._builtFilename, ENCODING, (err, content) => {
				if (err) {
					reject(new Error(err));
				} else {
					resolve(content);
				}
			});
		});
	}

	_appendScript (content) {
		content = content.replace(/<\/body>/, `\n${CLIENT_SCRIPT}\n</body>`);
		return content;
	}
}

module.exports = Watcher;
