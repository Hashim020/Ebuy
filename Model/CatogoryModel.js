const mongoose = require('mongoose');

// Define the Category schema
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  }
});

// Create a Category model based on the schema
const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
