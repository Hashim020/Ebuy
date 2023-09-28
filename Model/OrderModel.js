const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  OrderId:{
    type:String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  address: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address',
    required: true,
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      total: {
        type: Number,
        required: true,
      },
    },
  ],
  total: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered','CANCELLED',"Return-Req",'Return Accepted'],
    default: 'Pending',
  },
  subTotal:{
    type: Number,
    required: true,
  },
  discountAmount:{
    type:Number,
    required:false
  },
  discountCoupon:{
    type: String,
    required:false
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Payment Failed','Unpaid'],
    default: 'Unpaid',
  },
  paymentId: {
    type: String, // Assuming your payment ID is a string, you can adjust the type accordingly
    required: false, // Adjust as per your requirements
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
