import mongoose, { Number } from 'mongoose';


export interface IPayment extends mongoose.Document {
    id: mongoose.Types.ObjectId;
    _id: mongoose.Types.ObjectId;
    amount: Number;

    matric_number: string;
    paymentMethod: string;
    createdAt?: Date;
    updatedAt?: Date;
}


const PaymentSchema = new mongoose.Schema<IPayment>(
    {
      amount : {
        required : true,
        type: Number
      },
      matric_number : {
        required : true,
        type: String
      },
      paymentMethod : {
        required : true,
        type: String
      }
    },
    {
        timestamps: true,
    },
);

const Payment = mongoose.model('Payment', PaymentSchema);
export default Payment;