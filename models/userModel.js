const mongoose = require('mongoose')

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
},
    {
        timestamps: true
    })

const User = mongoose.model("User", userSchema)

module.exports = User