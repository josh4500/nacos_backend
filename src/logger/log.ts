import * as fs from 'fs';
import * as path from 'path';

class Log {
	public baseDir: string;
	public fileName: string;
	public linePrefix: string;

	public today: Date = new Date();

	constructor() {
		let _dateString = `${this.today.getFullYear()}-${(this.today.getMonth() + 1)}-${this.today.getDate()}`;
		let _timeString = `${this.today.getHours()}:${this.today.getMinutes()}:${this.today.getSeconds()}`;

		this.baseDir = path.join(__dirname, '../../.logs/');

		this.fileName = `${_dateString}.log`;
		this.linePrefix = `[${_dateString} ${_timeString}]`;
	}


	public info(_string: string): void {
		this.addLog('INFO', _string);
	}


	public warn(_string: string): void {
		this.addLog('WARN', _string);
	}


	public error(_string: string): void {

		console.log('\x1b[31m%s\x1b[0m', '[ERROR] :: ' + _string.split(/r?\n/)[0]);

		this.addLog('ERROR', _string);
	}


	public custom(_filename: string, _string: string): void {
		this.addLog(_filename, _string);
	}


	private addLog(_kind: string, _string: string): void {
		const _that = this;
		_kind = _kind.toUpperCase();

		if (!fs.existsSync(_that.baseDir)) {
			fs.mkdirSync(_that.baseDir);
			console.log('\x1b[32m%s\x1b[0m', 'Log folder created');
		}

		fs.open(`${_that.baseDir}${_that.fileName}`, 'a', (_err, _fileDescriptor) => {
			if (!_err && _fileDescriptor) {

				fs.appendFile(_fileDescriptor, `${_that.linePrefix} [${_kind}] ${_string}\n`, (_err) => {
					if (!_err) {
						fs.close(_fileDescriptor, (_err) => {
							if (!_err) {
								return true;
							} else {
								return console.log('\x1b[31m%s\x1b[0m', 'Error closing log file that was being appended');
							}
						});
					} else {
						return console.log('\x1b[31m%s\x1b[0m', 'Error appending to the log file');
					}
				});
			} else {
				return console.log('\x1b[31m%s\x1b[0m', 'Error couldn\'t open the log file for appending');
			}
		});
	}

	public clean(): void {
		const _that = this;
		let _daysToKeep = process.env.LOG_DAYS_TO_KEEP;

		if (!_daysToKeep) {
			_daysToKeep = '7';
		}

		fs.readdir(_that.baseDir, (_err, _files) => {
			if (!_err && _files && _files.length) {
				_files.forEach((_file) => {
					const _filePath = path.join(_that.baseDir, _file);
					const _fileDate = new Date(fs.statSync(_filePath).ctime);
					const _now = new Date();









				});
			}
		});

	}
}

export default new Log;