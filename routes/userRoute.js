const express = require('express')
const router = express.Router()

router.use(express.json())

const bodyParser = require('body-parser')
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))

const userController = require('../controllers/userController')
const auth = require('../middleware/auth')
const { userCheck } = require('../middleware/middlewares')
const { updateSocialAuthValidator } = require('../middleware/validation')
const { registerUser, createToken } = require('../middleware/fetchAPI')
const passport = require('passport')
require('../config/passportSetup')

router.post('/register', registerUser, createToken, passport.authenticate('local', {
    failureRedirect: '/'
}), (req, res, next) => {
    next()
}, auth, userCheck, userController.dashboardRedirect)

router.get('/profile', auth, userCheck, userController.profilePage)
router.get('/wallet', auth, userCheck, userController.walletPage)
router.get('/about-us', auth, userCheck, userController.aboutUsPage)
router.get('/membership', auth, userCheck, userController.membershipPage)
router.get('/provide-addinfo', auth, userCheck, userController.addInfoPage)
router.post('/update-dob-mobile', auth, userCheck, updateSocialAuthValidator, userController.updateAdditionalInfoAndConsent)

router.get('/download-pointsHistory', auth, userCheck, userController.downloadPointsHistory)

module.exports = router