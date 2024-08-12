const User = require('../models/userModel')
const randomstring = require('randomstring')
const PasswordReset = require('../models/passwordReset')
const Blacklist = require("../models/blacklist")
const mailer = require('../helpers/mailer')
const { validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')

const verifyMail = async (req, res) => {
    try {
        const id = req.query.id
        if (req.query.id == undefined) {
            return res.render('404')
        }

        const userr = await User.findById({ _id: id })

        if (userr) {

            if (userr.isVerified) {
                res.render('mail-verification', { message: 'Your mail is already verified.' })
            }

            await User.findByIdAndUpdate({ _id: id }, {
                $set: {
                    isVerified: true
                }
            })
            res.render('mail-verification', { message: 'Mail verified successfully' })

        } else {
            res.render('mail-verification', { message: 'User not found' })
        }

    } catch (error) {
        console.log(error.message)
        res.render('404')
    }
}

const registerPage = async (req, res) => {
    try {
        res.render('register')
    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        })
    }
}

const loginPage = async (req, res) => {
    try {
        res.render('main-login')
    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        })
    }
}


const forgotPasswordPage = async (req, res) => {
    try {
        res.render('forgot-password')
    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        })
    }
}

const resetPasswordPage = async (req, res) => {
    try {
        const tokenn = req.query.token
        const resetData = await PasswordReset.findOne({ token: tokenn })

        res.render('reset-password', { resetData })
    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        })
    }
}

const updatePassword = async (req, res) => {
    try {
        const tokenn = req.query.token
        const resetData = await PasswordReset.findOne({ token: tokenn })

        if (resetData == undefined) {
            return res.render('reset-password', { error: 'Your token has already expired!' })
        }

        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.render('reset-password', { resetData, error: errors.array()[0].msg })
        }

        const { password, cpassword } = req.body
        const user_id = resetData.user_id

        if (password != cpassword) {
            return res.render('reset-password', { resetData, error: 'Passwords are not matching!' })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        await User.findByIdAndUpdate({ _id: user_id }, {
            $set: {
                "systemData.password": hashedPassword
            }
        })

        await PasswordReset.deleteMany({ user_id })

        const message = "Password Updated Successfully."
        return res.render('weblogin', { message })

    } catch (error) {
        return res.render('404')
    }

}

const sendMailToChangePassword = async (req, res) => {
    try {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.render('forgot-password', { error: errors.errors[0].msg })
        }

        const { email } = req.body

        const userData = await User.findOne({ email })

        if (!userData) {
            const error = "Email is not registered"
            return res.render('forgot-password', { error })
        }

        const randomString = randomstring.generate()
        const msg = '<p>Hello, ' + userData.name + ', Please click <a href = "http://127.0.0.1:8000/reset-password?token=' + randomString + '">here</a> to reset your password. </p>'

        await PasswordReset.deleteMany({ user_id: userData._id })

        const passwordReset = new PasswordReset({
            user_id: userData._id,
            token: randomString
        })
        await passwordReset.save()

        mailer.sendMail(userData.email, 'Reset Password', msg)

        const message = 'Reset password link is sent to your mail'
        return res.render('main-login', { message })

    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        })
    }
}

const logout = async (req, res) => {
    try {
        req.logout((err) => {
            if (err) {
                console.log("Error in logging out: ", err)
            } else {
                console.log("Logged out")
            }
        })

        const message = "Successfully logged out!"
        res.render('main-login', { message })
    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        })
    }
}

module.exports = {
    verifyMail,
    registerPage,
    loginPage,
    forgotPasswordPage,
    resetPasswordPage,
    updatePassword,
    sendMailToChangePassword,
    logout
}