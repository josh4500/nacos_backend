"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = exports.studentAvailable = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const student_1 = __importDefault(require("../model/student"));
function studentAvailable(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let student;
        try {
            student = yield student_1.default.findOne({ email: req.body.email });
            if (!student) {
                return res.status(400).json({
                    success: false,
                    error: 'Student does not exist',
                });
            }
            res.locals.student = student;
        }
        catch (err) {
            res.status(500).json({ "success": false, "error": "Something went wrong.\n Try again" });
        }
        next();
    });
}
exports.studentAvailable = studentAvailable;
function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (authHeader == null)
        return res.status(403).json({ "success": false, "message": "Unauthorized access" });
    const token = authHeader.split(' ')[1];
    if (token == null)
        return res.status(401).json({ "success": false, "message": "Unauthorized access" });
    jsonwebtoken_1.default.verify(token, process.env.TOKEN_SECRET, {}, (err, studentData) => __awaiter(this, void 0, void 0, function* () {
        if (err)
            return res.status(403).json({ "success": false, "error": "Unauthorized access" });
        const student = yield student_1.default.findOne({ _id: studentData._id });
        if (!student)
            return res.status(403).json({ "success": false, "error": "Unauthorized access" });
        res.locals.student = student;
        next();
    }));
}
exports.authenticate = authenticate;
;
