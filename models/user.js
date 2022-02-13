const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    profile_pic: { type: String },
    total_cash_won: { type: Number },
    deposit_cash: { type: Number }
}, { collection: 'user' });

module.exports = mongoose.model('User', userSchema);
