const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true
    },
    balance: {
        type: Number,
    },
    transactions: [
        {

            orderId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Order', // Reference to the Order model
                required: false
            },
            TransactioName:{
                type:String,
                required:false,
            },
            Amount: {
                type: Number,
                required: false,
            },
            transactionstype: {
                type: String,
                enum: ['Debit', 'Credit'],
                required: false,
            },
            transactionsDate: {
                type: Date,
                default: Date.now,
            },

        }
    ]
});

const Wallet = mongoose.model('Wallet', walletSchema);

module.exports = Wallet;
