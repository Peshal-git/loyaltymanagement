const mongoose = require('mongoose')

const YogaCategory = new mongoose.Schema({
    yRewards: {
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
    yPointRequired: {
        type: Number
    }
})

const FnBCategory = new mongoose.Schema({
    fbRewards: {
        type: String,
        enum: [
            "Free Breakfast or Dinner Set", 
            "Free Signature Juices or Smoothies", 
            "Free Coffee or Tea", 
            "Free Raw Cheesecake"
        ]
    },
    fbPointRequired: {
        type: Number
    }
}) 

const VitaSpaCategory = new mongoose.Schema({
    vsRewards: {
        type: String,
        enum: [
            "Any massages/Treatments 60mn", 
            "Any massages/Treatments 90mn", 
            "Free upgrade 30 min massage",
        ]
    },
    vsPointRequired: {
        type: Number
    }
})

const RetreatsCategory = new mongoose.Schema({
    rRewards: {
        type: String,
        enum: [
            "Room upgrade", 
            "Free room night",
        ]
    },
    rPointRequired: {
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