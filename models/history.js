const mongoose = require('mongoose');

const historySchema = mongoose.Schema({
    uid: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, ref: 'Reward', required: true },
    rid: { type: String, ref: 'Reward', required: true },
    date: { type: Date, required: true }
}, { collection: 'history' });

module.exports = mongoose.model('History', historySchema);
