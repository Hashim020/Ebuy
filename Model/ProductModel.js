const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  images: {
    type: Array,
  },
  category: {
    type:mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  price:{
    type:Number,
    required:true
  },offerprice:{
    type:Number,
    required:true
  },
  stock:{
    type:Number,
    required:true
  },

  is_Listed:{
    type:Boolean,
    default:true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;