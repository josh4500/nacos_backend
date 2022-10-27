import jwt from 'jsonwebtoken';
import Student, { IStudent } from '../model/student';
import { Request, Response, NextFunction } from 'express';

const secretKey: string = 'computersciencestudent(2017)federaluniversitylokoja';
export async function studentAvailable(req: Request, res: Response, next: NextFunction) {
    let student: IStudent | null;
    try {
        student = await Student.findOne({ email: req.body.email });
        if (!student) {
            return res.status(400).json({
                success: false,
                error: 'Student does not exist',
            });
        }
        res.locals.student = student;
    } catch (err: any) {
        res.status(500).json({ "success": false, "error": "Something went wrong.\n Try again" });
    }
    next();
}

export function authenticate(req: Request, res: Response, next: any) {
    const authHeader = req.headers.authorization;
    if (authHeader == null) return res.status(403).json({ "success": false, "message": "Unauthorized access" });
    const token = (authHeader as string).split(' ')[1];

    if (token == null) return res.status(401).json({ "success": false, "message": "Unauthorized access" });
    jwt.verify(token, secretKey as string, {}, async (err: any, studentData: any) => {

        if (err) return res.status(403).json({ "success": false, "error": "Unauthorized access" });
        const student = await Student.findOne({ _id: studentData._id });
        if (!student) return res.status(403).json({ "success": false, "error": "Unauthorized access" });
        res.locals.student = student;
        next();
    });
};