const Course = require("../models/Course");
const Category = require("../models/Category");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const { request } = require("express");

// createCourse handler function
exports.createCourse = async (req, res) => {
  try {
    // get all require fields from request body
    const {
      courseName,
      courseDescription,
      whatYouWillLearn,
      price,
      tag,
      category,
      status,
      instructions
    } = req.body;
     console.log(req.body)
    //  get thumbnail
    
    const thumbnail = req.files && req.files.thumbnailImage;
    console.log(thumbnail)
    // Convert the tag and instructions from stringified Array to Array
    // const tag = JSON.parse(_tag);
    // const instructions = JSON.parse(_instructions);

    // console.log("tag", tag);
    // console.log("instructions", instructions);

    // validation
    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !tag.length ||
      !thumbnail ||
      !category ||
      !instructions.length
    ) {
      
      
      return res.status(400).json({ success: false, message: "Please fill all fields" })
    }

    if (!status || status === undefined) {
      status = "Draft";
    }

    // check for instructor
    // fetch  user id from res. object
    const userId = req.user.id;
    console.log(userId)
    const instructorDetails = await User.findById(userId, {
      accountType: "Instructor",
    });

    console.log("instructorDetails :", instructorDetails);
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
    if (thumbnail) {
      const thumbnailImage = await uploadImageToCloudinary(
        thumbnail,
        process.env.FOLDER_NAME
      );
      console.log(thumbnailImage);
    }

    //  create an entry for new Course
    const newCourse = await Course.create({
      courseName,
      courseDescription,
      instructor: instructorDetails._id,
      whatYouWillLearn: whatYouWillLearn,
      price,
      tag,
      thumbnail: thumbnailImage.secure_url,
      category: categoryDetails._id,
      status: status,
      instructions,
    });

    console.error("newCourse:",newCourse);
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
    const Category0 = await Category.findByIdAndUpdate(
      { _id: category },
      {
        $push: {
          course: newCourse._id,
        },
      },
      { new: true }
    );
    console.log("he", Category0);
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
        thumbnail: true,
        ratingAndReviews: true,
      }
    )
      .populate("instructor")
      .exec();

    return res.status(200).json({
      success: true,
      message: " Data for all courses fetched successFully  ",
      data: allCourses,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Can't Fetch course data  ",
    });
  }
};

exports.getCourseDetails = async (req, res) => {
  try {
    //  get id from body
    const { courseId } = req.body;
    //find course details
    const courseDetails = await Course.find({ _id: courseId })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subsection",
        },
      })
      .exec();

    // validation
    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: `course not find the course with ${courseId}`,
      });
    }

    // return res
    return res.status(200).json({
      success: true,
      message: "Course Details SuccessFully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.editCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const updates = req.body;
    const course = await Course.findById(courseId);

    if (!course) {
      return res
        .status(404)
        .json({ success: false, error: "Course not found" });
    }

    // if thumbnail image is found,update it
    if (req.file) {
      console.log("thumbnail update");
      const thumbnail = req.files.thumbnailImage;
      const thumbnailImage = await uploadImageToCloudinary(
        thumbnail,
        process.env.FOLDER_NAME
      );
      course.thumbnail = thumbnailImage.secure_url;
    }

    // update only the fields that are present in req  body
    for (const key in updates) {
      if (updates.hasOwnProperty(key)) {
        if (key === "tag" || key === "instructions") {
          course[key] = JSON.parse(updates[key]);
        } else {
          course[key] = updates[key];
        }
      }
    }

    await course.save();

    const updatedCourse = await course
      .findOne({
        _id: courseId,
      })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();

    res.json({
      success: true,
      message: "Course Update SuccessFully",
      data: updatedCourse,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server Error",
    });
  }
};

exports.getFullCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;
    const courseDetails = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();

    let courseProgressCount = await courseProgress.findOne({
      courseID: courseId,
      userId: userId,
    });

    console.log("courseProgressCount", courseProgressCount);

    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find course with id ${courseId}`,
      });
    }

    // if (courseDetails.status === "Draft") {
    //   return res.status(403).json({
    //     success: false,
    //     message: `Accessing a draft course is forbidden`,
    //   });
    // }

    let totalDurationInSeconds = 0;
    courseDetails.courseContent.forEach((content) => {
      content.subSection.forEach((subSection) => {
        const timeDurationInSections = parseInt(subSection.timeDuration);
        totalDurationInSeconds += timeDurationInSections;
      });
    });

    const totalDuration = convertSecondsToDuration(totalDurationInSeconds);

    return res.status(200).json({
      success: true,
      data: {
        courseDetails,
        totalDuration,
        completedVideos: courseProgressCount?.completedVideos
          ? courseProgressCount?.completedVideos
          : [],
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getInstructorCourses = async (req, res) => {
  try {
    const instructorId = req.user.id;

    const instructorCourses = await Course.find({
      instructor: instructorId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: instructorCourses,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve instructor course",
      error: error.message,
    });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.body;

    // Find the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Unenroll students from the course
    const studentsEnrolled = course.studentsEnrolled;
    for (const studentId of studentsEnrolled) {
      await User.findByIdAndUpdate(studentId, {
        $pull: { courses: courseId },
      });
    }

    // Delete sections and sub-sections
    const courseSections = course.courseContent;
    for (const sectionId of courseSections) {
      // Delete sub-sections of the section
      const section = await Section.findById(sectionId);
      if (section) {
        const subSections = section.subSection;
        for (const subSectionId of subSections) {
          await SubSection.findByIdAndDelete(subSectionId);
        }
      }

      // Delete the section
      await Section.findByIdAndDelete(sectionId);
    }

    // Delete the course
    await Course.findByIdAndDelete(courseId);

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
