const express = require("express");
const router = express.Router();

const {
    updateProfile,
    deleteAccount,
    getAllUserDetails,
    updateDisplayPicture,
    getEnrolledCourse} = require("../controllers/Profile");
const {
    auth } =require("../middilewares/auth");

// delete user acc 

router.delete("/deleteProfileUser", auth , deleteAccount);
//get all users details
router.get('/getAllUsersDetails', auth, getAllUserDetails)
//update profile
router.put("/updateProfile", auth, updateProfile)
//upload display picture
router.put("/updateDisplayPicture", auth, updateDisplayPicture)
//get enrolled course of a student
router.get("/getEnrollmentCourse" ,auth, getEnrolledCourse )

module.exports=router;

