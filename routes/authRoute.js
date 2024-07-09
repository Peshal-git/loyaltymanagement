const express = require('express')
const router = express.Router()

router.use(express.json())

const bodyParser = require('body-parser')
const { passwordStrengthValidator, adminUpdateValidator } = require('../helpers/validation')

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))

const userController = require('../controllers/userController')

router.get('/mail-verification', userController.mailVerification)

router.get('/reset-password', userController.resetPassword)
router.post('/reset-password', passwordStrengthValidator, userController.updatePassword)

router.get('/reset-success', userController.resetSuccess)
router.get('/admin', userController.adminLogin)

const adminCheck = (req, res, next) => {
    if (!req.user.isAdmin) {
        res.redirect('/admin')
    } else {
        next()
    }
}

const userCheck = (req, res, next) => {
    if (!req.user) {
        res.redirect('/admin')
    } else {
        next()
    }
}

router.get('/dashboard', adminCheck, userController.adminDashboard)
router.get('/delete-user', adminCheck, userController.deleteUser)
router.get('/member-details', adminCheck, userController.memberDetails)
router.get('/provide-addinfo', userCheck, userController.addInfo)
router.post('/update-user', userCheck, adminUpdateValidator, userController.updateByAdmin)


module.exports = router