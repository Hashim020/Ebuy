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
user_route.get('/MyAccount-address',addresscontroller.Loadaddressmngmnt);
user_route.post('/save-address',addresscontroller.saveaddress)
user_route.post('/save-address-checkout',addresscontroller.saveaddresscheckout);
user_route.get('/Order-histoty',userController.loadorderhistory)



user_route.get('/forgotpw',OtpController.Forgotpassword);
user_route.post('/verifuserforgotPW',OtpController.forgotPWuserfind);
user_route.post('/verifyresetpw',OtpController.forgotPWotpVerify);
user_route.post('/newpasswordconfirm',OtpController.newpasswordconfirm);



user_route.get('/register',userController.loadregister)
user_route.post('/verify',userController.validation)
user_route.post('/register',userController.insertUser)


user_route.get("/showproducts/:id",ProductControl.listprocuts)
user_route.get("/viewproducts/:id",ProductControl.viewproducts)


user_route.get("/view-cart",cartcontroller.loadcart);
user_route.post("/add-to-cart/:id",auth.isLogin,cartcontroller.addToCart)
user_route.put('/editQuantity',cartcontroller.editQuantity);
user_route.delete('/deleteProduct',cartcontroller.deleteProduct);




user_route.get('/Checkout',userController.loadcheckout);
user_route.get('/place-order-thankyou',userController.thankyouorderplaced)
user_route.post('/place-order',userController.orderplace);
user_route.post('/cancel_order',userController.cancelOrder)



module.exports = user_route;