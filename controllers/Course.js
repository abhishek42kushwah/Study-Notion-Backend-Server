const Course = require("../models/Course");
const Category = require("../models/Category");
const User = require("../models/User");
const {
  uploadImageToCloudinary,

} = require("../utils/imageUploader");
const { request } = require("express");

// createCourse handler function
exports.createCourse = async (req, res) => {
  try {
   
   
    // get all require fields from request body
    const { courseName,
       courseDescription,
        whatYouWillLearn, 
        price, 
        tag,
        category,
        status,
        instructions } =
      req.body;
    //  get thumbnail
    const thumbnail = req.files.thumbnailImage;

    // validation
    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !tag ||
      !thumbnail ||
      !category
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Please fill all fields" });
    }

    if (!status || status === undefined) {
			status = "Draft";
		}

    // check for instructor
     // fetch  user id from res. object
    const userId = req.user.id;
    const instructorDetails = await User.findById(userId,{accountType: "Instructor",});
    console.log("instructorDetails : ", instructorDetails);

    // then instructorDetails not found
    if (!instructorDetails) {
      return res.status(404).json({
        success: false,
        message: "instructor Not found",
      });
    }

    // check given tag valid or not
    const categoryDetails = await category.findById(category);
    if (!categoryDetails) {
      return res.status(404).json({
        success: false,
        message: " category details not found  ",
      });
    }

    //  upload Image top Cloudinary
    const thumbnailImage = await uploadImageToCloudinary(
      thumbnail,
      process.env.FOLDER_NAME
    );

    //  create an entry for new Course
    const newCourse = await Course.create({
      courseName,
      courseDescription,
      instructor: instructorDetails._id,
      whatYouWillLearn: whatYouWillLearn,
      price,
      tag: tag,
      thumbnail: thumbnailImage.secure_url,
      category : categoryDetails._id,
      status:status,
      instructions : instructions
    });

    // add the new course to the user  schema of  instructor

    await User.findByIdAndUpdate(
      { _id: instructorDetails._id },
      {
        $push: {
          courses: newCourse._id,
        },
      },
      { new: true }
    );
    // Add the new course to the Categories
    await Category.findByIdAndUpdate(
			{ _id: category },
			{
				$push: {
					course: newCourse._id,
				},
			},
			{ new: true }
		);

    // res. return
    return res.status(200).json({
      success: true,
      message: "Course Created SuccessFully",
      data: newCourse,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Fail to create course ",
      error: error.message,
    });
  }
};

exports.getAllCourse = async (req, res) => {
  try {
    const allCourses = await Course.find(
      {},
      {
        courseName: true,
        price: true,
        instructor: true,
        studentEnrollNumber: true,
        thumbnail:true,
        ratingAndReviews:true,
      }
    ).populate("instructor")
     .exec();

     return res.status(200).json({
        success:true,
        message: " Data for all courses fetched successFully  ",
        data:allCourses})

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Can't Fetch course data  ",
    });
  }
};


exports.getCourseDetails = async (req,res) =>{
  try {
    //  get id from body 
    const {courseId} =req.body;
//find course details
const courseDetails = await Course.find(
                                {_id:courseId})
                                .populate(
                                  { 
                                    path :"instructor",
                                    populate:{
                                      path:"additionalDetails"
                                    },

                                  }
                                )
                                .populate("category")
                                .populate("ratingAndReviews")
                                .populate({
                                  path:"courseContent",
                                  populate:{
                                    path:"subsection"
                                  }
                                })
                                .exec();

// validation 
if(!courseDetails){
  return res.status(400).json({
    success:false ,
    message : `course not find the course with ${courseId}`
  });
}

// return res 
return res.status(200).json({
  success:true,
  message:"Course Details SuccessFully"
})

  } catch (error) {
    return res.status(500).json({
      success:false,
      message: error.message,
    });
  }
}