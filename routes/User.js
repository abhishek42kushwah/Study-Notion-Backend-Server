const express =require("express");
const router =express.Router()


const {login,signup,sendOTP,changePassword} = require("../controllers/Auth");

const {auth} = require("../middilewares/auth");

const {resetPasswordToken,resetPassword} = require("../controllers/ResetPassword");


// authentication routes
router.post("/login",login);
router.post("/signUp",signup);
router.post("/sendOTP",sendOTP);
router.post("/changePassword",auth,changePassword)



// resetPassword 
router.post("/reset-Password-token",resetPasswordToken);
router.post("/reset-Password",resetPassword);





module.exports = router ;