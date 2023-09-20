const express = require('express')
const admin_route = express();
const bodyParser = require('body-parser');
admin_route.use(bodyParser.json())
admin_route.use(bodyParser.urlencoded({extended:true}))


const auth = require('../Middleware/Adminauth')

const adminControl = require('../Controller/Admincontroller') // importing admin controller to rute
const CategoryControl = require('../Controller/CatogoryController') // importing category controller to rute
const ProductControl = require('../Controller/Productcontroller') // importing product controller to rute
admin_route.set('view engine','ejs')  // Set the view engine for the admin_route to 'ejs'.
admin_route.set('views','./Views/Admin') // Set the views directory for the admin_route to './Views/Admin'.
admin_route.use(express.static('./views/Admin'))  // setting this folder as static and files can accessoble



admin_route.get('/',auth.isLogout,adminControl.Loadadminlogin); // login page loading whether admin loged in or not
admin_route.post('/',adminControl.verifyLogin)// admin credential verify
admin_route.get("/adminlogout",adminControl.adminlogout)


admin_route.get('/home',auth.isLogin,adminControl.loadDashboard)
admin_route.get('/Catogory',auth.isLogin,CategoryControl.Loadcatogory)// for loading category page
admin_route.post('/addcatogory',auth.isLogin,CategoryControl.addcatogory); // for addeing new category
admin_route.get('/Editcatgory/:id',auth.isLogin,CategoryControl.Editcatgory); // for editting
admin_route.post('/submitedit',auth.isLogin,CategoryControl.submiteditcatgory); // for submitting edit





admin_route.get('/Productmmgmt',auth.isLogin,ProductControl.Loadproduct); // for addeing new category
admin_route.get('/addporductform',auth.isLogin,ProductControl.Loadprodutaddform);
admin_route.post('/saveproduct',auth.isLogin,ProductControl.addProduct);
admin_route.get('/unlistproduct/:id',auth.isLogin,ProductControl.unlistproducts);
admin_route.get('/relistproduct/:id',auth.isLogin,ProductControl.relistproducts);
admin_route.get('/editproduct/:id',auth.isLogin,ProductControl.producteditform);
admin_route.post('/proceedtoeditproduct/:id',auth.isLogin,ProductControl.Proceedtoeditprdct);






admin_route.get('/Usermanagement',auth.isLogin,adminControl.loadusers)
admin_route.get('/blockuser/:id',auth.isLogin,adminControl.blockuser)
admin_route.get('/unblockuser/:id',auth.isLogin,adminControl.unblockuser)






admin_route.get('/Order-management',auth.isLogin,adminControl.loadOrdermanagement)
admin_route.get('/order-details/:id',auth.isLogin,adminControl.moredetailedorder);
admin_route.post('/order-updatebyadmin',auth.isLogin,adminControl.updateOrderStatusByAdmin);





admin_route.get('/Coupon-Management',auth.isLogin,adminControl.GetCouponManagement);
admin_route.post('/save_coupon',auth.isLogin,adminControl.postCoupon);


module.exports=admin_route;