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
const mongoose = require("mongoose");
const logger_1 = __importDefault(require("../logger"));
const MONGO_URI = process.env.NODE_ENV === "development"
    ? "mongodb://localhost:27017/nacos_db"
    : process.env.MONGO_URI || "mongodb://localhost:27017/nacos_db";
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Node environment: " + process.env.NODE_ENV);
    try {
        const conn = yield mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            // useCreateIndex: true
        });
        process.env.NODE_ENV === "development" &&
            console.log(`MongoDB Connected: ${conn.connection.host}`);
        logger_1.default.info(`Mongo DB Connected: ${conn.connection.host}`);
    }
    catch (error) {
        logger_1.default.error(`Error: ${error}`);
        process.exit(1);
    }
});
exports.default = connectDB;
