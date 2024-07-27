const express = require('express')
const router = express.Router()

const userController = require('../controllers/userController')
const { registerValidator, sendMailVerificationValidator, passwordResetValidator, loginValidator, updateProfileValidator, updateSocialAuthValidator, dateAndTimeValidatorForRegestration } = require('../helpers/validation')

const auth = require('../middleware/auth')

router.use(express.json())

router.post('/register', registerValidator, userController.userRegister)

router.post('/send-mail-verification', sendMailVerificationValidator, userController.sendMailVerification)

router.post('/forgot-password', passwordResetValidator, userController.forgotPassword)
router.post('/login', loginValidator, userController.loginUser)
router.post('/add-reservation', dateAndTimeValidatorForRegestration, userController.addReservation)
router.post('/update-reservation', dateAndTimeValidatorForRegestration, userController.updateReservation)
router.post('/policy-and-consent', userController.checkPrivacyAndMarketing)
router.post('/update-member-info', userController.updateMemInfo)


router.get('/profile', auth, userController.userProfile)
router.post('/update-profile', auth, updateProfileValidator, userController.updateProfile)
router.post('/additional-info', auth, updateSocialAuthValidator, userController.updateDobAndMobile)
router.get('/refresh-token', auth, userController.refreshToken)
router.get('/logout', auth, userController.logoutUser)


module.exports = router