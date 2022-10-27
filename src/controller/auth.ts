import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import Student, { IStudent } from "../model/student";
const EmailValidator = require('email-deep-validator');
const emailValidator = new EmailValidator();

const secretKey = process.env.TOKEN_SECRET as string;
const saltRounds = parseInt(process.env.SALT_ROUNDS as string);

export const signUp = async (req: Request, res: Response, next: NextFunction) => {
    const student: IStudent = req.body;
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

    const existEmail = await Student.findOne({ email: req.body.email });
    const newStudentEmail = await emailValidator.verify(req.body.email);

    if (existEmail) {
        res.status(400).json({ "success": false, "error": 'Email already exist' });
        return;
    }
    if (newStudentEmail.validDomain === false) {
        res.status(400).json({ "success": false, "error": 'Invalid Email Address' });
        return;

    } else {
        try {
            const hashedPassword = await bcrypt.hash(student.password, saltRounds);
            student.password = hashedPassword;
            const newStudent = new Student(student);
            const savedStudent: IStudent = await newStudent.save();
            const { password, ...studentData } = savedStudent.toObject();
            res.status(201).json({ "success": true, "data": studentData, "error": null });
        }
        catch (err) {
            res.status(500).json({ "success": false, "message": err });
        }
    }
};

export const signIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { emailOrMatric, password } = req.body;

        if (emailOrMatric && password) {
            const regStudent = await Student.findOne({ email: emailOrMatric, matric_number: emailOrMatric });
            if (regStudent) {
                const { password, ...studentData } = regStudent.toObject();
                const validPassword = await bcrypt.compare(req.body.password, regStudent.password);
                if (!validPassword) return res.status(400).json({
                    "success": false,
                    "error": 'Invalid Email Address or Password'
                });
                const token = jwt.sign({ _id: regStudent._id.toString(), email: regStudent.email }, secretKey, { expiresIn: '72000000 seconds' });
                res.cookie('jwt', token);
                res.status(200).json({
                    "success": true,
                    "message": "Login Successful",
                    "student": studentData,
                    "error": null
                });
            } else {
                res.status(400).json({
                    "success": false,
                    "error": 'Invalid Email Address or Password'
                });
            }
        } else {
            res.status(400).json({
                "success": false,
                "error": 'Invalid Email Address or Password'
            });
        }

    } catch (err) {
        res.status(500).json({ "success": false, "error": err });
    }
};

export const updateStudentData = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { student } = res.locals;
        if (student) {
            const { _id, id, email, password, ...studentData } = req.body;
            const regStudent = await Student.findOneAndUpdate({ id: student.id }, studentData);
            if (regStudent) {
                res.status(200).json({
                    "success": true,
                    "message": "Student data updated Successful",
                    "error": null
                });
            } else {
                res.status(400).json({
                    "success": false,
                    "error": 'Student does not exist'
                });
            }
        } else {
            res.status(400).json({
                "success": false,
                "error": 'Student does not exist'
            });
        }

    } catch (err) {
        res.status(500).json({ "success": false, "error": err });
    }
};

export const verifySafePhrase = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, safe_phrase, safe_answer } = req.body;
        if (!email || !safe_phrase || !safe_answer) {
            return res.status(400).json({
                "success": false,
                "error": 'Invalid argument'
            });
        }
        const regStudent = await Student.findOne({ email: email });
        if (regStudent) {
            const { password, ...studentData } = regStudent.toObject();
            const validAnswer = await bcrypt.compare(safe_answer, regStudent.safe_answer);
            if (!validAnswer || safe_phrase != regStudent.safe_phrase) return res.status(400).json({
                "success": false,
                "error": 'Incorrect answer. Try again.'
            });
            return res.status(200).json({
                "success": true,
                "data": studentData,
                "error": null
            });
        } else {
            res.status(400).json({
                "success": false,
                "error": 'Student does not exist'
            });
        }

    } catch (err) {
        res.status(500).json({ "success": false, "error": err });
    }
};

export const updatePassword = async (req: Request, res: Response, next: NextFunction) => {
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
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            const regStudent = await Student.findOneAndUpdate({ id: student.email }, { password: hashedPassword });
            if (regStudent) {
                res.status(200).json({
                    "success": true,
                    "message": "Student password successful.",
                    "error": null
                });
            } else {
                res.status(400).json({
                    "success": false,
                    "error": 'Student does not exist.'
                });
            }
        } else {
            res.status(400).json({
                "success": false,
                "error": 'Student does not exist.'
            });
        }

    } catch (err) {
        res.status(500).json({ "success": false, "error": err });
    }
};

export const fetchUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        if (id) {
            const regStudent = await Student.findOne({ id: id });
            if (regStudent) {
                const { password, ...studentData } = regStudent;
                res.status(200).json({
                    "success": true,
                    "data": studentData,
                    "error": null
                });
            } else {
                res.status(400).json({
                    "success": false,
                    "error": 'Student does not exist.'
                });
            }
        } else {
            res.status(400).json({
                "success": false,
                "error": 'Student does not exist.'
            });
        }

    } catch (err) {
        res.status(500).json({ "success": false, "error": err });
    }
};