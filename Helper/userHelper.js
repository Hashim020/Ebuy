require('dotenv').config();
const User = require('../Model/userModel')
const Category = require('../Model/CatogoryModel');
const Address= require('../Model/AddressModel');
const Cart=require('../Model/CartModel');
const Order=require('../Model/OrderModel');
const Product = require('../Model/ProductModel');
const mongoose = require('mongoose');
const Razorpay=require('razorpay');
const { Reject } = require('twilio/lib/twiml/VoiceResponse');


const keyid=process.env.KEY_ID;
const secretid=process.env.SECRET_ID;
var instance = new Razorpay({
  key_id:keyid,
  key_secret:secretid,
});


module.exports={
    generateRazorpay : async (orderId, total) => {
        return new Promise((resolve, reject) => {
            const options = {
                amount: total*100, // amount in paise (Razorpay expects amount in smallest currency unit)
                currency: "INR",
                receipt: orderId.toString()
            };
            instance.orders.create(options, function (err, order) {
                if (err) {
                    console.error("Error creating Razorpay order:", err);
                    reject(err);
                } else {
                    console.log('Razorpay order created:', order);
                    resolve(order);
                }
            });
        });
    },
}