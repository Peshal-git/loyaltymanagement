const mongoose = require('mongoose')

const YogaCategory = new mongoose.Schema({
    reward: {
        type: String,
        enum: [
            "1 Group Class Drop-in", 
            "1-week unlimited Class Tickets", 
            "1 Month Unlimited", 
            "Healthy Day", 
            "Healthy Morning/ Afternoon",
            "Private Class 1-on-1"
        ]
    },
    pointRequired: {
        type: Number
    }
})

const FnBCategory = new mongoose.Schema({
    reward: {
        type: String,
        enum: [
            "Free Breakfast or Dinner Set", 
            "Free Signature Juices or Smoothies", 
            "Free Coffee or Tea", 
            "Free Raw Cheesecake"
        ]
    },
    pointRequired: {
        type: Number
    }
}) 

const VitaSpaCategory = new mongoose.Schema({
    reward: {
        type: String,
        enum: [
            "Any massages/Treatments 60mn", 
            "Any massages/Treatments 90mn", 
            "Free upgrade 30 min massage",
        ]
    },
    pointRequired: {
        type: Number
    }
})

const RetreatsCategory = new mongoose.Schema({
    reward: {
        type: String,
        enum: [
            "Room upgrade", 
            "Free room night",
        ]
    },
    pointRequired: {
        type: Number
    }
})

const RewardsSchema = new mongoose.Schema({
    yogaRewards: YogaCategory,
    fnbRewards: FnBCategory,
    vitaSpaRewards: VitaSpaCategory,
    retreatRewards: RetreatsCategory
})

const Reward = mongoose.model("Reward", RewardsSchema)

module.exports = Reward