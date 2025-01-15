const mongoose = require('mongoose')

const TierAndDiscountSchema = new mongoose.Schema({
    tier: {
        type: String,
        enum: ["Balance", "Vitality", "Harmony", "Serenity"]
    },
    discount: {
        type: Number
    },
    basePoints: {
        type: Number
    }
})

const TypeAndMultiplierSchema = new mongoose.Schema({
    spendingType: {
        type: String,
        required: true,
        enum: ["Life Café", "Yoga Class", "Vita Spa", "Retreats and YTT Packages", "Annual Membership Fee", "Bonus 1", "Bonus 2", "Bonus 3", "Bonus 4"]
    },
    multiplier: {
        type: Number
    },
})

const PricingSchema = new mongoose.Schema({
    tierDiscount: TierAndDiscountSchema,
    spendingMultiplier: TypeAndMultiplierSchema    
})

const Pricing = mongoose.model("Pricing", PricingSchema)

module.exports = Pricing