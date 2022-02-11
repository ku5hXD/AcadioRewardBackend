const mongoose = require('mongoose');

const leaderboardSchema = mongoose.Schema({
    uid: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    contest_winners: { type: Number },
    contest_participants: { type: Number },

    pool_winners: { type: Number },
    pool_participants: { type: Number },

    challenge_winners: { type: Number },
    challenge_participants: { type: Number },

    challenge_created: { type: Number },

    totalXP: { type: Number },

}, { collection: 'leaderboard' });

module.exports = mongoose.model('Leaderboard', leaderboardSchema);
