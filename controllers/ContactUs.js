const { contactUsEmail } = require("../mail/templates/contactFormRes")
const mailSender = require("../utils/mailSender")

exports.contactUsController = async (req,res)=>{
const { email,firstName,lastName,phoneNo,message,countryCode} = req.body 
console.log(req.body);
try {
    const emailRes = await emailRes(
email,"Your Data Send SuccessFully",
contactUsEmail(email,firstName,lastName,message,phoneNo,countryCode)
    ) 
console.log("EmailRes:",emailRes);
return res.json({
    success:true,
    message:"email  send successfully"
})
} catch (error) {
    console.log("Error", error)
    console.log("Error message :", error.message)
    return res.json({
      success: false,
      message: "Something went wrong...",
    })
}
}