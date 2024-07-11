const express = require('express')
const router = express.Router()

router.use(express.json())

const bodyParser = require('body-parser')
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))
const { passwordStrengthValidator, adminUpdateValidator } = require('../helpers/validation')


const userController = require('../controllers/userController')
const auth = require('../middleware/auth')

router.get('/mail-verification', userController.mailVerification)

router.get('/reset-password', userController.resetPassword)
router.post('/reset-password', passwordStrengthValidator, userController.updatePassword)

router.get('/reset-success', userController.resetSuccess)
router.get('/admin', userController.adminLogin)

const adminCheck = (req, res, next) => {
    if (req.user.isAdmin || req.user.user.isAdmin) {
        next()
    } else {
        res.redirect('/admin')
    }
}

const userCheck = (req, res, next) => {
    if (!req.user) {
        res.redirect('/admin')
    } else {
        next()
    }
}

router.get('/dashboard', auth, adminCheck, userController.adminDashboard)
router.get('/delete-user', auth, adminCheck, userController.deleteUser)
router.get('/member-details', auth, adminCheck, userController.memberDetails)
router.get('/provide-addinfo', auth, userCheck, userController.addInfo)
router.post('/update-user', auth, userCheck, adminUpdateValidator, userController.updateByAdmin)
router.post('/login-from-api', userController.loginFromApi)


module.exports = router