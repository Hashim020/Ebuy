require('dotenv').config();
const express = require('express')
const user_route = express();

const bodyParser = require('body-parser')
user_route.use(bodyParser.json())
user_route.use(bodyParser.urlencoded({extended:true}))
const session = require('express-session')
const userController = require("../Controller/Usercontroller")
const OtpController = require("../Controller/OtpController")
const ProductControl = require('../Controller/Productcontroller')
const cartcontroller=require('../Controller/Cartcontroller')
const addresscontroller=require('../Controller/Addresscontroller')
const auth = require('../Middleware/auth');
const userHelper=require('../Helper/userHelper');
user_route.use(session({
    secret: process.env.UserSessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie:{
        maxAge:24*60*60*1000 
    }
}));


user_route.set('view engine','ejs')
user_route.set('views','./Views/User')

user_route.get('/',userController.loadHome)
user_route.get('/login',userController.loadlogin)
user_route.get('/logout',userController.userLogout)
user_route.post('/verifylogin',userController.verifyLogin)
user_route.get('/MyAccount',auth.requireSignIn,userController.ProfileLoad)
user_route.get('/MyAccount-address',auth.requireSignIn,addresscontroller.Loadaddressmngmnt);
user_route.post('/save-address',auth.requireSignIn,addresscontroller.saveaddress)
user_route.post('/save-address-checkout',auth.requireSignIn,addresscontroller.saveaddresscheckout);
user_route.get('/Order-histoty',auth.requireSignIn,userController.loadorderhistory);
user_route.get('/view-more/:id',auth.requireSignIn,userController.OrderMoreDetails);
user_route.post('/update-profile',auth.requireSignIn,userController.profileEdit);
user_route.patch('/update-password',auth.requireSignIn,userController.profilePWchange);
user_route.get('/My-Wallet',auth.requireSignIn,userController.getMywallet);




user_route.get('/forgotpw',OtpController.Forgotpassword);
user_route.post('/verifuserforgotPW',OtpController.forgotPWuserfind);
user_route.post('/verifyresetpw',OtpController.forgotPWotpVerify);
user_route.post('/newpasswordconfirm',OtpController.newpasswordconfirm);



user_route.get('/register',userController.loadregister)
user_route.post('/verify',userController.validation)
user_route.post('/register',userController.insertUser)


user_route.get("/showproducts/:id",ProductControl.listprocuts);
user_route.get("/viewproducts/:id",ProductControl.viewproducts);
user_route.post("/search-items",ProductControl.searchproducts);


user_route.get("/view-cart",cartcontroller.loadcart);
user_route.post("/add-to-cart/:id",auth.isLogin,cartcontroller.addToCart)
user_route.put('/editQuantity',auth.requireSignIn,cartcontroller.editQuantity);
user_route.delete('/deleteProduct',auth.requireSignIn,cartcontroller.deleteProduct);




user_route.get('/Checkout',auth.requireSignIn,userController.loadcheckout);
user_route.post('/Applycoupen',auth.requireSignIn,userController.Applycoupen);
user_route.get('/place-order-thankyou',userController.thankyouorderplaced)
user_route.post('/place-order',auth.requireSignIn,userController.orderplace);
user_route.post('/cancel_order',auth.requireSignIn,userController.cancelOrder);
user_route.post('/verify-payment', (req, res) => {
    userHelper.Paymentverify(req)
        .then((message) => {
            if (message === 'HMAC matches') {
                console.log("HMAC matches");
                res.json({ success: true });
            } else {
                console.log("HMAC does not match");
                res.json({ success: false });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            res.status(500).json({ success: false, message: 'Error verifying payment' });
        });
});


userController.updateCouponStatus();


module.exports = user_route;