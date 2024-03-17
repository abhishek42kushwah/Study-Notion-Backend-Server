const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const emailTemplate = require("../mail/templates/emailVerificationTemplate");

const OTPSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createAt: { type: Date, default: Date.now, expires: 5 * 60 },
});

// for send mails
async function sendVerificationEmail(email, otp) {
  try {

    const mailResponse = await mailSender(
      email,
      "Verification Email  ",
      emailTemplate(otp)
    );
    console.log("Email send SuccessFully: ", mailResponse.response);
  } catch (error) {
    console.log("error occurred while sending mails: ", error);
    throw error;
  }
}

OTPSchema.pre("save", async function (next) {
  console.log("New document saved to database");

  if (this.isNew) {
    await sendVerificationEmail(this.email, this.otp);
  }
  next();
});

const OTP = mongoose.model("OTP", OTPSchema);

module.exports = OTP;
