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
const nacos_member_1 = __importDefault(require("../model/nacos_member"));
const validatation_schema_1 = require("../helpers/validatation_schema");
const http_errors_1 = __importDefault(require("http-errors"));
const student_1 = __importDefault(require("../model/student"));
const secretKey = 'computersciencenacosMember(2017)federaluniversitylokoja';
const saltRounds = parseInt(process.env.SALT_ROUNDS);
const signUp = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // const { email, matric_number, password } = req.body;
    try {
        const result = validatation_schema_1.SignupValidationSchema.validate(req.body);
        const student = yield student_1.default.findOne({ matric_number: result.value.matric_number });
        if (!student) {
            throw new http_errors_1.default.Conflict(`Student with ${result.value.matric_number} does not exist.`);
        }
        const existEmail = yield nacos_member_1.default.findOne({ $or: [{ email: result.value.email }, { matric_number: result.value.matric_number }] });
        if (existEmail) {
            throw new http_errors_1.default.Conflict(`${result.value.matric_number} already exist.`);
        }
        // const hash = jwt.sign(result.value, secretKey, { expiresIn: '72000000 seconds' });
        //Send to mail
        const hashedPassword = yield bcrypt_1.default.hash(result.value.password, saltRounds);
        const _a = student._doc, { _id } = _a, studentData = __rest(_a, ["_id"]);
        const newNacosMember = new nacos_member_1.default(Object.assign(Object.assign({}, studentData), { "password": hashedPassword }));
        yield newNacosMember.save();
        const _b = newNacosMember.toObject(), { password, safe_answer } = _b, nacosMemberData = __rest(_b, ["password", "safe_answer"]);
        res.status(201).json({ "success": true, "data": nacosMemberData, "error": null });
    }
    catch (error) {
        return res.status(400).send({
            success: false,
            error
        });
    }
});
exports.signUp = signUp;
// export const verifySignup = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//     } catch (error) {
//     }
// };
const signIn = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = validatation_schema_1.SigninValidationSchema.validate(req.body);
        const { matric_number, password } = req.body;
        if (matric_number && password) {
            const regStudent = yield nacos_member_1.default.findOne({ "matric_number": result.value.matric_number });
            if (regStudent) {
                const _c = regStudent._doc, { password, safe_answer } = _c, nacosMemberData = __rest(_c, ["password", "safe_answer"]);
                const validPassword = yield bcrypt_1.default.compare(result.value.password, regStudent.password);
                if (!validPassword)
                    return res.status(400).json({
                        "success": false,
                        "error": 'Invalid Email Address or Password'
                    });
                const token = jsonwebtoken_1.default.sign({ _id: nacosMemberData._id.toString(), email: regStudent.email }, secretKey, { expiresIn: '72000000 seconds' });
                res.cookie('jwt', token);
                return res.status(200).json({
                    "success": true,
                    "data": nacosMemberData,
                    "token": token,
                    "message": "Login Successful",
                    "error": null
                });
            }
        }
        return res.status(400).json({
            "success": false,
            "error": 'Invalid Email Address or Password\n'
        });
    }
    catch (err) {
        res.status(500).json({ "success": false, "error": err });
    }
});
exports.signIn = signIn;
const updateStudentData = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { nacosMember } = res.locals;
        if (nacosMember) {
            const _d = req.body, { _id, id, email, password, firstname, lastname, middlename, matric_number } = _d, nacosMemberData = __rest(_d, ["_id", "id", "email", "password", "firstname", "lastname", "middlename", "matric_number"]);
            const { safe_answer } = nacosMemberData;
            if (safe_answer) {
                const hashedSafeAnswer = yield bcrypt_1.default.hash(safe_answer, saltRounds);
                nacosMemberData.safe_answer = hashedSafeAnswer;
            }
            const regStudent = yield nacos_member_1.default.findOneAndUpdate({ email: nacosMember.email }, Object.assign({}, nacosMemberData), { new: true });
            if (regStudent) {
                res.status(200).json({
                    "success": true,
                    "message": "Member data updated Successful",
                    "error": null
                });
            }
            else {
                res.status(400).json({
                    "success": false,
                    "error": 'Member does not exist'
                });
            }
        }
        else {
            res.status(400).json({
                "success": false,
                "error": 'Member does not exist'
            });
        }
    }
    catch (err) {
        res.status(500).json({ "success": false, "error": err });
    }
});
exports.updateStudentData = updateStudentData;
const verifySafePhrase = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _e;
    try {
        const { email, safe_phrase, safe_answer } = req.body;
        if (!email || !safe_phrase || !safe_answer) {
            return res.status(400).json({
                "success": false,
                "error": 'Invalid argument'
            });
        }
        const regStudent = yield nacos_member_1.default.findOne({ email: email });
        if (regStudent) {
            const _f = regStudent.toObject(), { password, safe_answer } = _f, nacosMemberData = __rest(_f, ["password", "safe_answer"]);
            const validAnswer = yield bcrypt_1.default.compare(safe_answer, (_e = regStudent.safe_answer) !== null && _e !== void 0 ? _e : '');
            if (!validAnswer || safe_phrase != regStudent.safe_phrase)
                return res.status(400).json({
                    "success": false,
                    "error": 'Incorrect answer. Try again.'
                });
            const token = jsonwebtoken_1.default.sign({ _id: regStudent._id.toString(), email: regStudent.email }, secretKey, { expiresIn: '72000000 seconds' });
            return res.status(200).json({
                "success": true,
                "data": nacosMemberData,
                "token": token,
                "error": null,
            });
        }
        else {
            res.status(400).json({
                "success": false,
                "error": 'Member does not exist'
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
        const { nacosMember } = res.locals;
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
        if (nacosMember) {
            const hashedPassword = yield bcrypt_1.default.hash(password, saltRounds);
            const regStudent = yield nacos_member_1.default.findOneAndUpdate({ id: nacosMember.email }, { password: hashedPassword });
            if (regStudent) {
                res.status(200).json({
                    "success": true,
                    "message": "Member password successful.",
                    "error": null
                });
            }
            else {
                res.status(400).json({
                    "success": false,
                    "error": 'Member does not exist.'
                });
            }
        }
        else {
            res.status(400).json({
                "success": false,
                "error": 'Member does not exist.'
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
            const regStudent = yield nacos_member_1.default.findOne({ id: id });
            if (regStudent) {
                const _g = regStudent._doc, { password, safe_answer } = _g, nacosMemberData = __rest(_g, ["password", "safe_answer"]);
                res.status(200).json({
                    "success": true,
                    "data": nacosMemberData,
                    "error": null
                });
            }
            else {
                res.status(400).json({
                    "success": false,
                    "error": 'Member does not exist.'
                });
            }
        }
        else {
            res.status(400).json({
                "success": false,
                "error": 'Member does not exist.'
            });
        }
    }
    catch (err) {
        res.status(500).json({ "success": false, "error": err });
    }
});
exports.fetchUser = fetchUser;
