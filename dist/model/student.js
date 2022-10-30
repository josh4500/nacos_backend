"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const StudentSchema = new mongoose_1.default.Schema({
    firstname: {
        type: String,
        required: true,
    },
    middlename: {
        type: String,
        required: false,
    },
    lastname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        index: true,
    },
    phone: {
        type: String,
        required: false,
        trim: true,
        lowercase: true,
    },
    matric_number: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        uppercase: true,
        index: true,
    },
    department: {
        type: String,
        required: true,
        trim: true,
    },
    year: {
        type: String,
        required: true,
        trim: true,
    },
    is_alumni: {
        type: Boolean,
        default: false,
    },
    image_url: {
        type: String,
        required: false,
    },
}, {
    timestamps: true,
});
const Student = mongoose_1.default.model('Student', StudentSchema);
exports.default = Student;
