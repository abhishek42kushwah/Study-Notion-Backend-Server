const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
// resetPasswordToken
exports.resetPasswordToken = async (req, res) => {
 try {
     // get mail from body

  const email = req.body.email;

  // user exists already in email , email validation

  const user = await User.findOne({ email: email });
  if (!user) {
    return res.json({
      success: false,
      message: `Email: ${email} your email not registered with us `,
    });
  }

  // generate token
  const token = crypto.randomBytes(20).toString("hex");

  // update user by adding token and expiration time

  const updateDetails = await User.findOneAndUpdate(
    { email: email },
    {
      token: token,
      resetPasswordToken: Date.now() + 3600000,
    },
    //    update document return
    { new: true }
  );

  console.log("Details",updateDetails)

// create url  
  const url = `http://localhost:3000/update-password/${token}`;
 
//   send mail containing the url 

await mailSender(email,
    "Password reset Link",
    `Password reset Link ${url}`);

    // res.  send 
     
   return res.json({
    success: true,
    message : "Email send successFully ,Plz check email and change pwd  "
   });
 } catch (error) {
    console.log(error);
    return res.status(500).json({
        success:false,
        message: "something went wrong while sending reset pwd mail"
    })
 }
};


// resetPassword 
exports.resetPassword = async (req,res) =>{
    try {
        
        // get data 
        const {password,confirmPassword,token } = req.body;


        //validation 
        if(confirmPassword !==password ){
            return res.json({
                success: false,
                message : "Password not matching "
            })
        }
        //get userDetails from db using token  

 const userDetails = await User.findOne({token:token});


        //if no entry - invalid token 

        if(!userDetails){
            return res.json({
                success:false,
                message: " token is invalid"
            });
        }
        //token time check 
        if(userDetails.resetPasswordExpires > Date.now()){
return res.status(403).json({
    success:false,
    message:"token is expired , plz regenerate your token "
})
        };

        //hash pwd 
         const hashPassword = await bcrypt.hash(password,10);
        //pwd update
        await User.findOneAndUpdate(
            {token:token},
            {password: hashPassword},
             {new:true}
            );
        ///res. send 
        
        
         return res.status(200).json({
            success : true,
            message : "Password reset SuccessFully"
            });
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message:"Something went wrong while sending rest and email "
        });
    }
}