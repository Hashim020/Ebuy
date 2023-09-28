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
            Amount: {
                type: Number,
                required: false,
            },
            transactionstype: {
                type: String,
                enum: ['Debit', 'Credit'],
                required:false,
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
