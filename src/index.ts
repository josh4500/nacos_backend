import createError from "http-errors";
import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db';
import path from 'path';
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth";

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.use((_, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, PATCH, DELETE"
    );
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});

//Connection to the DB
connectDB();

// View engine setup.
// app.set("views", path.join(__dirname, "..", "views"));
// app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(authRouter);

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
app.get('/', (req: Request, res: Response) => {
    res.send('Nacos Backend Impl');
});

app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});