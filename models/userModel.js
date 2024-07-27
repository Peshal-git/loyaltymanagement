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
    }
}, {
    timestamps: true
})

const MarketingSchema = new mongoose.Schema({
    hasGivenMarketingConsent: {
        type: Boolean
    },
    createdAt: {
        type: Date,
        required: true,
    }
}, {
    timestamps: true
})

const MemberInfoSchema = new mongoose.Schema({
    pointsAvailable: {
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
    }
})

const ReservationSchema = new mongoose.Schema({
    transactionDateTime: {
        type: Date,
    },
    outletcode: {
        type: String
    },
    shiftcode: {
        type: String
    },
    checkNo: {
        type: String
    },
    reference: {
        type: String
    },
    folioNo: {
        type: Number
    },
    roomNo: {
        type: Number
    },
    guestNo: {
        type: String
    },
    tranCode: {
        type: Number
    },
    billRemark: {
        type: String
    },
    paymentRemark: {
        type: String
    },
    paymentFlag: {
        type: String
    },
    amount: {
        type: Number
    },
    tax: {
        type: Number
    },
    additionalTax: {
        type: Number
    },
    service: {
        type: Number
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
    },
    mobile: {
        type: Number,
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
    reservation: [ReservationSchema],
},
    {
        timestamps: true
    })

const User = mongoose.model("User", userSchema)

module.exports = User