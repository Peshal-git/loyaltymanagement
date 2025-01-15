const Pricing = require('../models/pricingModel')

const initPricingScheme = async () => {
    
    const count = await Pricing.countDocuments();
    
    if (count > 0) {
        console.log("Discount and multiplier table already initialized")
        return
    }

    const discounts = [
        { tier: "Balance", discount: 5 },
        { tier: "Vitality", discount: 10 },
        { tier: "Harmony", discount: 15 },
        { tier: "Serenity", discount: 20 }
    ]

    const multipliers = [
        {spendingType: "Life Café", multiplier: "0.1"},
        {spendingType: "Yoga Class", multiplier: "0.2"},
        {spendingType: "Vita Spa", multiplier: "0.2"},
        {spendingType: "Retreats and YTT Packages", multiplier: "0.05"},
        {spendingType: "Annual Membership Fee", multiplier: "2.5"},
        {spendingType: "Bonus 1", multiplier: "1"},
        {spendingType: "Bonus 2", multiplier: "1"},
        {spendingType: "Bonus 3", multiplier: "1"},
        {spendingType: "Bonus 4", multiplier: "1"},
    ]

    for (const entry of discounts) {
        await Pricing.updateOne(
            { "tierDiscount.tier": entry.tier },
            { $set: { "tierDiscount.discount": entry.discount, "tierDiscount.tier": entry.tier } },
            { upsert: true }
        )
    }

    for (const entry of multipliers) {
        await Pricing.updateOne(
            { "spendingMultiplier.spendingType": entry.spendingType }, 
            { $set: { "spendingMultiplier.multiplier": entry.multiplier, "spendingMultiplier.spendingType": entry.spendingType } },
            { upsert: true }
        )
    }
    
    console.log("Tier discounts initialized successfully");
}

module.exports = initPricingScheme