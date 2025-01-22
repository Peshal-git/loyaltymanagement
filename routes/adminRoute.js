const express = require('express')
const router = express.Router()

router.use(express.json())

const bodyParser = require('body-parser')
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))
const { adminUpdateValidator, discountsUpdateValidator, multipliersUpdateValidator, addMemberValidator } = require('../middleware/validation')

const adminController = require('../controllers/adminController')
const { adminCheck, superAdminCheck, verificationCheck } = require('../middleware/middlewares')
const { updateMembershipInfo, updateTransactionInfo, createToken } = require('../middleware/fetchAPI')
const passport = require('passport')
require('../config/passportSetup')

const auth = require('../middleware/auth')

const multer = require('multer')
const storage = multer.memoryStorage()

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv') {
            cb(null, true);
        } else {
            cb(new Error('Only CSV files are allowed!'), false);
        }
    },
});

router.get('/dashboard', auth, adminCheck, verificationCheck, adminController.adminDashboard)

router.get('/admin-verification', auth, adminCheck, adminController.adminVerificationPage)

router.post('/dashboard', createToken, passport.authenticate('local', {
    failureRedirect: '/'
}), (req, res, next) => {
    next()
}, auth, adminCheck, verificationCheck, adminController.adminDashboard)

router.get('/add-transaction', auth, adminCheck, verificationCheck, adminController.addTransactionPage)
router.post('/add-transaction', auth, adminCheck, verificationCheck, adminController.makeTransaction)

router.get('/delete-user', auth, superAdminCheck, verificationCheck, adminController.deleteUser)
router.get('/delete-transaction', auth, superAdminCheck, verificationCheck, adminController.deleteTransaction)
router.get('/delete-redemption', auth, superAdminCheck, verificationCheck, adminController.deleteRedemption)

router.get('/profile-info', auth, adminCheck, verificationCheck, adminController.profileInformation)

router.get('/privacy-pref', auth, adminCheck, verificationCheck, adminController.privacyAndPreferences)
router.get('/membership-info', auth, adminCheck, verificationCheck, adminController.membershipInformation)
router.get('/points-wallet', auth, adminCheck, verificationCheck, adminController.pointsWallet)
router.get('/transaction-details', auth, adminCheck, verificationCheck, adminController.transactionDetails)
router.get('/discounts', auth, adminCheck, verificationCheck, adminController.discounts)

router.post('/discount-control', auth, superAdminCheck, verificationCheck, discountsUpdateValidator, adminController.updateDiscounts)
router.post('/multiplier-control', auth, superAdminCheck, verificationCheck, multipliersUpdateValidator, adminController.updateMultipliers)

router.post('/update-profileinfo', auth, adminCheck, verificationCheck, adminUpdateValidator, adminController.updateProfile)
router.post('/update-privacy-and-pref', auth, adminCheck, verificationCheck, adminController.updatePrivacyAndPreference)
router.post('/update-membership-info', auth, adminCheck, verificationCheck, updateMembershipInfo, adminController.updateMembershipInfo)
router.post('/update-transaction-details', auth, adminCheck, verificationCheck, updateTransactionInfo, adminController.updateTransactionInfo)
router.get('/get-csv', auth, adminCheck, verificationCheck, adminController.getCSV)

router.get('/add-member', auth, adminCheck, verificationCheck, adminController.addMemberPage)
router.post('/add-member', auth, adminCheck, verificationCheck, addMemberValidator, adminController.addMember)

router.post('/import-admins', auth, adminCheck, verificationCheck, upload.single('csvFile'), adminController.importAdmins)
router.post('/redeem', auth, adminCheck, verificationCheck, adminController.redeemPoints)

router.get('/rewardPoints', auth, adminCheck, verificationCheck, adminController.rewardPointsPage)

router.get('/send-verification-link', auth, adminCheck, adminController.sendMailVerification)

module.exports = router