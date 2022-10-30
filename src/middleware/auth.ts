import jwt from 'jsonwebtoken';
import NacosMember, { INacosMember } from '../model/nacos_member';
import { Request, Response, NextFunction } from 'express';

const secretKey: string = 'computersciencenacosMember(2017)federaluniversitylokoja';
export async function isNacosMemberAvailable(req: Request, res: Response, next: NextFunction) {
    let nacosMember: INacosMember | null;
    try {
        nacosMember = await NacosMember.findOne({ email: req.body.email });
        if (!nacosMember) {
            return res.status(400).json({
                success: false,
                error: 'NacosMember does not exist',
            });
        }
        res.locals.nacosMember = nacosMember;
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
    jwt.verify(token, secretKey as string, {}, async (err: any, nacosMemberData: any) => {

        if (err) return res.status(403).json({ "success": false, "error": "Unauthorized access" });
        const nacosMember = await NacosMember.findOne({ _id: nacosMemberData._id });
        if (!nacosMember) return res.status(403).json({ "success": false, "error": "Unauthorized access" });
        res.locals.nacosMember = nacosMember;
        next();
    });
};