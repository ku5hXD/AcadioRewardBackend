const express = require('express')
const mongoose = require("mongoose");
const { customAlphabet } = require('nanoid')
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




const nanoid = customAlphabet('1234567890', 10)
app.post('/addReward', (req, res) => {

    const rewardObj = new Reward({
        type: req.body.type,
        rid: nanoid(),
        name: req.body.name,
        image: req.body.image,
        property: req.body.property,
        amount: req.body.amount,
        requiredXP: req.body.requiredXP,
        expired: req.body.expired,
        quantity: req.body.quantity,
        expiredDate: new Date(req.body.expiredDate)
    })
    rewardObj.save();
    res.send('success')
})



app.post('/getRewardData', async (req, res) => {

    try {
        const data = await Leaderboard.findOne({ uid: req.body.uid });
        const userXP = data.totalXP;

        var rewardData = await Reward.find({}).sort({ expired: 1, requiredXP: -1 }).skip(req.body.mid);
        // 4 --> number of data you want per request
        rewardData = rewardData.slice(0, 4)

        if (rewardData.length === 0) {
            res.send([])
        }
        else {
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

    }
    catch (e) {
        // res.sendStatus(e)
        console.log(e);
    }

})


app.post('/historyData', async (req, res) => {

    try {
        // 4 (in limit) --> number of data you want per request
        const historyData = await History.find({ uid: req.body.uid }).skip(req.body.mid).limit(4)
        // console.log(historyData)
        if (historyData.length === 0) {
            res.send([])
        }
        else {
            let countLength = 0;
            historyData.forEach(async (value, index, historyData) => {

                const rewardData = await Reward.findOne({ rid: value.rid, type: value.type })
                historyData[index] = { ...value._doc, rewardName: rewardData.name, rewardImage: rewardData.image, requiredXP: rewardData.requiredXP }
                countLength++;
                if (countLength === historyData.length) {
                    res.send(historyData);
                }
            })
        }

    }
    catch (e) {
        res.send(e)
        console.log(e)
    }

})


app.post('/userRedeemedReward', async (req, res) => {

    try {

        const rewardObj = await Reward.findOne({ rid: req.body.rid, type: req.body.type });
        const requiredXP = rewardObj.requiredXP;

        if (req.body.type === "PhysicalThing") {
            // ziyyad bhai jose aa code
        }
        else if (req.body.type === "MoneyCard") {
            // increase user's deposit cash by amount
            await User.findOneAndUpdate({ _id: req.body.uid }, { $inc: { deposit_cash: rewardObj.amount } })
        }

        // decreasing user's XP

        await Leaderboard.findOneAndUpdate({ uid: req.body.uid }, { $inc: { totalXP: -requiredXP } })


        // decreasing quantity in rewards collection

        await Reward.findOneAndUpdate({ rid: req.body.rid, type: req.body.type }, { $inc: { quantity: -1 } })

        // adding data to history collection
        const userData = await User.findOne({ _id: req.body.uid });

        var history = new History({
            uid: req.body.uid,
            user_name: userData.name,
            profile_pic: userData.profile_pic,
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