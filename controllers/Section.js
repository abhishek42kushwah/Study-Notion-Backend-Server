const Section = require("../models/Section");
const Course = require("../models/Course");

exports.createSection = async (req, res) => {
  try {
    // get data from body

    const { sectionName, courseId } = req.body;

    // data validation

    if (!sectionName || !courseId) {
      return res.status(400).json({
        success: true,
        message: "Missing properties",
      });
    }

    // create section

    const newSection = await Section.create({ sectionName });

    // add the new section to the course's content array

    const updatedCourseDetails = await Course.findByIdAndUpdate(
      courseId,
      {
        $push: {
          courseContent: newSection._id,
        },
      },
      { new: true }
    ).populate({
      path: "courseContent",
      populate: {
        path: "subSection",
      },
    })
    .exec();


  
    // return response

    return res.status(200).json({
      success: true,
      message: "Section Created SuccessFully",
      updatedCourseDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: " Section Creation unSuccessFully,plz try again  ",
      error: error.message,
    });
  }
};

exports.updateSection = async (req, res) => {
  try {
    // data input
    const { sectionName, sectionId } = req.body;

    // extra ha is your choise
    // data validation
    if (!sectionName || !sectionId) {
      return res.status(400).json({
        success: true,
        message: "Missing properties (Sn,Si) ",
      });
    }

    //   update data

    const section = await Section.findByIdAndUpdate(
      sectionId,
      { sectionName },
      { new: true }
    );

    // res. return
    return res.status(200).json({
      success: true,
      message: `${ section }:"section Updated successFully"`
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: " Section update UnSuccessFully,plz try again  ",
      error: error.message,
    });
  }
};

exports.deleteSection = async (req, res) => {
  try {
    // get id - assuming that we are sending id in param
    const { sectionId } = res.param;

    // use update ans delete
    await Section.findByIdAndDelete(sectionId);
// later[testing] do we need to delete the entry from create schema 
    // return  res.

    return res.status(200).json({
      success: true,
      message: " section deleted successFully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: " Section deleted UnSuccessFully,plz try again  ",
      error: error.message,
    });
  }
};
