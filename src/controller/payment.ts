import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Payment, { IPayment } from "../model/Payment";
import Joi from "joi"
import Card from '../model/card';
import PaymentRequest from '../model/PaymentRequest';
import Student, { IStudent } from "../model/student";
import { secretKey } from './auth';
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
export const cardPayment = async (req: Request, res: Response, next: NextFunction) => {
    
    const error =  validateRequestBody(req)

    if(error.length !=0){
        res.status(400).send({code : 400,message : "Incomplete request",error : error})
        return
    }


    var card = new Card(
        req.body.card.cvv,
        req.body.card.pin,
        req.body.card.pan,
        req.body.card.cardHolderName,
        req.body.card.cardExpireDate
    )
    let paymentRequest = new PaymentRequest(
        req.body.amount,
        card
    )    
    var student : IStudent = new Student()
    verifyToken(req,res,(token : string)=>{
        jwt.verify(token,secretKey,(err,data)=>{
            if(err){
                res.status(403).send(
                    {
                        code : 403,
                        message : "Unknown user"
                    }
                )
                return;
            }
            student = data as IStudent
        })
    })
    
    var isAmountValid = validateAmountAgainstPayment(paymentRequest.amount)

    if(!isAmountValid){
        res.status(400).send({
            code : 400,
            message :"Invalid amount"
        })
        return
    }

    makePayment(paymentRequest,student,res);

}
function verifyToken(req: Request,res : Response,next:(token:string)=>void){
    const header = req.headers["authorization"];
    if(typeof header  !== "undefined" ){
        const token = header.split(" ")[1];
        next(token)
    }
    else {
        res.status(401).send({
            code : 403,
            message :"invalid or no auth token"
        })
    }

}
function validateAmountAgainstPayment(amount: Number) : Boolean {
    var isAmountValid =  true
    if(amount !== 500){
        isAmountValid = false
    }
    return isAmountValid;
}
async function  makePayment(paymentRequest: PaymentRequest, student: IStudent, res: Response<any, Record<string, any>>){

    const payment = new Payment({
        amount : paymentRequest.amount,
        matric_number : student.matric_number,
        paymentMethod : "card",
        createdAt : Date.now(),
        updatedAt : Date.now()
    })
    await payment.save()
    res.status(200).send({
        status : "00",
        message : "approved or complete successfully",
        data : payment
    })
}
function validateRequestBody(req : Request) : Array<Object>{
    var err  =  Array<Object>()
    
    const {amount, card} = req.body
    if(!amount){
        err.push({
            field : "amount",
            message : "Amount is required"
        })
    }
    if(!card){
        err.push({
            field : "card",
            message : "Card details is required"
        })
        return err
    }
    if(card.cardHolderName === "" ){
        err.push({
            field : "cardHolderName",
            message :"cardHoldersName is required"
        
        })
    }
    if(card.cvv === "" ){
        err.push({
            field : "cvv",
            message :"cvv is required"
        
        })
    }
    if(card.cvv.length > 3 || card.cvv.length < 3 ){
        err.push({
            field : "cvv",
            message :"invalid cvv"
        
        })
    }
    if(card.pin === "" || !card.pin){
        err.push({
            field : "pin",
            message :"pin is required"
        
        })
    }
    if(card.pin.length !== 4){
        err.push({
            field : "pin",
            message :"invalid pin"
        
        })
    }
    try {
        BigInt(card.pan)
    } catch (error) {
        err.push({
            field : "pan",
            message :"invalid pan"
        
        })  
        return err
    }
    
    if(card.pan === "" || !card.pan ){
        err.push({
            field : "pan",
            message :"pan is required"
        
        })
    }
    if(card.pan.length > 19 || card.pan.length < 16 ){
        err.push({
            field : "pan",
            message :"incorrect pan"
        
        })
    }
    if(card.cardExpireDate.length > 5 || card.cardExpireDate.length < 5 || !card.cardExpireDate.includes("/") ){
        err.push({
            field : "cardExpireDate",
            message :"invalid expired date format. Use mm/yy e.g 03/24"
        
        })
        return err
    }
    if(!card.cardExpireDate || card.cardExpireDate === "" ){
        err.push({
            field : "cardExpireDate",
            message : "cardExpireDate is required"
        
        })

        return err
    }
    const currentYear = Number(new Date().getFullYear().toString().substring(2, 4));

    const currentMonth = new Date().getMonth() + 1


    var dateSplit = card.cardExpireDate.split("/")
    var month = parseInt(dateSplit[0])
    var year = parseInt(dateSplit[1])
    
    if(year < currentYear || month > currentMonth ){
        err.push({
            field : "card",
            message :"expired card"
        
        })
    }

    return err 
}
