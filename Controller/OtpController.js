const { maxBy } = require('lodash');
const User = require('../Model/userModel')
const bcrypt = require('bcrypt')


const accountSid = "AC699517caf31d78c53afb0c00b86d7695";
const authToken = "e51d0aaad990711ac3748388532cf253";
const verifySid = "VAc36e2459b3afde13af45d3d4536e4eb5";
const client = require("twilio")(accountSid, authToken);


const Forgotpassword=async(req,res)=>{
    try {
        res.render('ForgotPW')
    } catch (error) {
        console.log(error);
    }
}

const forgotPWuserfind=async(req,res)=>{
    
    try {

        const mobile = req.body.mobileNumber
        req.session.mobile=mobile

    const existingnumber=await User.findOne({mobile:mobile})
    if(existingnumber){
        
        client.verify.v2
        .services(verifySid)
        .verifications.create({ to: `+91${mobile}`, channel: "sms", })
        .then((verification) => {
            console.log(verification.status)
            res.render("verifyrestPW",{mobile:mobile})
        })
        .catch((error) => {
            console.log(error.message)
        });
    }else{

        res.render("ForgotPW",{message:"No User Found"})
    }
        
    } catch (error) {
        console.log(error);
        
    }
}

const forgotPWotpVerify=async(req,res)=>{

    const { otp } = req.body;
try {
    const mobile =  req.session.mobile;
    console.log(mobile);
    if (!mobile) {
        res.render('verifyrestPW', { message: "User data not found" });
    } else {
        client.verify.v2
        .services(verifySid)
        .verificationChecks.create({ to: `+91${mobile}`, code: otp })
        .then(async (verification_check) => {
            console.log(verification_check.status);

            if (verification_check.status === 'approved') {
                // Correct OTP, proceed to change password
                res.render("ChangePW",{message:"Enter new password"})
            } else {
                // Wrong OTP, show an error message
                res.render('verifyrestPW', { message: "Invalid OTP, please try again" });
            }
        })
        .catch((error) => {
            console.log(error.message);
            res.render('verifyrestPW', { message: "An error occurred while verifying OTP" });
        });
    }
} catch (error) {
    console.log(error.message);
    res.render('verifyrestPW', { message: "An error occurred" });
}
}


const newpasswordconfirm = async (req, res) => {
    
    try {
        const newPassword = req.body.password; // Retrieve the new password from the form data
   const mobile=  req.session.mobile;
   console.log(mobile);
      if (mobile) {
        // Find the user in the database based on mobile number
        const user = await User.findOne({ mobile: mobile });

        if (user) {
          // Hash the new password before updating
          const hashedPassword = await bcrypt.hash(newPassword, 10);
  
          // Update the user's encrypted password
          user.password = hashedPassword;
          await user.save(); // Save the updated user document
  
          // Handle a successful password update response here
          res.redirect('/',);
        } else {
          res.render('ChangePW', { message: 'User not found' });
        }
      } else {
        res.render('ChangePW', { message: 'Not authorized' });
      }
    } catch (error) {
      // Handle errors
      console.error(error);
      res.render('ChangePW', { message: 'Internal server error' });
    }
  };

  module.exports={
    Forgotpassword,
    forgotPWuserfind,
    forgotPWotpVerify,
    newpasswordconfirm,
  }