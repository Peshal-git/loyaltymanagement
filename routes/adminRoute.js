const express = require('express')
const router = express.Router()

router.use(express.json())

const bodyParser = require('body-parser')
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))
const { adminUpdateValidator, discountsUpdateValidator, multipliersUpdateValidator, addMemberValidator } = require('../middleware/validation')

const adminController = require('../controllers/adminController')
const { adminCheck, superAdminCheck } = require('../middleware/middlewares')
const { updateMembershipInfo, updateTransactionInfo, createToken } = require('../middleware/fetchAPI')
const passport = require('passport')
require('../config/passportSetup')

const auth = require('../middleware/auth')

const multer = require('multer')
const storage = multer.diskStorage({
    destination: (req,file,cb) => {
        cb(null,'./public/csv-uploads')
    },
    filename: (req,file,cb) => {
        const uniqueSuffix = Date.now() + '-'
        cb(null, uniqueSuffix + '-' + file.originalname)
    }
})

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv') {
            cb(null, true)
        } else {
            cb(new Error('Only CSV files are allowed!'), false)
        }
    },
})

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

router.post('/discount-control', auth, superAdminCheck, discountsUpdateValidator, adminController.updateDiscounts)
router.post('/multiplier-control', auth, superAdminCheck, multipliersUpdateValidator, adminController.updateMultipliers)


router.post('/update-profileinfo', auth, adminCheck, adminUpdateValidator, adminController.updateProfile)
router.post('/update-privacy-and-pref', auth, adminCheck, adminController.updatePrivacyAndPreference)
router.post('/update-membership-info', auth, adminCheck, updateMembershipInfo, adminController.updateMembershipInfo)
router.post('/update-transaction-details', auth, adminCheck, updateTransactionInfo, adminController.updateTransactionInfo)
router.get('/get-csv', auth, adminCheck, adminController.getCSV)
router.get('/get-discount', auth, adminCheck, adminController.getDiscount)
router.get('/get-multiplier', auth, adminCheck, adminController.getMultiplier)

router.get('/add-member', auth, adminCheck, adminController.addMemberPage)
router.post('/add-member', auth, adminCheck, addMemberValidator, adminController.addMember)

router.post('/import-admins', upload.single('csvFile'), adminController.importAdmins)
router.post('/redeem', auth, adminCheck, adminController.redeemPoints)


module.exports = router