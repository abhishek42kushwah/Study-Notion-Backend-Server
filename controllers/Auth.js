const OTP = require("../models/OTP");
const User = require("../models/User");
const otpGenerate = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailSender = require("../utils/mailSender");
const { passwordUpdated } = require("../mail/templates/passwordUpdate");
const Profile = require("../models/Profile");
require("dotenv").config();

exports.sendOTP = async (req, res) => {
  try {
    // fetch email from req ki body
    const { email } = req.body;
    // console.log("email", email = req.body)
    // check if user present already
    const checkUserPresent = await User.findOne({ email });

    // if user already exists then send response
    if (checkUserPresent) {
      return res.status(401).json({
        success: false,
        Message: "User already registered",
      });
    }
    //otp generate
    var otp = otpGenerate.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    console.log("OTPgenerate", otp);

    // check unique otp or not
    const result = await OTP.findOne({ otp: otp });
    console.log("Result is Generate OTP Func");
		console.log("OTP", otp);
		console.log("Result", result);

    while (result) {
       otp = otpGenerate.generate(6, {
        upperCaseAlphabets: false,
      });
      //  result = await OTP.findOne({ otp: otp });
    } 

    const otpPayload = { email, otp };

    // create an entry otp
    const otpBody = await OTP.create(otpPayload);
    console.log(otpBody);

    // res. return successFully
    return res.status(200).json({
      success: true,
      Message: "OTP Send SuccessFully",
      otp,
    });
  } catch (error) {
    console.log("error in the OTP section", error);
    return res.status(500).json({
      success: false,
      message: error.message,
      // message:"otp not send "
    });
  }
};

exports.signup = async (req, res) => {
  try {
    //data fetch  req. from body
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      contactNumber,
      otp,
    } = req.body;

    //validate de kho h ki nai
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !otp
    ) {
      return res.status(403).json({
        success: false,
        message: "All fields are req.",
      });
    }

    //2 pass. match kro
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "pass. and confirmPass. value doesn't match, plz try again",
      });
    }
    //check user Already Exist ?
    const isUserExist = await User.findOne({ email });
    if (isUserExist) {
      return res.status(400).json({
        success: false,
        message: " user already exist ",
      });
    }

    //find recent otp stored for user
    const recentOtp = await OTP
      .find({ email })
      .sort({ createdAt: -1 })
      .limit(1);
    console.log(recentOtp);

    //validate otp
    if (recentOtp.length == 0) {
      return res.status(400).json({
        success: false,
        message: "No OTP found in database!",
      });
    } else if (otp !== recentOtp[0].otp) {
      return res.status(400).json({
        success: false,
        message: " otp not match ",
      });
    }

    //  password hash
    const hashedPassword = await bcrypt.hash(password, 10);

     // Create the user
		let approved = "";
		approved === "Instructor" ? (approved = false) : (approved = true);

    // profile create in db
    const profileDetails = await Profile.create({
      gender: null,
      dataOfBirth: null,
      about: null,
      contactNumber: null,
    });

    //entry  create in db
    const user = await User.create({
      firstName,
      lastName,
      email,
      contactNumber,
      password: hashedPassword,
      accountType,
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    });

    //return res..
    return res.status(200).json({
      success: true,
      message: "User is registered SuccessFully",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User can't be registered , plz try again ",
    });
  }
};

exports.login = async (req, res) => {
  try {
    // data from body
    const { email, password } = req.body;
    //validate data
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: " fullFail  the all details plz ",
      });
    }

    // user exists hai ki nhi
    const user = await User.findOne({ email }).populate("additionalDetails");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User isn't registered , plz signup Firstly",
      });
    }

    //generate JWT ,after pass... matching
    if (await bcrypt.compare(password, user.password)) {

      // payload for token
      const payload = {
        email: user.email,
        id: user._id,
        accountType: user.accountType,
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "2h",
      });
      user.token = token;
      user.password = undefined;

      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };

      res.cookie("token", token, options).status(200).json({
        success: true,
        token,
        user,
        message: "Logged in successFully",
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "password is Incorrect",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "login fail ,plz login again",
    });
  }
};
// Controller for Changing Password
exports.changePassword = async (req, res) => {
	try {
		// Get user data from req.user
		const userDetails = await User.findById(req.user.id);

		// Get old password, new password, and confirm new password from req.body
		const { oldPassword, newPassword, confirmNewPassword } = req.body;

		// Validate old password
		const isPasswordMatch = await bcrypt.compare(
			oldPassword,
			userDetails.password
		);
		if (!isPasswordMatch) {
			// If old password does not match, return a 401 (Unauthorized) error
			return res
				.status(401)
				.json({ success: false, message: "The password is incorrect" });
		}

		// Match new password and confirm new password
		if (newPassword !== confirmNewPassword) {
			// If new password and confirm new password do not match, return a 400 (Bad Request) error
			return res.status(400).json({
				success: false,
				message: "The password and confirm password does not match",
			});
		}

		// Update password
		const encryptedPassword = await bcrypt.hash(newPassword, 10);
		const updatedUserDetails = await User.findByIdAndUpdate(
			req.user.id,
			{ password: encryptedPassword },
			{ new: true }
		);

		// Send notification email
		try {
			const emailResponse = await mailSender(
				updatedUserDetails.email,
				passwordUpdated(
					updatedUserDetails.email,
					`Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
				)
			);
			console.log("Email sent successfully:", emailResponse.response);
		} catch (error) {
			// If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
			console.error("Error occurred while sending email:", error);
			return res.status(500).json({
				success: false,
				message: "Error occurred while sending email",
				error: error.message,
			});
		}

		// Return success response
		return res
			.status(200)
			.json({ success: true, message: "Password updated successfully" });
	} catch (error) {
		// If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
		console.error("Error occurred while updating password:", error);
		return res.status(500).json({
			success: false,
			message: "Error occurred while updating password",
			error: error.message,
		});
	}
};