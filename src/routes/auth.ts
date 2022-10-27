import { Router } from 'express';
import { signUp, signIn, updateStudentData, verifySafePhrase, updatePassword, fetchUser } from "../controller/auth";
import { authenticate } from "../middleware/auth";
const router = Router();

//Signup
router.post('/student/register', signUp);
//SignIn
router.post('/student/login', signIn);
//Get user by Id
router.get('/student/:id', fetchUser);
//Update Student Data
router.put('/student/update', [authenticate], updateStudentData);
//Verify safe phrase and answer
router.post('/student/verifySafePhrase', verifySafePhrase);
//Change password
router.post('/student/changePassword', [authenticate], updatePassword);



export default router;