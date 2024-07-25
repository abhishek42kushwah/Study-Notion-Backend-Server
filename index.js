const express = require("express");
const app = express();
const userRouter =require("./routes/User");
const profileRouter =require("./routes/Profile");
const paymentRouter =require("./routes/Payments");
const courseRouter =require("./routes/Course");
const contactUsRoute = require("./routes/ContactUs");
const database = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const {cloudinaryConnect} =require("./config/cloudinary");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");
// const { connection } = require("mongoose");

dotenv.config();
const PORT = process.env.PORT || 4000;

// connection mongoose 
database.connect();

// middleware
app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin:"http://localhost:3000",
        credentials:true,
    })
)


app.use(
    fileUpload({
        useTempFiles:true,
        tempFileDir:"/tmp"
    })
)

// cloudinaryConnection
cloudinaryConnect();

// routes
app.use("/api/v1/auth",userRouter)
app.use("/api/v1/payment",paymentRouter)
app.use("/api/v1/profile",profileRouter)
app.use("/api/v1/course",courseRouter)
app.use("/api/v1/reach", contactUsRoute);

// def routes
app.get("/",(req,res)=>{
    return res.json({
        success:true,
        message:"Your server is up running..."
    })
})

app.listen(PORT,()=>{
    console.log(`App is running at ${PORT}`)
})