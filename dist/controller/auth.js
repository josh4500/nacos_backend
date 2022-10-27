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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchUser = exports.updatePassword = exports.verifySafePhrase = exports.updateStudentData = exports.signIn = exports.signUp = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const student_1 = __importDefault(require("../model/student"));
const EmailValidator = require('email-deep-validator');
const emailValidator = new EmailValidator();
const secretKey = 'computersciencestudent(2017)federaluniversitylokoja';
const saltRounds = parseInt(process.env.SALT_ROUNDS);
const signUp = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const student = req.body;
    if (!student.email || !student.password) {
        return res.status(400).send({
            success: false,
            error: "Email and password are required"
        });
    }
    if (!emailValidator.verify(student.email)) {
        return res.status(400).send({
            success: false,
            error: "Email is not valid"
        });
    }
    if (student.password.length < 8) {
        return res.status(400).send({
            success: false,
            error: "Password must be at least 8 characters long"
        });
    }
    if (!student.firstname || !student.lastname) {
        return res.status(400).send({
            success: false,
            error: "Fullname is required"
        });
    }
    const newStudentEmail = yield emailValidator.verify(req.body.email);
    if (newStudentEmail.validDomain === false) {
        return res.status(400).json({ "success": false, "error": 'Invalid Email Address' });
    }
    const existEmail = yield student_1.default.findOne({ $or: [{ email: student.email }, { matric_number: student.matric_number }] });
    if (existEmail) {
        res.status(400).json({ "success": false, "error": 'Student already exist.' });
        return;
    }
    else {
        try {
            const hashedPassword = yield bcrypt_1.default.hash(student.password, saltRounds);
            student.password = hashedPassword;
            const newStudent = new student_1.default(student);
            const savedStudent = yield newStudent.save();
            const _a = savedStudent.toObject(), { password, safe_answer } = _a, studentData = __rest(_a, ["password", "safe_answer"]);
            res.status(201).json({ "success": true, "data": studentData, "error": null });
        }
        catch (err) {
            res.status(500).json({ "success": false, "message": err });
        }
    }
});
exports.signUp = signUp;
const signIn = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { emailOrMatric, password } = req.body;
        if (emailOrMatric && password) {
            const regStudent = yield student_1.default.findOne({ $or: [{ email: emailOrMatric }, { matric_number: emailOrMatric }] });
            if (regStudent) {
                const _b = regStudent._doc, { password, safe_answer } = _b, studentData = __rest(_b, ["password", "safe_answer"]);
                const validPassword = yield bcrypt_1.default.compare(req.body.password, password);
                if (!validPassword)
                    return res.status(400).json({
                        "success": false,
                        "error": 'Invalid Email Address or Password'
                    });
                const token = jsonwebtoken_1.default.sign({ _id: studentData._id.toString(), email: regStudent.email }, secretKey, { expiresIn: '72000000 seconds' });
                res.cookie('jwt', token);
                res.status(200).json({
                    "success": true,
                    "data": studentData,
                    "token": token,
                    "message": "Login Successful",
                    "error": null
                });
            }
            else {
                res.status(400).json({
                    "success": false,
                    "error": 'Invalid Email Address or Password\n'
                });
            }
        }
        else {
            res.status(400).json({
                "success": false,
                "error": 'Invalid Email Address or Password\n'
            });
        }
    }
    catch (err) {
        res.status(500).json({ "success": false, "error": err });
    }
});
exports.signIn = signIn;
const updateStudentData = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { student } = res.locals;
        if (student) {
            const _c = req.body, { _id, id, email, password } = _c, studentData = __rest(_c, ["_id", "id", "email", "password"]);
            const { safe_answer } = studentData;
            if (safe_answer) {
                const hashedSafeAnswer = yield bcrypt_1.default.hash(safe_answer, saltRounds);
                studentData.safe_answer = hashedSafeAnswer;
            }
            const regStudent = yield student_1.default.findOneAndUpdate({ email: student.email }, Object.assign({}, studentData), { new: true });
            if (regStudent) {
                res.status(200).json({
                    "success": true,
                    "message": "Student data updated Successful",
                    "error": null
                });
            }
            else {
                res.status(400).json({
                    "success": false,
                    "error": 'Student does not exist'
                });
            }
        }
        else {
            res.status(400).json({
                "success": false,
                "error": 'Student does not exist'
            });
        }
    }
    catch (err) {
        res.status(500).json({ "success": false, "error": err });
    }
});
exports.updateStudentData = updateStudentData;
const verifySafePhrase = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    try {
        const { email, safe_phrase, safe_answer } = req.body;
        if (!email || !safe_phrase || !safe_answer) {
            return res.status(400).json({
                "success": false,
                "error": 'Invalid argument'
            });
        }
        const regStudent = yield student_1.default.findOne({ email: email });
        if (regStudent) {
            const _e = regStudent.toObject(), { password, safe_answer } = _e, studentData = __rest(_e, ["password", "safe_answer"]);
            const validAnswer = yield bcrypt_1.default.compare(safe_answer, (_d = regStudent.safe_answer) !== null && _d !== void 0 ? _d : '');
            if (!validAnswer || safe_phrase != regStudent.safe_phrase)
                return res.status(400).json({
                    "success": false,
                    "error": 'Incorrect answer. Try again.'
                });
            const token = jsonwebtoken_1.default.sign({ _id: regStudent._id.toString(), email: regStudent.email }, secretKey, { expiresIn: '72000000 seconds' });
            return res.status(200).json({
                "success": true,
                "data": studentData,
                "token": token,
                "error": null,
            });
        }
        else {
            res.status(400).json({
                "success": false,
                "error": 'Student does not exist'
            });
        }
    }
    catch (err) {
        res.status(500).json({ "success": false, "error": err });
    }
});
exports.verifySafePhrase = verifySafePhrase;
const updatePassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { student } = res.locals;
        const { password, confirm_password } = req.body;
        if (password != confirm_password) {
            return res.status(400).json({
                "success": false,
                "error": 'Password do not match.'
            });
        }
        if (password.length >= 8) {
            return res.status(400).json({
                "success": false,
                "error": 'Password should be 8 or more characters.'
            });
        }
        if (student) {
            const hashedPassword = yield bcrypt_1.default.hash(password, saltRounds);
            const regStudent = yield student_1.default.findOneAndUpdate({ id: student.email }, { password: hashedPassword });
            if (regStudent) {
                res.status(200).json({
                    "success": true,
                    "message": "Student password successful.",
                    "error": null
                });
            }
            else {
                res.status(400).json({
                    "success": false,
                    "error": 'Student does not exist.'
                });
            }
        }
        else {
            res.status(400).json({
                "success": false,
                "error": 'Student does not exist.'
            });
        }
    }
    catch (err) {
        res.status(500).json({ "success": false, "error": err });
    }
});
exports.updatePassword = updatePassword;
const fetchUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (id) {
            const regStudent = yield student_1.default.findOne({ id: id });
            if (regStudent) {
                const _f = regStudent._doc, { password, safe_answer } = _f, studentData = __rest(_f, ["password", "safe_answer"]);
                res.status(200).json({
                    "success": true,
                    "data": studentData,
                    "error": null
                });
            }
            else {
                res.status(400).json({
                    "success": false,
                    "error": 'Student does not exist.'
                });
            }
        }
        else {
            res.status(400).json({
                "success": false,
                "error": 'Student does not exist.'
            });
        }
    }
    catch (err) {
        res.status(500).json({ "success": false, "error": err });
    }
});
exports.fetchUser = fetchUser;
