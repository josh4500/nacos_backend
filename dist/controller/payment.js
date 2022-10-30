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
exports.payments = exports.cardPayment = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Payment_1 = __importDefault(require("../model/Payment"));
const card_1 = __importDefault(require("../model/card"));
const PaymentRequest_1 = __importDefault(require("../model/PaymentRequest"));
const student_1 = __importDefault(require("../model/student"));
const auth_1 = require("./auth");
// var carScheme = Joi.object({
//     cvv : Joi.string().min(3).max(3).required(),
//     pan : Joi.string().min(14).max(16).required(),
//     cardHolderName : Joi.string().min(4).max(20).required(),
//     pin : Joi.string().min(4).max(4).required(),
//     cardExpireDate : Joi.string().min(5).max(5).required()
// }).meta({ className: 'Card' });
// var paymentRequestSchema = Joi.object({
//     amount : Joi.number().required(),
//     card : carScheme
// }).meta({ className: 'PaymentRequest' });
const cardPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const error = validateRequestBody(req);
    if (error.length != 0) {
        res.status(400).send({ code: 400, message: "Incomplete request", error: error });
        return;
    }
    var card = new card_1.default(req.body.card.cvv, req.body.card.pin, req.body.card.pan, req.body.card.cardHolderName, req.body.card.cardExpireDate);
    let paymentRequest = new PaymentRequest_1.default(req.body.amount, card);
    var student = new student_1.default();
    verifyToken(req, res, (token) => {
        jsonwebtoken_1.default.verify(token, auth_1.secretKey, (err, data) => {
            if (err) {
                res.status(403).send({
                    code: 403,
                    message: "Unknown user"
                });
                return;
            }
            student = data;
        });
    });
    var isAmountValid = validateAmountAgainstPayment(paymentRequest.amount);
    if (!isAmountValid) {
        res.status(400).send({
            code: 400,
            message: "Invalid amount"
        });
        return;
    }
    makePayment(paymentRequest, student, res);
});
exports.cardPayment = cardPayment;
const payments = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var student = new student_1.default();
    verifyToken(req, res, (token) => {
        jsonwebtoken_1.default.verify(token, auth_1.secretKey, (err, data) => {
            if (err) {
                res.status(403).send({
                    code: 403,
                    message: "Unknown user"
                });
                return;
            }
            student = data;
        });
    });
    yield Payment_1.default.find({ matric_number: student.matric_number }, (err, payments) => {
        if (err) {
            res.status(400).send({
                code: 400,
                message: "an error occurred",
                error: err
            });
        }
        else
            res.status(200).send({
                status: "00",
                message: "Approved or complete successfully",
                data: payments
            });
    });
    res.send("Hello");
});
exports.payments = payments;
function verifyToken(req, res, next) {
    const header = req.headers["authorization"];
    if (typeof header !== "undefined") {
        const token = header.split(" ")[1];
        next(token);
    }
    else {
        res.status(401).send({
            code: 403,
            message: "invalid or no auth token"
        });
    }
}
function validateAmountAgainstPayment(amount) {
    var isAmountValid = true;
    if (amount !== 500) {
        isAmountValid = false;
    }
    return isAmountValid;
}
function makePayment(paymentRequest, student, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const payment = new Payment_1.default({
            amount: paymentRequest.amount,
            matric_number: student.matric_number,
            paymentMethod: "card",
            createdAt: Date.now(),
            updatedAt: Date.now()
        });
        yield payment.save();
        res.status(200).send({
            status: "00",
            message: "approved or complete successfully",
            data: payment
        });
    });
}
function validateRequestBody(req) {
    var err = Array();
    const { amount, card } = req.body;
    if (!amount) {
        err.push({
            field: "amount",
            message: "Amount is required"
        });
    }
    if (!card) {
        err.push({
            field: "card",
            message: "Card details is required"
        });
        return err;
    }
    if (card.cardHolderName === "") {
        err.push({
            field: "cardHolderName",
            message: "cardHoldersName is required"
        });
    }
    if (card.cvv === "") {
        err.push({
            field: "cvv",
            message: "cvv is required"
        });
    }
    if (card.cvv.length > 3 || card.cvv.length < 3) {
        err.push({
            field: "cvv",
            message: "invalid cvv"
        });
    }
    if (card.pin === "" || !card.pin) {
        err.push({
            field: "pin",
            message: "pin is required"
        });
    }
    if (card.pin.length !== 4) {
        err.push({
            field: "pin",
            message: "invalid pin"
        });
    }
    try {
        BigInt(card.pan);
    }
    catch (error) {
        err.push({
            field: "pan",
            message: "invalid pan"
        });
        return err;
    }
    if (card.pan === "" || !card.pan) {
        err.push({
            field: "pan",
            message: "pan is required"
        });
    }
    if (card.pan.length > 19 || card.pan.length < 16) {
        err.push({
            field: "pan",
            message: "incorrect pan"
        });
    }
    if (card.cardExpireDate.length > 5 || card.cardExpireDate.length < 5 || !card.cardExpireDate.includes("/")) {
        err.push({
            field: "cardExpireDate",
            message: "invalid expired date format. Use mm/yy e.g 03/24"
        });
        return err;
    }
    if (!card.cardExpireDate || card.cardExpireDate === "") {
        err.push({
            field: "cardExpireDate",
            message: "cardExpireDate is required"
        });
        return err;
    }
    const currentYear = Number(new Date().getFullYear().toString().substring(2, 4));
    const currentMonth = new Date().getMonth() + 1;
    var dateSplit = card.cardExpireDate.split("/");
    var month = parseInt(dateSplit[0]);
    var year = parseInt(dateSplit[1]);
    if (year < currentYear || month > currentMonth) {
        err.push({
            field: "card",
            message: "expired card"
        });
    }
    return err;
}
