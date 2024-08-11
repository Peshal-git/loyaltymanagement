const User = require('../models/userModel')

const dobAndMobileCheck = async (req, res, next) => {
    try {
        const userId = req.user.id
        const user = await User.findById(userId)

        if (!user.mobile || !user.dob) {
            return res.redirect(`/provide-addinfo?id=${userId}`)
        } else {
            next()
        }
    } catch (error) {
        return res.json({
            success: false,
            msg: 'Additional info error'
        })
    }

}

const adminCheck = (req, res, next) => {
    if (req.user?.isAdmin || req.user?.user?.isAdmin) {
        next()
    } else {
        res.redirect('/profile')
    }
}

const userCheck = (req, res, next) => {
    if (!req.user) {
        res.redirect('/')
    } else {
        next()
    }
}

const loginCheck = (req, res, next) => {
    if (req.user) {
        res.redirect('/dashboard')
    } else {
        next()
    }
}

const consentCheck = (req, res, next) => {
    if (!req.user?.privacy?.hasAcceptedPrivacyPolicy) {
        res.redirect('/consent')
    } else {
        next()
    }
}

module.exports = {
    dobAndMobileCheck,
    adminCheck,
    userCheck,
    loginCheck,
    consentCheck,
}