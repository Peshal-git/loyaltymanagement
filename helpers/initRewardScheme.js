const Reward = require('../models/rewardsModel')

const initRewardsScheme = async () => {
    
    const count = await Reward.countDocuments();
    
    if (count > 0) {
        console.log("Rewards table already initialized")
        return
    }

    const yPoints = [
        { yRewards: "1 Group Class Drop-in", yPointRequired: 2500 },
        { yRewards: "1-week unlimited Class Tickets", yPointRequired: 10000 },
        { yRewards: "1 Month Unlimited", yPointRequired: 15000 },
        { yRewards: "Healthy Day", yPointRequired: 12500 },
        { yRewards: "Healthy Morning/ Afternoon", yPointRequired: 5000 },
        { yRewards: "Private Class 1-on-1", yPointRequired: 12500 }
    ]

    const fPoints = [
        {fbRewards: "Free Breakfast or Dinner Set", fbPointRequired: 2500},
        {fbRewards: "Free Signature Juices or Smoothies", fbPointRequired: 1000},
        {fbRewards: "Free Coffee or Tea", fbPointRequired: 700},
        {fbRewards: "Free Raw Cheesecake", fbPointRequired: 1000},
    ]

    const vPoints = [
        {vsRewards: "Any massages/Treatments 60mn", vsPointRequired: 10000},
        {vsRewards: "Any massages/Treatments 90mn", vsPointRequired: 12500},
        {vsRewards: "Free upgrade 30 min massage", vsPointRequired: 2500},
    ]

    const rPoints = [
        {rRewards: "Room upgrade", rPointRequired: 10000},
        {rRewards: "Free room night", rPointRequired: 15000},
    ]

    for (const entry of yPoints) {
        await Reward.updateOne(
            { "yogaRewards.yRewards": entry.yRewards },
            { $set: { "yogaRewards.yPointRequired": entry.yPointRequired, "yogaRewards.yRewards": entry.yRewards } },
            { upsert: true }
        )
    }

    for (const entry of fPoints) {
        await Reward.updateOne(
            { "fnbRewards.fbRewards": entry.fbRewards },
            { $set: { "fnbRewards.fbPointRequired": entry.fbPointRequired, "fnbRewards.fbRewards": entry.fbRewards } },
            { upsert: true }
        )
    }

    for (const entry of vPoints) {
        await Reward.updateOne(
            { "vitaSpaRewards.vsRewards": entry.vsRewards },
            { $set: { "vitaSpaRewards.vsPointRequired": entry.vsPointRequired, "vitaSpaRewards.vsRewards": entry.vsRewards } },
            { upsert: true }
        )
    }

    for (const entry of rPoints) {
        await Reward.updateOne(
            { "retreatRewards.rRewards": entry.rRewards },
            { $set: { "retreatRewards.rPointRequired": entry.rPointRequired, "retreatRewards.rRewards": entry.rRewards } },
            { upsert: true }
        )
    }
    
    console.log("Rewards initialized successfully");
}

module.exports = initRewardsScheme