const express = require('express')
const router = express.Router()

const { dobAndMobileCheck, consentCheck, adminCheck } = require('../middleware/middlewares')

const adminController = require('../controllers/adminController')

const passport = require('passport')
require('../config/passportSetup')

router.get("/google", passport.authenticate('google', {
    scope: ['profile', 'email']
}))

// router.get("/apple", passport.authenticate('apple', {
//     scope: ['name', 'email']
// }))

router.get("/facebook", passport.authenticate('facebook', {
    scope: ['email']
}))


router.get("/login/success", dobAndMobileCheck, consentCheck, adminCheck, (req, res) => {
    res.redirect('/dashboard')
})


router.get("/google/redirect", passport.authenticate('google', {
    successRedirect: "/auth/login/success",
    failureRedirect: "/"
}))

router.get('/facebook/redirect', passport.authenticate('facebook', {
    successRedirect: '/auth/login/success',
    failureRedirect: '/'
}))

// router.get('/apple/redirect', passport.authenticate('facebook', {
//     successRedirect: '/auth/login/success',
//     failureRedirect: '/'
// }))

router.get('/mainlogin', adminController.mainlogin)

module.exports = router