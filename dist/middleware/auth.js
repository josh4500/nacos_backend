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
exports.authenticate = exports.isNacosMemberAvailable = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const nacos_member_1 = __importDefault(require("../model/nacos_member"));
const secretKey = 'computersciencenacosMember(2017)federaluniversitylokoja';
function isNacosMemberAvailable(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let nacosMember;
        try {
            nacosMember = yield nacos_member_1.default.findOne({ email: req.body.email });
            if (!nacosMember) {
                return res.status(400).json({
                    success: false,
                    error: 'NacosMember does not exist',
                });
            }
            res.locals.nacosMember = nacosMember;
        }
        catch (err) {
            res.status(500).json({ "success": false, "error": "Something went wrong.\n Try again" });
        }
        next();
    });
}
exports.isNacosMemberAvailable = isNacosMemberAvailable;
function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (authHeader == null)
        return res.status(403).json({ "success": false, "message": "Unauthorized access" });
    const token = authHeader.split(' ')[1];
    if (token == null)
        return res.status(401).json({ "success": false, "message": "Unauthorized access" });
    jsonwebtoken_1.default.verify(token, secretKey, {}, (err, nacosMemberData) => __awaiter(this, void 0, void 0, function* () {
        if (err)
            return res.status(403).json({ "success": false, "error": "Unauthorized access" });
        const nacosMember = yield nacos_member_1.default.findOne({ _id: nacosMemberData._id });
        if (!nacosMember)
            return res.status(403).json({ "success": false, "error": "Unauthorized access" });
        res.locals.nacosMember = nacosMember;
        next();
    }));
}
exports.authenticate = authenticate;
;
