"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../controller/auth");
const auth_2 = require("../middleware/auth");
const router = (0, express_1.Router)();
//Signup
router.post('/student/register', auth_1.signUp);
//SignIn
router.post('/student/login', auth_1.signIn);
//Get user by Id
router.get('/student/:id', auth_1.fetchUser);
//Update Student Data
router.put('/student/update', [auth_2.authenticate], auth_1.updateStudentData);
//Verify safe phrase and answer
router.post('/student/verifySafePhrase', auth_1.verifySafePhrase);
//Change password
router.post('/student/changePassword', [auth_2.authenticate], auth_1.updatePassword);
// router.get('/student/payments',(req,res)=>{
//     res.send("Hellooooo")
// });
exports.default = router;
