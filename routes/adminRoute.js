const express = require('express')
const router = express.Router()

router.use(express.json())

const bodyParser = require('body-parser')
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))
const { adminUpdateValidator } = require('../middleware/validation')

const adminController = require('../controllers/adminController')
const { adminCheck } = require('../middleware/middlewares')
const { updateMembershipInfo, updateTransactionInfo, createToken } = require('../middleware/fetchAPI')
const passport = require('passport')
require('../config/passportSetup')

const auth = require('../middleware/auth')

router.get('/dashboard', auth, adminCheck, adminController.adminDashboard)

router.post('/dashboard', createToken, passport.authenticate('local', {
    failureRedirect: '/'
}), (req, res, next) => {
    next()
}, auth, adminCheck, adminController.adminDashboard)

router.get('/add-transaction', auth, adminCheck, adminController.addTransactionPage)
router.post('/add-transaction', auth, adminCheck, adminController.makeTransaction)

router.get('/delete-user', auth, adminCheck, adminController.deleteUser)
router.get('/delete-transaction', auth, adminCheck, adminController.deleteTransaction)
router.get('/profile-info', auth, adminCheck, adminController.profileInformation)
router.get('/redemption', auth, adminCheck, adminController.redemption)
router.get('/privacy-pref', auth, adminCheck, adminController.privacyAndPreferences)
router.get('/membership-info', auth, adminCheck, adminController.membershipInformation)
router.get('/points-wallet', auth, adminCheck, adminController.pointsWallet)
router.get('/transaction-details', auth, adminCheck, adminController.transactionDetails)
router.get('/discounts', auth, adminCheck, adminController.discounts)


router.post('/update-profileinfo', auth, adminCheck, adminUpdateValidator, adminController.updateProfile)
router.post('/update-privacy-and-pref', auth, adminCheck, adminController.updatePrivacyAndPreference)
router.post('/update-membership-info', auth, adminCheck, updateMembershipInfo, adminController.updateMembershipInfo)
router.post('/update-transaction-details', auth, adminCheck, updateTransactionInfo, adminController.updateTransactionInfo)
router.get('/get-csv', auth, adminCheck, adminController.getCSV)
router.get('/get-discount', auth, adminCheck, adminController.getDiscount)
router.get('/get-multiplier', auth, adminCheck, adminController.getMultiplier)

module.exports = router