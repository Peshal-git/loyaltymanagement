const User = require('../models/userModel')
const askForAddInfo = async (req, res, next) => {
    try {
        const userId = req.user.id
        const checkUser = await User.findById(userId)

        if (!checkUser.mobile || !checkUser.dob) {
            res.redirect(`/provide-addinfo?id=${userId}`)
        }

        next()
    } catch (error) {
        return res.json({
            success: false,
            msg: 'Additional info error'
        })
    }

}

module.exports = askForAddInfo