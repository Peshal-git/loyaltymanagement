const mongoose = require('mongoose')

const passwordResetSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true,
        ref: 'User'
    },
    token: {
        type: String,
        required: true
    },
})


const PasswordReset = mongoose.model("PasswordReset", passwordResetSchema)

module.exports = PasswordReset