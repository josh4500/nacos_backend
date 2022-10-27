"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class Log {
    constructor() {
        this.today = new Date();
        let _dateString = `${this.today.getFullYear()}-${(this.today.getMonth() + 1)}-${this.today.getDate()}`;
        let _timeString = `${this.today.getHours()}:${this.today.getMinutes()}:${this.today.getSeconds()}`;
        this.baseDir = path.join(__dirname, '../../.logs/');
        this.fileName = `${_dateString}.log`;
        this.linePrefix = `[${_dateString} ${_timeString}]`;
    }
    info(_string) {
        this.addLog('INFO', _string);
    }
    warn(_string) {
        this.addLog('WARN', _string);
    }
    error(_string) {
        console.log('\x1b[31m%s\x1b[0m', '[ERROR] :: ' + _string.split(/r?\n/)[0]);
        this.addLog('ERROR', _string);
    }
    custom(_filename, _string) {
        this.addLog(_filename, _string);
    }
    addLog(_kind, _string) {
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
                            }
                            else {
                                return console.log('\x1b[31m%s\x1b[0m', 'Error closing log file that was being appended');
                            }
                        });
                    }
                    else {
                        return console.log('\x1b[31m%s\x1b[0m', 'Error appending to the log file');
                    }
                });
            }
            else {
                return console.log('\x1b[31m%s\x1b[0m', 'Error couldn\'t open the log file for appending');
            }
        });
    }
    clean() {
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
exports.default = new Log;
