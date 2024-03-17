const Course = require("../models/Course");
const RatingAndReview = require("../models/RatingAndReview");
const mongoose = require("mongoose");
exports.createRating = async (req, res) => {
  try {
    // get userId
    const userId = req.user.id;

    // fetch data from req.body
    const { rating, review, courseId } = req.body;
    // check if user is enrolled or not
    const courseDetails = await Course.findOne({
      _id: courseId,
      studentsEnrolled: { $elemMatch: { $eq: userId } },
    });

    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: "student not enrolled in this course ",
      });
    }

    // check if user already review the course
    const alreadyReviewed = await RatingAndReview.findOne({
      user: userId,
      course: courseId,
    });
    if (alreadyReviewed) {
      return res.status(403).json({
        success: false,
        message: "Course is already reviewed by this user",
      });
    }

    // create rating and review

    const ratingReview = await RatingAndReview.create({
      rating,
      review,
      course: courseId,
      user: userId,
    });
    // update course with this review
    await Course.findByIdAndUpdate(
      { _id: courseId },
      {
        $push: {
          ratingAndReviews: ratingReview._id,
        },
      },
      { new: true }
    );
    // return res
    return res.status(200).json({
      success: true,
      message: "Rating and Review created SuccessFully",
      ratingReview,
    });
  } catch (error) {
    console.log("Error Occurred while creating a new review ", error);
    return res.status(500).json({
        success:false,
        message:error.message,
    }) 
}
}; 


exports.getAverageRating =async (req,res) =>{
try {
  // get course id 
  const courseId = req.body.courseId;
  // calculate avg rating 
  const result = await RatingAndReview.aggregate([
         {
          $match:{
            course: new mongoose.Types.objectId(courseId),
          },
         },
         {
          $group:{
           id:null,
           averageRating:{$avg :"$rating"},
          }
         }

  ])
  // return rating 
  if(result.length >0){
    return res.status(200).json({
      success:true,
      averageRating:result[0].averageRating,
    })
  }

  //if no rating /review exist
  return res.status(200).json({
    success:true,
    message:"Average Rating is 0,no rating given till now",
    averageRating:0,
  })

} catch (error) {
  console.log(error);
 return res.status(500).json({
  success:false,
 message : error.message
 }) 

}
}

exports.getAllRating = async (req,res) =>{
  try {
    const allReviews = await RatingAndReview.find({})
    .sort({rating:"desc"})
    .populate({path:"user",
               select:"firstName lastName email image",
  })
  .populate({
    path:"course",
    select:"courseName"
  })
  .exec()

  // return res 
  return res.status(200).json({
    message:"All reviews fetched SuccessFully",
    data:allReviews,
  })

  } catch (error) {
    console.log(error);
   return res.status(500).json ({
   success:false,
   message:error.message
   })
  }
}