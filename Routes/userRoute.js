const express = require('express')
const user_route = express();

const bodyParser = require('body-parser')
user_route.use(bodyParser.json())
user_route.use(bodyParser.urlencoded({extended:true}))
const session = require('express-session')
const userController = require("../Controller/Usercontroller")
const OtpController = require("../Controller/OtpController")
const auth = require('../Middleware/auth');
user_route.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));


user_route.set('view engine','ejs')
user_route.set('views','./Views/User')

user_route.get('/',userController.loadHome)
user_route.get('/login',userController.loadlogin)
user_route.get('/logout',userController.userLogout)
user_route.post('/verifylogin',userController.verifyLogin)
user_route.get('/MyAccount',userController.ProfileLoad)


user_route.get('/forgotpw',OtpController.Forgotpassword);
user_route.post('/verifuserforgotPW',OtpController.forgotPWuserfind);
user_route.post('/verifyresetpw',OtpController.forgotPWotpVerify);
user_route.post('/newpasswordconfirm',OtpController.newpasswordconfirm);



user_route.get('/register',userController.loadregister)
user_route.post('/verify',userController.validation)
user_route.post('/register',userController.insertUser)



module.exports=user_route