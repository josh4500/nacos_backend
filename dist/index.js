"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./config/db"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_1 = __importDefault(require("./routes/auth"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT;
app.use((_, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});
//Connection to the DB
(0, db_1.default)();
// View engine setup.
// app.set("views", path.join(__dirname, "..", "views"));
// app.set("view engine", "ejs");
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, cookie_parser_1.default)());
app.use(auth_1.default);
// app.use(function (req, res, next) {
//     console.log(req.url);
//     next(createError(404));
// });
// app.use(function (
//     err: createError.HttpError,
//     req: express.Request,
//     res: express.Response,
//     _next: express.NextFunction
// ) {
//     res.locals.message = err.message;
//     res.locals.error = req.app.get("env") === "development" ? err : {};
//     res.status(err.status || 500);
//     res.render("error");
// });
//Frontend na you sabi
app.get('/', (req, res) => {
    res.send('Nacos Backend Impl');
});
app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
