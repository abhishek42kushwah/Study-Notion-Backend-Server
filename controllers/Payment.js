
// full payment me ? hai
const { instance } = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const {
  courseEnrollmentEmail,
} = require("../mail/templates/courseEnrollmentEmail");
const { default : mongoose  }= require("mongoose");

// capture the payments and   initiate the Razorpay order
exports.capturePayment = async (req, res) => {
  // get courseId  and UserId
  const { course_id } = req.body;
  const userId = req.user.id;
  //validation
  // valid courseId
 
    if (!course_id) {
      return res
        .json({ 
          success: true,
           message: "Please provide a valid course Id" });
    }

    //valid courseDetails
    let course;
    try {
      course = await Course.findById(course_id);
      if (!course) {
        return res.json({
          success: false,
          message: "could not find the course ",
        });
      }

      //user already pay for the same course
      const uid = new mongoose.Types.ObjectId(userId);
      if (course.studentsEnrolled.includes(uid)) {
        return res.status(200).json({
          success: false,
          message: " Student is already enrolled",
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    //order create

    const amount = course.price;
    const currency = "INR";
    const options = {
      amount: amount * 100,
      currency,
      receipt: Math.random(Date.noe()).toString(),
      notes: {
        courseId: course_id,
        userId,
      },
    };

    try {
      //initiate the payment using razorpay;
      const paymentResponse = await instance.orders.create(options);
      console.log(paymentResponse);
      
      //return res.
return res.status(200).json({
    success:true,
    courseName: course.courseName,
    courseDescription : course.courseDescription,
    thumbnail:course.thumbnail,
    orderId:paymentResponse.id,
    currency:paymentResponse.currency,
    amount: PaymentRequest.amount
})


    } catch (error) {
        console.log(error)
        return res.json({
            success:false,
            message:"cloud not initiate order",
        })
    }
};

//verify Signature of razorpay and server
exports.verifySignature = async(req,res)=>{


    const webhookSecret = "12345678";
    const signature = req.headers["x-razorpay-signature"];

    const shasum = crypto.createHmac("sha256",webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest =  shasum.digest("hex");

    if(signature === digest ){
        console.log("Payment is Authorised ");
        const {courseId,userId} = req.body.payload.entity.notes;
    
    try {
        //fulfill the action
//find the course and enroll the student in it 
const enrolledCourse = await Course.findByIdAndUpdate(
    {_id:courseId},
    {$push:{studentsEnrolled:userId}},
    {new:true},
);
if(!enrolledCourse){
    return res.status(500).json({
        success:false,
        message:"Course not Found"
    });
}
console.log(enrolledCourse)

//find the student andadd the course to their list enrolled course me 
const enrolledStudent = await User.findByIdAndUpdate(
    {_id:userId},
    {$push:{course:courseId}},
    {new:true},
)
console.log(enrolledStudent);

// mail send for confirmation 
const emailResponse =await mailSender(
    enrolledStudent.email,
    "Congratulation from codeHelp ",
    "Congratulation, you are onboarded into new codeHelp course",
);

console.log(emailResponse);
return res.status(200).json({
    success: true,
    message : "Signature Verified and Course Added"   
    });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message    
        })
    }
}
else{
     return res.status(400).json({
        success:false,
        message:"invalid request"
     })
}

}