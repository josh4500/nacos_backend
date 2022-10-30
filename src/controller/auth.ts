import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import NacosMember, { INacosMember } from "../model/nacos_member";
import { SigninValidationSchema, SignupValidationSchema } from '../helpers/validatation_schema';
import createHttpError from 'http-errors';
import Student, { IStudent } from '../model/student';

const saltRounds = parseInt(process.env.SALT_ROUNDS as string);

export const signUp = async (req: Request, res: Response, next: NextFunction) => {
    // const { email, matric_number, password } = req.body;
    try {
        const result = SignupValidationSchema.validate(req.body);

        const student: any = await Student.findOne({ matric_number: result.value.matric_number });
        if (!student) {
            throw new createHttpError.Conflict(`Student with ${result.value.matric_number} does not exist.`);
        }

        const existEmail = await NacosMember.findOne({ $or: [{ email: result.value.email }, { matric_number: result.value.matric_number }] });
        if (existEmail) {
            throw new createHttpError.Conflict(`${result.value.matric_number} already exist.`);
        }

        // const hash = jwt.sign(result.value, secretKey, { expiresIn: '72000000 seconds' });
        //Send to mail

        const hashedPassword = await bcrypt.hash(result.value.password, saltRounds);
        const { _id, ...studentData } = student._doc;

        const newNacosMember = new NacosMember({ ...studentData, "password": hashedPassword });
        await newNacosMember.save();

        const { password, safe_answer, ...nacosMemberData } = newNacosMember.toObject();
        res.status(201).json({ "success": true, "data": nacosMemberData, "error": null });

    } catch (error) {
        return res.status(400).send({
            success: false,
            error
        });
    }
};

// export const verifySignup = async (req: Request, res: Response, next: NextFunction) => {
//     try {

//     } catch (error) {

//     }
// };

export const signIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = SigninValidationSchema.validate(req.body);

        const { matric_number, password } = req.body;

        if (matric_number && password) {
            const regStudent: any = await NacosMember.findOne({ "matric_number": result.value.matric_number });
            if (regStudent) {
                const { password, safe_answer, ...nacosMemberData } = regStudent._doc;
                const validPassword = await bcrypt.compare(result.value.password, regStudent.password);
                if (!validPassword) return res.status(400).json({
                    "success": false,
                    "error": 'Invalid Email Address or Password'
                });
                const token = jwt.sign({ _id: nacosMemberData._id.toString(), email: regStudent.email }, secretKey, { expiresIn: '72000000 seconds' });
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

    } catch (err) {
        res.status(500).json({ "success": false, "error": err });
    }
};

export const updateStudentData = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { nacosMember } = res.locals;
        if (nacosMember) {
            const { _id, id, email, password, firstname, lastname, middlename, matric_number, ...nacosMemberData } = req.body;
            const { safe_answer } = nacosMemberData;
            if (safe_answer) {
                const hashedSafeAnswer = await bcrypt.hash(safe_answer, saltRounds);
                nacosMemberData.safe_answer = hashedSafeAnswer;
            }
            const regStudent = await NacosMember.findOneAndUpdate({ email: nacosMember.email }, { ...nacosMemberData }, { new: true });
            if (regStudent) {
                res.status(200).json({
                    "success": true,
                    "message": "Member data updated Successful",
                    "error": null
                });
            } else {
                res.status(400).json({
                    "success": false,
                    "error": 'Member does not exist'
                });
            }
        } else {
            res.status(400).json({
                "success": false,
                "error": 'Member does not exist'
            });
        }

    } catch (err) {
        res.status(500).json({ "success": false, "error": err });
    }
};

export const verifySafePhrase = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, phrase, answer } = req.body;
        if (!email || !phrase || !answer) {
            return res.status(400).json({
                "success": false,
                "error": 'Invalid argument'
            });
        }
        const regStudent = await NacosMember.findOne({ email: email });
        if (regStudent) {
            const { password, safe_answer, ...nacosMemberData } = regStudent.toObject();
            const validAnswer = await bcrypt.compare(answer, regStudent.safe_answer ?? '');
            if (!validAnswer || phrase != regStudent.safe_phrase) return res.status(400).json({
                "success": false,
                "error": 'Incorrect answer. Try again.'
            });
            const token = jwt.sign({ _id: regStudent._id.toString(), email: regStudent.email }, secretKey, { expiresIn: '72000000 seconds' });
            return res.status(200).json({
                "success": true,
                "data": nacosMemberData,
                "token": token,
                "error": null,

            });
        } else {
            res.status(400).json({
                "success": false,
                "error": 'Member does not exist'
            });
        }

    } catch (err) {
        res.status(500).json({ "success": false, "error": err });
    }
};

export const updatePassword = async (req: Request, res: Response, next: NextFunction) => {
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
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            const regStudent = await NacosMember.findOneAndUpdate({ id: nacosMember.email }, { password: hashedPassword });
            if (regStudent) {
                res.status(200).json({
                    "success": true,
                    "message": "Member password successful.",
                    "error": null
                });
            } else {
                res.status(400).json({
                    "success": false,
                    "error": 'Member does not exist.'
                });
            }
        } else {
            res.status(400).json({
                "success": false,
                "error": 'Member does not exist.'
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
            const regStudent: any = await NacosMember.findById(id);
            if (regStudent) {
                const { password, safe_answer, ...nacosMemberData } = regStudent._doc;
                res.status(200).json({
                    "success": true,
                    "data": nacosMemberData,
                    "error": null
                });
            } else {
                res.status(400).json({
                    "success": false,
                    "error": 'Member does not exist.'
                });
            }
        } else {
            res.status(400).json({
                "success": false,
                "error": 'Member does not exist.'
            });
        }

    } catch (err) {
        res.status(500).json({ "success": false, "error": err });
    }
};