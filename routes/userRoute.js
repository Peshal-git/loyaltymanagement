const express = require('express')
const router = express.Router()

const userController = require('../controllers/userController')
const { registerValidator, sendMailVerificationValidator, passwordResetValidator, loginValidator, updateProfileValidator, updateSocialAuthValidator } = require('../helpers/validation')

const auth = require('../middleware/auth')

router.use(express.json())

router.post('/register', registerValidator, userController.userRegister)

router.post('/send-mail-verification', sendMailVerificationValidator, userController.sendMailVerification)

router.post('/forgot-password', passwordResetValidator, userController.forgotPassword)
router.post('/login', loginValidator, userController.loginUser)


router.get('/profile', auth, userController.userProfile)
router.post('/update-profile', auth, updateProfileValidator, userController.updateProfile)
router.post('/additional-info', auth, updateSocialAuthValidator, userController.updateDobAndMobile)
router.get('/refresh-token', auth, userController.refreshToken)
router.get('/logout', auth, userController.logoutUser)


module.exports = router