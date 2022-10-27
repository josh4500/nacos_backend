import mongoose from 'mongoose';


export interface IStudent extends mongoose.Document {
    id: mongoose.Types.ObjectId;
    _id: mongoose.Types.ObjectId;
    firstname: string;
    middlename?: string;
    lastname: string;
    email: string;
    phone?: string;
    password: string;
    matric_number: string;
    department: string;
    year: string;
    is_alumni: boolean;
    image_url?: string;
    safe_phrase?: string;
    safe_answer?: string;
    createdAt?: Date;
    updatedAt?: Date;
}


const StudentSchema = new mongoose.Schema<IStudent>(
    {
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
        password: {
            type: String,
            trim: true,
            required: true,
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
        safe_phrase: {
            type: String,
            required: false,
        },
        safe_answer: {
            type: String,
            required: false,
        },

    },
    {
        timestamps: true,
    },
);

const Student = mongoose.model('Student', StudentSchema);
export default Student;