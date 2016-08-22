const fs = require('fs');
const path = require('path');
const glob = require('glob');
const copy = require('fs-extra').copy;
const mkdirp = require('mkdirp');
const EventEmitter = require('events');

const ENCODING = 'utf8';

const WRITE_FILENAME = 'index.html';

const COPY_OPTIONS = {
	preserveTimestamps: true
};

class Filesystem {
	constructor (configBuild) {
		this._contentGlobs = configBuild.content;
		this._copyGlobs = configBuild.copy;

		this._paths = {
			content: path.resolve(configBuild.paths.content),
			build: path.resolve(configBuild.paths.build)
		};
	}

	/**
	 * Reads files of specified type and returns
	 * a promise which resolves with an array of
	 * { name, url, content }
	 *
	 * @param {String} type
	 * @param {String} [filterPattern]
	 * @return {Promise}
	 */
	read (type, filterPattern) {
		const readAll = this._readAll.bind(this);
		const typeGlobs = this._contentGlobs[type];
		const filter = this._filterPath.bind(this, filterPattern);

		return this._getFilesList(typeGlobs)
			.then(filter)
			.then(readAll);
	}

	/**
	 * Writes content string to a directory is created
	 * with path from the url.
	 *
	 * @param {String} content
	 * @param {String} url
	 * @return {Promise}
	 */
	write (content, url) {
		const dir = path.resolve(this._paths.build, this._urlToPath(url));
		const writeFile = this._writeFile.bind(this, content);

		return this._createDir(dir).then(writeFile);
	}

	getWatcher (filename) {
		const relativeFilename = path.relative(this._paths.content, filename);
		const source = path.resolve(this._paths.content, relativeFilename);

		let watcher = new EventEmitter;
		fs.watch(source, watcher.emit.bind(watcher));

		return watcher;
	}

	/**
	 * Copies an array of source files resolved
	 * from glob in {config.build.copy} to the build folder.
	 *
	 * @return {Promise}
	 */
	copy () {
		const performCopy = this._performCopy.bind(this);
		return this._getFilesList(this._copyGlobs).then(performCopy);
	}

	_performCopy (files) {
		const copyPromises = files.map(this._copyFile, this);
		return Promise.all(copyPromises);
	}

	_readAll (files) {
		const readPromises = files.map(this._read, this);
		return Promise.all(readPromises);
	}

	_copyFile (src) {
		const relativeDest = path.relative(this._paths.content, src);
		const dest = path.resolve(this._paths.build, relativeDest);

		return new Promise((resolve, reject) => {
			console.log(`copying file: /${relativeDest}`);
			copy(src, dest, COPY_OPTIONS, (err) => {
				if (err) {
					reject(new Error(err));
				} else {
					resolve(relativeDest);
				}
			});
		});
	}

	_read (file) {
		return new Promise((resolve, reject) => {
			fs.readFile(file, ENCODING, (err, content) => {
				if (err) {
					reject(new Error(err));
				} else {
					const fileObject = this._getFileObject(file, content);
					resolve(fileObject);
				}
			});
		});
	}

	_getFileObject (file, content) {
		return {
			name: this._getName(file),
			url: this._pathToUrl(file, this._paths.content),
			content
		};
	}

	_getFilesList (globs) {
		const globPromises = globs.map(this._resolveGlob, this);

		return new Promise((resolve, reject) => {
			Promise.all(globPromises).then(pathsArray => {
				pathsArray = [].concat.apply([], pathsArray);
				resolve(pathsArray)
			}).catch(err => {
				reject(new Error(err));
			});
		});
	}

	_resolveGlob (pattern) {
		pattern = path.resolve(this._paths.content, pattern);

		return new Promise((resolve, reject) => {
			glob(pattern, (err, files) => {
				if (err) {
					reject(new Error(err));
				} else {
					resolve(files);
				}
			});
		});
	}

	_createDir (dir) {
		return new Promise((resolve, reject) => {
			mkdirp(dir, err => {
				if (err) {
					reject(new Error(err));
				} else {
					resolve(dir);
				}
			});
		});
	}

	_writeFile (content, dir) {
		const filename = path.resolve(dir, WRITE_FILENAME);

		return new Promise ((resolve, reject) => {
			fs.writeFile(filename, content, err => {
				if (err) {
					reject(new Error(err));
				} else {
					const file = path.relative('.', filename);
					resolve(filename);
				}
			});
		});
	}

	_pathToUrl (file, base) {
		const trimmed = path.parse(path.relative(base, file)).dir;
		return `/${trimmed}`;
	}

	_urlToPath (url) {
		return url.replace(/^\//, '');
	}

	_getName (file) {
		return path.parse(file).name;
	}

	_filterPath (filterPattern, files) {
		if (filterPattern) {
			return files.filter(filename => {
				return filename.indexOf(filterPattern) > -1;
			});
		}

		return files;
	}
}

module.exports = Filesystem;
