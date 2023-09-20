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

    Paymentverify: async (details) => {
        console.log(details.body);
    
        try {
            const crypto = require('crypto');
            let hmac = crypto.createHmac('sha256', secretid);
            hmac.update(details.body.response.razorpay_order_id + '|' + details.body.response.razorpay_payment_id);
            hmac = hmac.digest('hex');
    
            if (hmac == details.body.response.razorpay_signature) {
                console.log('success payment');
                const orderId = details.body.responseObj.receipt;
                const paymentStatus = 'Paid'; // Assuming this is how you indicate a successful payment
                await Order.findByIdAndUpdate(orderId, { paymentStatus });
                return 'HMAC matches'; // Send a success message
            } else {
                const orderId = details.body.responseObj.receipt;
                const paymentStatus = 'Payment Failed'; // Assuming this is how you indicate a failed payment
                await Order.findByIdAndUpdate(orderId, { paymentStatus });
                throw new Error('HMAC does not match'); // Send an error message
            }
        } catch (error) {
            throw error;
        }
    }
    
    
    
    
    

   
}


