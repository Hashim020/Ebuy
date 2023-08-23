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


admin_route.get('/home',auth.isLogin,adminControl.loadDashboard)
admin_route.get('/Catogory',auth.isLogin,CategoryControl.Loadcatogory)// for loading category page
admin_route.post('/addcatogory',auth.isLogin,CategoryControl.addcatogory); // for addeing new category
admin_route.get('/deletecategory/:_id',auth.isLogin,CategoryControl.updateCategory); // for addeing new category





admin_route.get('/Productmmgmt',auth.isLogin,ProductControl.Loadproduct); // for addeing new category
admin_route.get('/addporductform',auth.isLogin,ProductControl.Loadprodutaddform);
admin_route.post('/saveproduct',auth.isLogin,ProductControl.addProduct);






admin_route.get('/Usermanagement',auth.isLogin,adminControl.loadusers)
admin_route.get('/blockuser/:id',auth.isLogin,adminControl.blockuser)
admin_route.get('/unblockuser/:id',auth.isLogin,adminControl.unblockuser)








module.exports=admin_route;