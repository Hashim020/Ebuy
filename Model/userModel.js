const mongoose = require("mongoose")


const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    mobile: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    is_admin: {
        type: Number,
        required: true
    },
    status: {
        type: Boolean,
        default: false
    },
    referralCode:{
        type:String,
        required:false
    },
    usedCoupons: [
        {
            code: {
                type: String,
                required: false,
            }
        }
    ],
})

module.exports = mongoose.model('User', userSchema)