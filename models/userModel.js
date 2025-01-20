const mongoose = require('mongoose')

const SystemDataSchema = new mongoose.Schema({
    password: {
        type: String,
    },
    authentication: {
        type: String
    }
}, {
    timestamps: true
})

const PrivacySchema = new mongoose.Schema({
    hasAcceptedPrivacyPolicy: {
        type: Boolean
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    }
}, {
    timestamps: true
})

const MarketingSchema = new mongoose.Schema({
    hasGivenMarketingConsent: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    }
}, {
    timestamps: true
})

const MemberInfoSchema = new mongoose.Schema({
    pointsAvailable: {
        type: Number
    },
    pointsForRedemptions: {
        type: Number
    },
    lastVisit: {
        type: Date
    },
    lastCommunication: {
        type: Date
    },
    lastMarketingCommunication: {
        type: Date
    },
    expiringPoints: {
        type: Number
    },
    lastUsagePoints: {
        type: Number
    },
    totalLifetimePoints: {
        type: Number
    },
    status: {
        type: String,
        enum: ["Active", "Pending", "Inactive", "Upgrade", "Downgrade"],
        default: 'Pending'
    }
})

const TransactionalSchema = new mongoose.Schema({
    spendingType: {
        type: String,
        required: true,
        enum: ["Life Café", "Yoga Class", "Vita Spa", "Retreats and YTT Packages", "Annual Membership Fee", "Bonus 1", "Bonus 2", "Bonus 3", "Bonus 4"]
    },
    amount: {
        type: Number,
        required: true
    },
    pointsGained: {
        type: Number
    },
    tranCode: {
        type: String
    }
    }, {
    timestamps: true
})

const RedeemSchema = new mongoose.Schema({
    reward: {
        type: String,
        required: true,
    },
    pointsLost: {
        type: Number
    },
    tranCode: {
        type: String
    }
    }, {
    timestamps: true
})

const userSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
        unique: true
    },
    mobile: {
        type: String,
        unique: true
    },
    password: {
        type: String,
    },
    language: {
        type: String,
        required: true,
        enum: ["English", "Thai"],
        default: "English"
    },
    dob: {
        type: Date,
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    isSuperAdmin: {
        type: Boolean,
        default: false
    },
    isMember: {
        type: Boolean,
        default: true
    },
    isVendor: {
        type: Boolean,
        default: false
    },
    memberId: {
        type: String,
        required: true
    },
    googleId: String,
    facebookId: String,
    method: {
        type: String,
        enum: ["Email", "Google", "Facebook"],
        default: 'Email',
        required: true
    },
    systemData: SystemDataSchema,
    privacy: PrivacySchema,
    marketing: MarketingSchema,
    membershipInfo: MemberInfoSchema,
    transaction: [TransactionalSchema],
    redeem: [RedeemSchema],
    tier: {
        type: String,
        required: true,
        default: "Balance",
        enum: ["Balance", "Vitality", "Harmony", "Serenity"]
    },
    referredBy: {
        type: String
    },
    referredTo: {
        type: [String], 
        default: []
    }
},
    {
        timestamps: true
    })

userSchema.pre('save', function(next) {
    if (this.email && this.email.endsWith('@vikasa.com')) {
        this.isAdmin = true;
    }
    next()
})

const User = mongoose.model("User", userSchema)

module.exports = User