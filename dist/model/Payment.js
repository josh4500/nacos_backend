"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const PaymentSchema = new mongoose_1.default.Schema({
    amount: {
        required: true,
        type: Number
    },
    matric_number: {
        required: true,
        type: String
    },
    paymentMethod: {
        required: true,
        type: String
    }
}, {
    timestamps: true,
});
const Payment = mongoose_1.default.model('Payment', PaymentSchema);
exports.default = Payment;
