const Reward = require('../models/rewardsModel')

const initRewardsScheme = async () => {
    
    const count = await Reward.countDocuments();
    
    if (count > 0) {
        console.log("Rewards table already initialized")
        return
    }

    const yoga = [
        { reward: "1 Group Class Drop-in", pointRequired: 2500 },
        { reward: "1-week unlimited Class Tickets", pointRequired: 10000 },
        { reward: "1 Month Unlimited", pointRequired: 15000 },
        { reward: "Healthy Day", pointRequired: 12500 },
        { reward: "Healthy Morning/ Afternoon", pointRequired: 5000 },
        { reward: "Private Class 1-on-1", pointRequired: 12500 }
    ]

    const fnb = [
        {reward: "Free Breakfast or Dinner Set", pointRequired: 2500},
        {reward: "Free Signature Juices or Smoothies", pointRequired: 1000},
        {reward: "Free Coffee or Tea", pointRequired: 700},
        {reward: "Free Raw Cheesecake", pointRequired: 1000},
    ]

    const vitaSpa = [
        {reward: "Any massages/Treatments 60mn", pointRequired: 10000},
        {reward: "Any massages/Treatments 90mn", pointRequired: 12500},
        {reward: "Free upgrade 30 min massage", pointRequired: 2500},
    ]

    const retreats = [
        {reward: "Room upgrade", pointRequired: 10000},
        {reward: "Free room night", pointRequired: 15000},
    ]

    for (const entry of yoga) {
        await Reward.updateOne(
            { "yogaRewards.reward": entry.reward },
            { $set: { "yogaRewards.pointRequired": entry.pointRequired, "yogaRewards.reward": entry.reward } },
            { upsert: true }
        )
    }

    for (const entry of fnb) {
        await Reward.updateOne(
            { "fnbRewards.reward": entry.reward },
            { $set: { "fnbRewards.pointRequired": entry.pointRequired, "fnbRewards.reward": entry.reward } },
            { upsert: true }
        )
    }

    for (const entry of vitaSpa) {
        await Reward.updateOne(
            { "vitaSpaRewards.reward": entry.reward },
            { $set: { "vitaSpaRewards.pointRequired": entry.pointRequired, "vitaSpaRewards.reward": entry.reward } },
            { upsert: true }
        )
    }

    for (const entry of retreats) {
        await Reward.updateOne(
            { "retreatRewards.reward": entry.reward },
            { $set: { "retreatRewards.pointRequired": entry.pointRequired, "retreatRewards.reward": entry.reward } },
            { upsert: true }
        )
    }
    
    console.log("Rewards initialized successfully");
}

module.exports = initRewardsScheme