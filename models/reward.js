const mongoose = require('mongoose');

const rewardSchema = mongoose.Schema({
    type: { type: String, required: true },
    rid: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    image: { type: String },
    property: { type: Object },
    requiredXP: { type: Number, required: true },
    amount: { type: Number },
    expired: { type: Boolean, required: true },
    quantity: { type: Number },
    expiredDate: { type: Date }
}, { collection: 'reward' });

module.exports = mongoose.model('Reward', rewardSchema);
