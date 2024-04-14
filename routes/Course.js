const express = require("express");
const router = express.Router();

//import the Controllers

//course controllers import 
const {createCourse
    ,getAllCourse,
    getCourseDetails} = require("../controllers/Course");

    //Category controllers import 
const {createCategory
    ,showAllCategory,
    categoryPageDetails} = require("../controllers/Category") ;

    //Section controllers import
const {createSection,
    updateSection,
    deleteSection}  = require("../controllers/Section")  ;   

    //SubSection controllers import 
const {createSubsection,
    updateSubSection,
    deleteSubSection} =  require("../controllers/Subsection") ;   
 
    //ratingAndReview controllers import 
const {createRating,
    getAverageRating,
    getAllRating} = require("../controllers/RatingAndReview")    

    // import middleware 

    const { auth,isStudent,isInstructor,isAdmin}= require("../middilewares/auth");

// course routes -
router.post("/createCourse",auth, isInstructor,isAdmin, createCourse);
router.get('/getAllCourses', getAllCourse)
router.post('/getCourseDetails', getCourseDetails)
// category routes -
router.post("/createCategory",auth,isAdmin,isInstructor,createCategory) 
router.get("/showAllCategory" ,showAllCategory )
router.post("/getCategoryPageDetails" , auth , isAdmin , categoryPageDetails)
// section route-
router.post("/addSection" , auth , isAdmin ,isInstructor, createSection)
router.post("/updateSection" , auth , isAdmin,isInstructor , updateSection)
router.post("/deleteSection" , auth , isAdmin ,isInstructor, deleteSection)
// subsection route -
router.post("/addSubSection" , auth,isInstructor , createSubsection)
router.post("/updateSubSection" , auth,isInstructor , updateSubSection)
router.delete("/deleteSubSection" , auth,isInstructor , deleteSubSection)
// rating and review routes
router.post("/createRating" , auth,isStudent , createRating)
router.get("/getAverageRating" , getAverageRating)
router.get("/getRatings" , getAllRating)


    module.exports =router;