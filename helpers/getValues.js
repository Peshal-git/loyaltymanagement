const Pricing = require("../models/pricingModel");
const Reward = require("../models/rewardsModel");

const getDiscountValues = async () => {
  const balanceTier = await Pricing.findOne({ "tierDiscount.tier": "Balance" });
  const vitalityTier = await Pricing.findOne({
    "tierDiscount.tier": "Vitality",
  });
  const harmonyTier = await Pricing.findOne({ "tierDiscount.tier": "Harmony" });
  const serenityTier = await Pricing.findOne({
    "tierDiscount.tier": "Serenity",
  });

  return {
    balanceDiscount: balanceTier?.tierDiscount.discount,
    vitalityDiscount: vitalityTier?.tierDiscount.discount,
    harmonyDiscount: harmonyTier?.tierDiscount.discount,
    serenityDiscount: serenityTier?.tierDiscount.discount,
  };
};

const getMultiplierValues = async () => {
  const lifeCafeType = await Pricing.findOne({
    "spendingMultiplier.spendingType": "Life Café",
  });
  const yogaClassType = await Pricing.findOne({
    "spendingMultiplier.spendingType": "Yoga Class",
  });
  const vitaSpaType = await Pricing.findOne({
    "spendingMultiplier.spendingType": "Vita Spa",
  });
  const retreatsType = await Pricing.findOne({
    "spendingMultiplier.spendingType": "Retreats and YTT Packages",
  });

  return {
    lifeCafeMultiplier: lifeCafeType?.spendingMultiplier.multiplier,
    yogaClassMultiplier: yogaClassType?.spendingMultiplier.multiplier,
    vitaSpaMultiplier: vitaSpaType?.spendingMultiplier.multiplier,
    retreatsMultiplier: retreatsType?.spendingMultiplier.multiplier,
  };
};

module.exports = {
  getDiscountValues,
  getMultiplierValues,
};
