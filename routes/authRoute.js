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

router.get("/google/redirect", passport.authenticate('google', {
    successRedirect: "/auth/login/success",
    failureRedirect: "/auth/login/failed"
}))

router.get("/facebook", passport.authenticate('facebook', {
    scope: ['email']
}))

router.get('/facebook/redirect', passport.authenticate('facebook', {
    successRedirect: '/dashboard',
    failureRedirect: '/'
}))

router.get('/mainlogin', adminController.mainlogin)

module.exports = router