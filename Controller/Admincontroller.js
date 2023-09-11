require('dotenv').config();
const User = require(process.env.UserURL);
const Order= require(process.env.OrderURL);
const bcrypt = require('bcrypt');
const Product= require(process.env.ProductURL);
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');



const securePassword = async(password)=>{
    try {
        
        const passwordHash =await bcrypt.hash(password,10)
        return passwordHash
    } catch (error) {
        console.log(error.message);
    }
}
const Loadadminlogin=async(req,res)=>{
    try {
        res.render("authentication-login")
    } catch (error) {
        console.log(error);
    }
}

const verifyLogin=async(req,res)=>{
    try {
        const email = req.body.email
        const password = req.body.password

        const userData = await User.findOne({email:email})

        if(userData){
            const passwordMatch = await bcrypt.compare(password,userData.password)
            if(passwordMatch){
                if(userData.is_admin===0){
                    res.render('authentication-login',{message:"No Admin Access"})
                }else{
                    req.session.admin_id = userData.name
                    res.redirect('/admin/home')
                }

            }else{
                res.render('authentication-login',{message:"Email and password is incorrect"})
            }

        }else{
            res.render('authentication-login',{message:"Email and password is incorrect"})
        }
    } catch (error) {
        console.log(error.message);
    }
}
const loadDashboard= async(req,res)=>{
    try {
        res.render('home')
    } catch (error) {
        console.log(error.message);
    }
}

const adminlogout=async (req,res)=>{
    try {
        req.session.destroy()
        res.redirect('/admin')
    } catch (error) {
        console.log(error.message);
    }
}


const loadusers= async (req,res)=>{
    
    try {
        const user= await User.find();
        res.render("UserMgmt",{user});
        
    } catch (error) {
        console.log(error);
    }
}

const blockuser= async (req,res)=>{
    try {
        const id=req.params.id
        await User.findByIdAndUpdate({_id:id},{$set:{status:true}})

      res.redirect("/admin/Usermanagement")
    } catch (error) {
        console.log(error);
    }
};


const unblockuser= async (req,res)=>{
    try {

      
        const id=req.params.id
        await User.findByIdAndUpdate({_id:id},{$set:{status:false}})
      res.redirect("/admin/Usermanagement")
    } catch (error) {
        console.log(error);
    }
};



const loadOrdermanagement = async (req, res) => {
    try {
        const Orders = await Order.find().populate('user'); // Use populate to retrieve user data

        res.render('ordermanagement', {Orders});
    } catch (error) {
        console.log(error);
    }
}

const moredetailedorder= async(req,res)=>{
    try {
        const orderId = req.params.id
      const order = await Order.findById(orderId)
      .populate('user')
      .populate("items.productId")
      .populate('address');
      console.log(order);
      res.render('Detailedvieworder',{order})
    } catch (error) {
      console.log(error);  
    }
}


const updateorderbyadmin =async (req,res)=>{
    try {
        
    } catch (error) {
        console.log(error);
    }
}










 module.exports={
    loadusers,
    Loadadminlogin,
    verifyLogin,
    loadDashboard,
    blockuser,
    unblockuser,
    adminlogout,
    loadOrdermanagement,
    moredetailedorder,
    updateorderbyadmin
 }