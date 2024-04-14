const Profile = require("../models/Profile");
const User = require("../models/User");
const {imageUploadCloudinary} =require("../utils/imageUploader")

exports.updateProfile = async (req, res) => {  
  try {
    // get data
    const { dateOfBirth = "", about = "", contactNumber} = req.body;
    // get UserId
    const id = req.user.id;
    // validation
    // if (!contactNumber || !id) {
    //   return res
    //     .status(400)
    //     .json({ success: true, message: "Please fill all fields" });
    // }
    //find profile
    const userDetails = await User.findById(id);
    const profileId = userDetails.additionalDetails;
    const profileDetails = await Profile.findById(profileId);
    //update
    profileDetails.dateOfBirth = dateOfBirth;
    profileDetails.about = about;
    profileDetails.contactNumber = contactNumber;
    // profileDetails.gender = gender;
    await profileDetails.save();
    // return res
    return res.status(200).json({
      success: true,
      message: "Profile Updated SuccessFully",
      profileDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Profile not Update",
      error: error.message
    });
  }
};

//deleteAccount
exports.deleteAccount = async (req, res) => {
  try {
    //get id
    const id = req.user.id;

    //validation

    const userDetails = await User.findById({_id : id});
    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // delete profile
    await Profile.findByIdAndDelete({ _id: userDetails.additionalDetails });
    // hw unenroll  user from all enrolled course
    //   delete user
    await user.findByIdAndDelete({ _id: id });

    //    return res
    return res.status(200).json({
      success: true,
      message: "User Delete SuccessFully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "account Not Delete",
    });
  }
};

exports.getAllUserDetails = async (req, res) => {
  try {
    // get id
    const id = req.user.id;

    // validation and get userDetails
    const userDetails = await User.findById(id)
      .populate("additionalDetails")
      .exec();

    // return res.
    return res.status(200).json({
      success: true,
      message: "getAllUserDetails SuccessFully",
     data : userDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "get all User Details Filed ",
    });
  }
};


exports.updateDisplayPicture  = async (req,res) =>{
  try {
     
  const displayPicture = req.files.displayPicture;
  const userId = req.user.id;
  const image = await imageUploadCloudinary(displayPicture,
    process.env.FOLDER_NAME,1000,1000)

    console.log(image)
    const  updatedProfile = await User.findByIdAndUpdate(
      {_id: userId},
      { image:image.secure_url },
      {new:true}
    )
     
    res.send({
      success:true,
      message:`Image Update SuccessFully`,
      data:updatedProfile,
    })

  } catch (error) {
    console.log("profile update issue",error)
    res.status(500).json({
      success:false,
      message:error.message,
      message: "profile not update display"
    })
  }
}

exports.getEnrolledCourse =  async (req,res) =>{
  try {
    const userId = req.user.id;
    console.log("id :",userId);
    const userDetails = await User.findOne({
      _id: userId
    }).populate("courses")
    .exec()
   
    if(!userDetails){
      return res.status(400).json({
        success:false,
        message:error.message,
        message: `Could not find user with id: ${userDetails}`,
      })
    }
    return res.status(200).json({
      success: true,
      data: userDetails.courses,
    })

  } catch (error) {
    console.log("error here" ,error);
    return res.status(500).json({
      success:false,
      
      message:error.message,
    })
  }
}