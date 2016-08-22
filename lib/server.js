const express = require('express');
const serveStatic = express.static;
const http = require('http');
const socket = require('socket.io');

class Server {
	constructor () {
		this._app = express();
		this._server = http.Server(this._app);
		this._socket = socket(this._server);
	}

	update (html) {
		console.log(html);
	}
}

module.exports = Server;
