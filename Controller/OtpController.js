require('dotenv').config();


const User = require('../Model/userModel')
const bcrypt = require('bcrypt')


const accountSid = process.env.accountSid;
const authToken = process.env.authToken
const verifySid = process.env.verifySid;

const client = require("twilio")(accountSid, authToken);


const Forgotpassword=async(req,res)=>{
    try {
        res.render('ForgotPW')
    } catch (error) {
        console.log(error);
    }
}

const forgotPWuserfind = async (req, res) => {
    let success = false;
    let retries = 1;
    while (!success && retries > 0) {
        try {
            const mobile = req.body.mobileNumber;
            const existingUser = await User.findOne({ mobile: mobile });
            
            if (existingUser) {
                const verification = await client.verify.v2.services(verifySid)
                .verifications.create({
                    to: `+91${mobile}`,
                    channel: "sms",
                    validityPeriod: 1000
                });
                
                console.log(verification.status);
                req.session.mobile = mobile;
                res.render("verifyrestPW", { mobile: mobile });
                success = true;
            } else {
                res.render("ForgotPW", { message: "No User Found" });
            }
        } catch (error) {
            console.error(error);
            retries--;
        }
    }

    if (!success) {
        res.status(500).send("Error sending verification code");
    }
};


const forgotPWotpVerify=async(req,res)=>{

    const { otp } = req.body;
try {
    const mobile =  req.session.mobile;
    console.log(mobile);
    if (!mobile) {
        res.render('verifyrestPW', { message: "User data not found" });
    } else {
        await client.verify.v2
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