require('dotenv').config();
const User = require(process.env.UserURL)
const Category = require(process.env.CategoryURL);
const Address= require(process.env.AddressURL);
const Cart=require(process.env.CartURL);
const Order=require(process.env.OrderURL);
const Product = require(process.env.ProductURL);
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');



const accountSid = process.env.accountSid;
const authToken = process.env.authToken;
const verifySid = process.env.verifySid;
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
    req.session.user = req.body
    const existingUser = await User.findOne({email:email})
    const existingnumber=await User.findOne({mobile:mobile})
    if (existingUser) {
        return res.render("Register", { message: "Email already exists" })
    }
    if(existingnumber){
        return res.render("Register",{message:"Phone Number Already Exist"})
    }
   await client.verify.v2
        .services(verifySid)
        .verifications.create({ to: `+91${mobile}`, channel: "sms",})
        .then((verification) => {
            console.log(verification.status)
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
                .verificationChecks.create({ to: `+91${userDatas.mobileNumber}`, code: otp,  validityPeriod:1000 })
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
        if(req.session.user_id){
            res.redirect('/')
        }else
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
            res.redirect('login')
        }
    } catch (error) {
        console.log(error);
    }
}


const loadcheckout=async (req,res)=>{
    try {
        const id=req.session.user_id
        const user=req.session.user_id
        const categories=await Category.find()
        const address= await Address.find({userId:id});
        let cartTotal = 0;
        
        const total = await Cart.findOne({user:user});
        if(total){
            cartTotal = total.cartTotal;
        }
        const cart = await Cart.aggregate([
            {
              $match: {user: new mongoose.Types.ObjectId(user)}
            },
            
            { 
              $unwind: "$cartItems"
            },
            {
              $project:{
                item:{$toObjectId:("$cartItems.productId")},
                quantity:"$cartItems.quantity",
                total:"$cartItems.total"
              }
            }, 
            {
              $lookup: {
                from: "products",
                localField: "item",
                foreignField: "_id",
                as: "carted"
              }
            },
            {
              $project: {
                item: 1,
                quantity: 1,
                total: 1,
                carted: { $arrayElemAt: ["$carted", 0] }
              }
            }
          ]);
        
        console.log(cart);
        res.render('checkout',{categories,address,cart,cartTotal})
    } catch (error) {
        
        console.log(error);
    }
}




const orderplace = async (req, res) => {
    try {
      const userId = req.session.user_id;
      const addressId = req.body.addressId;
      let paymentMethod = req.body.paymentMethod;
      if(paymentMethod==='payment-2'){
        paymentMethod='Cash On Delivery'
      }

      // Find the user's cart
      const userCart = await Cart.findOne({ user: userId });
  
      if (!userCart || !userCart.cartItems.length) {
        throw new Error('User cart is empty or not found');
      }
  
      // Find the selected address
      const orderAddress = await Address.findById(addressId);
  
      // Create an array of promises to fetch product details and update stock
      const productPromises = userCart.cartItems.map(async (item) => {
        const product = await Product.findById(item.productId);
        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }
  
        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product with ID ${item.productId}`);
        }
  
        // Calculate the total and update stock
        const total = item.quantity * product.price;
        product.stock -= item.quantity;
        await product.save();
  
        return {
          productId: item.productId,
          quantity: item.quantity,
          total: total,
        };
      });
  
      // Use Promise.all() to wait for all product details and stock updates
      const items = await Promise.all(productPromises);
  
      // Calculate the subTotal and total
      const subTotal = items.reduce((total, item) => total + item.total, 0);
      const total = subTotal; // You can add shipping costs or taxes if needed
  
      // Create the order document
      const newOrder = new Order({
        user: userId,
        address: addressId,
        items: items,
        total: total,
        subTotal: subTotal,
        paymentMethod: paymentMethod,
      });
  
      // Save the order to the database
      await newOrder.save();
  
      // Clear the user's cart
      if (userCart) {
        await Cart.deleteOne({ user: userId });
        res.json({ success: true });
      } 
    //   res.redirect('http://localhost:3000/place-order-thankyou');
    } catch (error) {
      console.error(error.message);
      console.log(error);
    }
  };


  const thankyouorderplaced =async (req,res)=>{
    try {
        res.render('thankyou');
    } catch (error) {
        console.log(error);
    }
  }


  const loadorderhistory = async (req, res) => {
    try {
      const userId = req.session.user_id;
      const userData = await User.findOne({ _id: userId });
      const orders = await Order.find({ user: userId }).populate('address');
  
      const ordersWithProductDetails = await Promise.all(orders.map(async (order) => {
        const populatedItems = await Promise.all(order.items.map(async (item) => {
          const product = await Product.findById(item.productId);
          return {
            ...item.toObject(),
            productDetails: product ? product.toObject() : null,
          };
        }));
  
        return {
          ...order.toObject(),
          items: populatedItems,
        };
      }));
  
      res.render('orderhistory', { userData, orders: ordersWithProductDetails });
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  };


  const cancelOrder = async (req, res) => {
    try {
      const orderId = req.body.order_id;
  
      // Update Order Status
      await Order.findByIdAndUpdate(orderId, { status: 'CANCELLED' });
  
      // Retrieve Order Details
      const order = await Order.findById(orderId);
      const items = order.items;
  
      // Increase Product Stock
      items.forEach(async (item) => {
        const product = await Product.findById(item.productId);
        product.stock += item.quantity; // Assuming there's a 'stock' property in the Product schema
        await product.save();
      });
  
      res.redirect('http://localhost:3000/Order-histoty'); // Redirect to order history page after cancelling
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
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
loadcheckout,
orderplace,
thankyouorderplaced,
loadorderhistory,
cancelOrder,
}