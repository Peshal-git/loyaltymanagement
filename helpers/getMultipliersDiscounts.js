const Pricing = require("../models/pricingModel")
const User = require("../models/userModel")

const getMultiplier = async(spendingType) => {
    const multiplierForSpending = await Pricing.findOne({ "spendingMultiplier.spendingType": spendingType })
    if (multiplierForSpending.spendingMultiplier) {
        return multiplierForSpending.spendingMultiplier.multiplier
    } else {
        return('Multiplier not found')
    }
}

const getDiscount = async(id) => {
    const user = await User.findOne({ _id: id })
    const discountPercent = await Pricing.findOne({ "tierDiscount.tier": user.tier })
    if (discountPercent.tierDiscount) {
        return discountPercent.tierDiscount.discount
    } else {
        return('Discount not found');
    }
}

module.exports = {
    getMultiplier,
    getDiscount
}
