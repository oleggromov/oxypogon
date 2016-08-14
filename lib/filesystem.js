const fs = require('fs');
const path = require('path');
const glob = require('glob');
const copy = require('fs-extra').copy;
const mkdirp = require('mkdirp');

const ENCODING = 'utf8';

const COPY_OPTIONS = {
	preserveTimestamps: true
};

class Filesystem {
	constructor (configBuild) {
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
	 * @return {Promise}
	 */
	read (type) {

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

	}

	/**
	 * Copies an array of source files resolved
	 * from glob in {config.build.copy} to the build folder.
	 *
	 * @return {Promise}
	 */
	copy () {
		let performCopy = this._performCopy.bind(this);
		return this._getFilesList(this._copyGlobs).then(performCopy);
	}

	_performCopy (files) {
		let copyFile = this._copyFile.bind(this);
		return Promise.all(files.map(copyFile));
	}

	_copyFile (src) {
		let relativeDest = path.relative(this._paths.content, src);
		let dest = path.resolve(this._paths.build, relativeDest);

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




	_getFilesList (globs) {
		let promises = globs.map(this._resolveGlob, this);

		return new Promise((resolve, reject) => {
			Promise.all(promises).then(pathsArray => {
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
}

module.exports = Filesystem;
