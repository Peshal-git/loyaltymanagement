const express = require('express')
const router = express.Router()

const { dobAndMobileCheck, consentCheck, adminCheck } = require('../middleware/middlewares')

const adminController = require('../controllers/adminController')

const passport = require('passport')
require('../config/passportSetup')

router.get("/google", passport.authenticate('google', {
    scope: ['profile', 'email']
}))

router.get("/login/success", dobAndMobileCheck, consentCheck, adminCheck, (req, res) => {
    res.redirect('/dashboard')
})

// router.get("/login/failed", (req, res) => {
//     res.status(401).json({
//         error: true,
//         message: "Login failed"
//     })
// })

router.get("/google/redirect", passport.authenticate('google', {
    successRedirect: "/auth/login/success",
    failureRedirect: "/auth/login/failed"
}), (req, res) => {
    const { accessToken, refreshToken } = req.user
    res.json({
        accessToken,
        refreshToken
    })
})

//askForAddInfo

router.get("/facebook", passport.authenticate('facebook', {
    scope: ['email']
}))

router.get('/facebook/redirect', passport.authenticate('facebook', {
    successRedirect: '/dashboard',
    failureRedirect: '/'
}))

router.get('/weblogin', adminController.weblogin)

module.exports = router