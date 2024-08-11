const express = require('express')
const router = express.Router()

router.use(express.json())
const auth = require('../middleware/auth')
const apiController = require('../controllers/apiController')

const { registerValidator, emailValidator, loginValidator, updateProfileValidator } = require('../middleware/validation')

router.post('/register', registerValidator, apiController.userRegister)
router.post('/send-mail-verification', emailValidator, apiController.sendMailVerification)
router.post('/forgot-password', emailValidator, apiController.forgotPassword)
router.post('/login', loginValidator, apiController.loginUser)
router.post('/add-reservation', apiController.addReservation)
router.post('/update-reservation', apiController.updateReservation)
router.post('/policy-and-consent', apiController.updatePrivacyAndMarketing)
router.post('/update-member-info', apiController.updateMemInfo)
router.get('/profile', auth, apiController.userProfile)
router.post('/update-profile', auth, updateProfileValidator, apiController.updateProfile)
router.get('/refresh-token', auth, apiController.refreshToken)


module.exports = router