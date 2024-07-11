const express = require('express')
const router = express.Router()
const askForAddInfo = require('../middleware/additionalDetails')
const userController = require('../controllers/userController')

const passport = require('passport')
require('../config/passportSetup')

router.get("/google", passport.authenticate('google', {
    scope: ['profile', 'email']
}))

router.get("/google/redirect", passport.authenticate('google'), askForAddInfo, (req, res) => {
    res.redirect('/dashboard')
})

router.get("/facebook", passport.authenticate('facebook', {
    scope: ['email']
}))

router.get('/facebook/redirect', passport.authenticate('facebook', {
    successRedirect: '/dashboard',
    failureRedirect: '/admin'
}), askForAddInfo)

router.get('/weblogin', userController.weblogin)

module.exports = router