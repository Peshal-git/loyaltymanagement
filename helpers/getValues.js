const Pricing = require('../models/pricingModel')
const Reward = require('../models/rewardsModel')

const getDiscountValues = async () => {
    const balanceTier = await Pricing.findOne({ "tierDiscount.tier": "Balance" });
    const vitalityTier = await Pricing.findOne({ "tierDiscount.tier": "Vitality" });
    const harmonyTier = await Pricing.findOne({ "tierDiscount.tier": "Harmony" });
    const serenityTier = await Pricing.findOne({ "tierDiscount.tier": "Serenity" });

    return {
        balanceDiscount: balanceTier?.tierDiscount.discount,
        vitalityDiscount: vitalityTier?.tierDiscount.discount,
        harmonyDiscount: harmonyTier?.tierDiscount.discount,
        serenityDiscount: serenityTier?.tierDiscount.discount
    }
}

const getMultiplierValues = async () => {
    const lifeCafeType = await Pricing.findOne({ "spendingMultiplier.spendingType": "Life Café" });
    const yogaClassType = await Pricing.findOne({ "spendingMultiplier.spendingType": "Yoga Class" });
    const vitaSpaType = await Pricing.findOne({ "spendingMultiplier.spendingType": "Vita Spa" });
    const retreatsType = await Pricing.findOne({ "spendingMultiplier.spendingType": "Retreats and YTT Packages" });

    return {
        lifeCafeMultiplier: lifeCafeType?.spendingMultiplier.multiplier,
        yogaClassMultiplier: yogaClassType?.spendingMultiplier.multiplier,
        vitaSpaMultiplier: vitaSpaType?.spendingMultiplier.multiplier,
        retreatsMultiplier: retreatsType?.spendingMultiplier.multiplier
    }
}

const getYogaRewardPoints = async () => {
    const yrewardOne = await Reward.findOne({ "yogaRewards.yRewards": "1 Group Class Drop-in" });
    const yrewardTwo = await Reward.findOne({ "yogaRewards.yRewards": "1-week unlimited Class Tickets" });
    const yrewardThree = await Reward.findOne({ "yogaRewards.yRewards": "1 Month Unlimited" });
    const yrewardFour = await Reward.findOne({ "yogaRewards.yRewards": "Healthy Day" });
    const yrewardFive = await Reward.findOne({ "yogaRewards.yRewards": "Healthy Morning/ Afternoon" });
    const yrewardSix = await Reward.findOne({ "yogaRewards.yRewards": "Private Class 1-on-1" });

    return {
        yrewardOneValue: yrewardOne?.yogaRewards.yPointRequired,
        yrewardTwoValue: yrewardTwo?.yogaRewards.yPointRequired,
        yrewardThreeValue: yrewardThree?.yogaRewards.yPointRequired,
        yrewardFourValue: yrewardFour?.yogaRewards.yPointRequired,
        yrewardFiveValue: yrewardFive?.yogaRewards.yPointRequired,
        yrewardSixValue: yrewardSix?.yogaRewards.yPointRequired
    }
}

const getFnBRewardPoints = async () => {
    const frewardOne = await Reward.findOne({ "fnbRewards.fbRewards": "Free Breakfast or Dinner Set" });
    const frewardTwo = await Reward.findOne({ "fnbRewards.fbRewards": "Free Signature Juices or Smoothies" });
    const frewardThree = await Reward.findOne({ "fnbRewards.fbRewards": "Free Coffee or Tea" });
    const frewardFour = await Reward.findOne({ "fnbRewards.fbRewards": "Free Raw Cheesecake" });
   
    return {
        frewardOneValue: frewardOne?.fnbRewards.fbPointRequired,
        frewardTwoValue: frewardTwo?.fnbRewards.fbPointRequired,
        frewardThreeValue: frewardThree?.fnbRewards.fbPointRequired,
        frewardFourValue: frewardFour?.fnbRewards.fbPointRequired
    }
}

const getVitaSpaRewardPoints = async () => {
    const vrewardOne = await Reward.findOne({ "vitaSpaRewards.vsRewards": "Any massages/Treatments 60mn" });
    const vrewardTwo = await Reward.findOne({ "vitaSpaRewards.vsRewards": "Any massages/Treatments 90mn" });
    const vrewardThree = await Reward.findOne({ "vitaSpaRewards.vsRewards": "Free upgrade 30 min massage" });
   
    return {
        vrewardOneValue: vrewardOne?.vitaSpaRewards.vsPointRequired,
        vrewardTwoValue: vrewardTwo?.vitaSpaRewards.vsPointRequired,
        vrewardThreeValue: vrewardThree?.vitaSpaRewards.vsPointRequired
    }
}
const getRetreatsRewardPoints = async () => {
    const rrewardOne = await Reward.findOne({ "retreatRewards.rRewards": "Room upgrade" });
    const rrewardTwo = await Reward.findOne({ "retreatRewards.rRewards": "Free room night" });
   
    return {
        rrewardOneValue: rrewardOne?.retreatRewards.rPointRequired,
        rrewardTwoValue: rrewardTwo?.retreatRewards.rPointRequired
    }
}

module.exports = {
    getDiscountValues,
    getMultiplierValues,
    getYogaRewardPoints,
    getFnBRewardPoints,
    getVitaSpaRewardPoints,
    getRetreatsRewardPoints
}