import Joi from "joi";

const validMatricNumber = Joi.string().trim().length(11).uppercase().required();
const validPassword = Joi.string().min(8).alphanum().required();
export const SignupValidationSchema = Joi.object({
    // email: Joi.string().email().required(),
    matric_number: validMatricNumber,
    password: validPassword,
    confirmPassword: Joi.ref('password'),
});

export const SigninValidationSchema = Joi.object({
    matric_number: validMatricNumber,
    password: validPassword,
});