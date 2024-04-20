const express = require("express")
const router = express.Router()

const {contactUsController} = require("../controllers/ContactUs")


route.post("/contact",contactUsController)

module.exports = router