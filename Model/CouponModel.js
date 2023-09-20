const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true
    },
    discount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },
    dateOfStart: {
        type: Date,
        required: true
    },
    expirationDate: {
        type: Date,
        required: true
    },
    minimumPurchase: {
        type: Number,
        default: 0
    },
    maximumPurchase: {
        type: Number,
        default: null
    }
});

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
