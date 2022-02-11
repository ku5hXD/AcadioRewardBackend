const express = require('express')
const mongoose = require("mongoose");
const app = express()
const port = 3003
const connectionURL = "mongodb+srv://ku5h:ku5h@cluster0.4walf.mongodb.net/rewardDB?retryWrites=true&w=majority";
var User = require("./models/user");
var Reward = require('./models/reward');
var History = require("./models/history");
var Leaderboard = require("./models/leaderboard");

app.use(express.json())

mongoose.connect(connectionURL, { useNewUrlParser: true });
var conn = mongoose.connection;
conn.on('connected', function () {
    console.log('database is connected successfully');
});
conn.on('disconnected', function () {
    console.log('database is disconnected successfully');
})
conn.on('error', console.error.bind(console, 'connection error:'));



app.post('/getRewardData', async (req, res) => {

    try {
        const data = await Leaderboard.findOne({ uid: req.body.uid });
        const userXP = data.totalXP;

        const rewardData = await Reward.find({});
        let countLength = 0;

        rewardData.forEach(async (value, index, rewardData) => {
            const count = await History.countDocuments({ uid: req.body.uid, rid: value.rid, type: value.type });
            if (count === 0) {
                rewardData[index] = { ...value._doc, redeemed: false }
            }
            else {
                rewardData[index] = { ...value._doc, redeemed: true }
            }
            countLength++;
            if (countLength === rewardData.length) {
                const finalObj = {
                    userXP: userXP,
                    rewardData: rewardData
                }
                res.send(finalObj);
            }
        })
    }
    catch (e) {
        // res.sendStatus(e)
        console.log(e);
    }

})


app.post('/historyData', async (req, res) => {

    try {
        const historyData = await History.find({ uid: req.body.uid });
        // console.log(data)
        let countLength = 0;
        historyData.forEach(async (value, index, historyData) => {

            const rewardData = await Reward.findOne({ rid: value.rid, type: value.type })
            historyData[index] = { ...value._doc, name: rewardData.name, image: rewardData.image, requiredXP: rewardData.requiredXP }
            countLength++;
            if (countLength === historyData.length) {
                res.send(historyData);
            }
        })
    }
    catch (e) {
        res.send(e)
        console.log(e)
    }

})


app.post('/userRedeemedReward', async (req, res) => {

    try {

        if (req.body.type === "PhysicalThing") {
            // ziyyad bhai jose aa code
        }
        else if (req.body.type === "MoneyCard") {
            // increase user's deposit cash by 
        }

        // decreasing user's XP

        const requiredXPObj = await Reward.findOne({ rid: req.body.rid, type: req.body.type });
        const requiredXP = requiredXPObj.requiredXP;

        await Leaderboard.findOneAndUpdate({ uid: req.body.uid }, { $inc: { totalXP: -requiredXP } })


        // decreasing quantity in rewards collection

        await Reward.findOneAndUpdate({ rid: req.body.rid, type: req.body.type }, { $inc: { quantity: -1 } })

        // adding data to history collection

        var history = new History({
            uid: req.body.uid,
            rid: req.body.rid,
            type: req.body.type,
            date: new Date()
        })

        await history.save()

        res.send('success')

    }
    catch (e) {
        console.log(e)
        res.send(e)
    }

})





app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})