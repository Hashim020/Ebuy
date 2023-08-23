const User = require('../Model/userModel')
const Category = require('../Model/CatogoryModel');

const bcrypt = require('bcrypt')


const accountSid = "AC699517caf31d78c53afb0c00b86d7695";
const authToken = "e51d0aaad990711ac3748388532cf253";
const verifySid = "VAc36e2459b3afde13af45d3d4536e4eb5";
const client = require("twilio")(accountSid, authToken);


const securePassword = async(password)=>{
    try {
        
        const passwordHash =await bcrypt.hash(password,10)
        return passwordHash
    } catch (error) {
        console.log(error.message);
    }
}

const loadHome = async(req,res)=>{
    try {
        const categories= await Category.find().sort({name:1}) 
        // console.log(catagories)
        res.render("main",{categories})
    } catch (error) {
        console.log(error.message);
    }
}

const userLogout = async(req,res)=>{
    try {
        req.session.destroy();
        res.redirect('/')
    } catch (error) {
        console.log(error.message);
    }

}

const loadregister = async(req,res)=>{
    try{
        res.render('Register');
    }catch(error){
        console.log(error.message);
    }
}

const validation = async (req,res) =>{
    // console.log(req.body);


    const mobile = req.body.mobileNumber
    const email = req.body.email;
    const existingUser = await User.findOne({email:email})
    const existingnumber=await User.findOne({mobile:mobile})
    if (existingUser) {
        return res.render("Register", { message: "Email already exists" })
    }
    if(existingnumber){
        return res.render("Register",{message:"Phone Number Already Exist"})
    }
    client.verify.v2
        .services(verifySid)
        .verifications.create({ to: `+91${mobile}`, channel: "sms", validityPeriod:120})
        .then((verification) => {
            console.log(verification.status)
            req.session.user = req.body
            res.render('verifyOtp',{mobile})
        })
        .catch((error) => {
            console.log(error.message)
        })
}




const insertUser = async (req, res) => {
    const { otp } = req.body;
    
    try {
        const userDatas = req.session.user; // Change 'userData' to 'user'
        
        if (!userDatas) {
            res.render('verifyOtp', { message: "User data not found" });
        } else {
            client.verify.v2
                .services(verifySid)
                .verificationChecks.create({ to: `+91${userDatas.mobileNumber}`, code: otp })
                .then(async (verification_check) => {
                    console.log(verification_check.status);
                    const spasswords = await securePassword(userDatas.password);
              
                    const user = new User({
                        name: userDatas.name,
                        email: userDatas.email,
                        mobile: userDatas.mobileNumber,
                        password: spasswords,
                        is_admin: 0
                    });
                    try {
                        const userDataSave = await user.save();
                        if (userDataSave) {
                            res.redirect('/');
                        } else {
                            res.render('Register', { message: "Registration Failed" });
                        }
                    } catch (error) {
                        console.log(error.message);
                        res.render('Register', { message: "Registration Failed" });
                    }
                })
                .catch((error) => {
                    console.log(error.message);
                });
        }
    } catch (error) {
        console.log(error.message);
    }
};




const loadlogin = async(req,res)=>{
    try {
        res.render('Login')
    } catch (error) {
        console.log(error);
    }
}





const verifyLogin = async(req,res)=>{
    try {
        const email = req.body.email
        const password = req.body.password
        
        const userData =await User.findOne({email:email})
        if(userData){
            if(userData.status===false){
            const passwordMatch = await bcrypt.compare(password,userData.password)
            if(passwordMatch){
                console.log(passwordMatch);// checking password match or not
                req.session.user_id = userData._id
                // console.log(req.session.user_id);
                res.redirect('/')

            }else{
                res.render('login',{message:"Email and Password are Incorrect"});
        }}else{
            res.render("login",{message:"Your are blocked"})
        }   
        }else{
            res.render('login',{message:"Email and Password are Incorrect"});
        }
        
    } catch (error) {
        console.log(error.message);
    }
}




const ProfileLoad= async (req,res)=>{
    try {
        
        const _id= req.session.user_id;
        const userData =await User.findOne({_id:_id})
        // console.log(userData);
        if(userData){
            res.render('userProfile',{userData})
        }else{
            res.redirect('/?alert=true')
        }
    } catch (error) {
        
    }
}













  
module.exports={
loadlogin,
loadHome,
loadregister,
insertUser,
verifyLogin,
userLogout,
validation,
ProfileLoad,
}