const express = require('express')
const router = express.Router()

router.use(express.json())

const bodyParser = require('body-parser')
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))
const { passwordStrengthValidator, adminUpdateValidator } = require('../helpers/validation')

const userController = require('../controllers/userController')
const auth = require('../middleware/auth')
const mid = require('../middleware/usefulMiddlewares')

router.get('/mail-verification', userController.mailVerification)
router.get('/reset-password', userController.resetPassword)
router.post('/reset-password', passwordStrengthValidator, userController.updatePassword)
router.get('/reset-success', userController.resetSuccess)
router.get('/admin', userController.adminLogin)

router.get('/dashboard', auth, mid.adminCheck, userController.adminDashboard)
router.post('/dashboard', mid.getTokenFromLogin, auth, mid.adminCheck, userController.adminDashboard)
router.get('/delete-user', auth, mid.adminCheck, userController.deleteUser)


router.get('/profile-info', auth, mid.adminCheck, userController.profileInformation)
router.get('/system-data', auth, mid.adminCheck, userController.systemData)
router.get('/privacy-pref', auth, mid.adminCheck, userController.privacyAndPreferences)
router.get('/membership-info', auth, mid.adminCheck, userController.membershipInformation)
router.get('/reservation-info', auth, mid.adminCheck, userController.reservationInformation)


router.get('/provide-addinfo', auth, mid.userCheck, userController.addInfo)
router.post('/update-user', auth, mid.userCheck, adminUpdateValidator, userController.updateByAdmin)
router.get('/logout', auth, mid.logout, userController.adminLogout)

module.exports = router