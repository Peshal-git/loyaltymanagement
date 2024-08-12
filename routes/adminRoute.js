const express = require('express')
const router = express.Router()

router.use(express.json())

const bodyParser = require('body-parser')
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))
const { adminUpdateValidator } = require('../middleware/validation')

const adminController = require('../controllers/adminController')
const { adminCheck } = require('../middleware/middlewares')
const { updateMembershipInfo, updateReservationInfo, createToken } = require('../middleware/fetchAPI')
const passport = require('passport')
require('../config/passportSetup')

const auth = require('../middleware/auth')

router.get('/dashboard', auth, adminCheck, adminController.adminDashboard)

router.post('/dashboard', createToken, passport.authenticate('local', {
    failureRedirect: '/weblogin'
}), (req, res, next) => {
    next()
}, auth, adminCheck, adminController.adminDashboard)

router.get('/add-reservation', auth, adminCheck, adminController.addReservationPage)
router.post('/add-reservation', auth, adminCheck, adminController.makeReservation)

router.get('/delete-user', auth, adminCheck, adminController.deleteUser)
router.get('/delete-reservation', auth, adminCheck, adminController.deleteReservation)
router.get('/profile-info', auth, adminCheck, adminController.profileInformation)
router.get('/system-data', auth, adminCheck, adminController.systemData)
router.get('/privacy-pref', auth, adminCheck, adminController.privacyAndPreferences)
router.get('/membership-info', auth, adminCheck, adminController.membershipInformation)
router.get('/reservation-info', auth, adminCheck, adminController.reservationInformation)
router.get('/reservation-details', auth, adminCheck, adminController.reservationDetails)
router.post('/update-profileinfo', auth, adminCheck, adminUpdateValidator, adminController.updateProfile)
router.post('/update-privacy-and-pref', auth, adminCheck, adminController.updatePrivacyAndPreference)
router.post('/update-membership-info', auth, adminCheck, updateMembershipInfo, adminController.updateMembershipInfo)
router.post('/update-reservation-details', auth, adminCheck, updateReservationInfo, adminController.updateReservationInfo)
router.get('/get-csv', auth, adminCheck, adminController.getCSV)

module.exports = router