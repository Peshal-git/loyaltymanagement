const User = require('../models/userModel')
const Blacklist = require("../models/blacklist")
const moment = require('moment')
const bcrypt = require('bcryptjs')
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const { validationResult } = require('express-validator')
const mailer = require('../helpers/mailer')
const MemId = require('../helpers/memberIdGen')

const randomstring = require('randomstring')
const PasswordReset = require('../models/passwordReset')

const jwt = require('jsonwebtoken')

const userRegister = async (req, res) => {

    try {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                msg: "Errors",
                errors: errors.array()
            })
        }

        const { firstname, lastname, email, password, dob, mobile, language } = req.body
        const name = firstname + ' ' + lastname

        const userExits = await User.findOne({ email })

        if (userExits) {
            return res.status(400).json({
                success: false,
                msg: "Email already exists!"
            })
        }

        MemId.generateMemberId().then((val) => {
            uniqueMemberId = val.toString()
        })


        const hashpassword = await bcrypt.hash(password, 10)

        const user = new User({
            name,
            email,
            password: hashpassword,
            dob,
            mobile,
            language,
            memberId: uniqueMemberId
        })

        const userData = await user.save()

        const msg = '<p> Hello, ' + name + '. Please <a href="http://127.0.0.1:8000/mail-verification?id=' + userData._id + '">Verify</a> your email. </p>'

        mailer.sendMail(email, 'Mail Verification', msg)

        return res.status(200).json({
            success: true,
            msg: "Registered successfully",
            user: userData
        })

    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        })
    }

}

const mailVerification = async (req, res) => {
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

const sendMailVerification = async (req, res) => {
    try {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                msg: "Errors",
                errors: errors.array()
            })
        }

        const { email } = req.body

        const userData = await User.findOne({ email })

        if (!userData) {
            return res.status(400).json({
                success: false,
                msg: "Email is not registered"
            })
        }

        if (userData.isVerified) {
            return res.status(400).json({
                success: false,
                msg: userData.email + " is already verified"
            })
        }

        const msg = '<p> Hello, ' + userData.name + '. Please <a href="http://127.0.0.1:8000/mail-verification?id=' + userData._id + '">Verify</a> your email. </p>'

        mailer.sendMail(userData.email, 'Mail Verification', msg)

        return res.status(200).json({
            success: true,
            msg: "Please verify your email. Verification Link is sent to you email.",
        })


    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        })
    }
}

const forgotPassword = async (req, res) => {
    try {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                msg: "Errors",
                errors: errors.array()
            })
        }

        const { email } = req.body

        const userData = await User.findOne({ email })

        if (!userData) {
            return res.status(400).json({
                success: false,
                msg: "Email is not registered"
            })
        }

        const randomString = randomstring.generate()
        const msg = '<p>Hello, ' + userData.name + ', Please click <a href = "http://127.0.0.1:3000/reset-password?token=' + randomString + '">here</a> to reset your password. </p>'

        await PasswordReset.deleteMany({ user_id: userData._id })

        const passwordReset = new PasswordReset({
            user_id: userData._id,
            token: randomString
        })
        await passwordReset.save()

        mailer.sendMail(userData.email, 'Reset Password', msg)

        return res.status(201).json({
            success: true,
            msg: 'Reset password link is sent to your mail'
        })


    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        })
    }

}

const resetPassword = async (req, res) => {
    try {

        const tokenn = req.query.token

        if (tokenn == undefined) {
            return res.render('404')
        }

        const resetData = await PasswordReset.findOne({ token: tokenn })

        if (!resetData) {
            return res.render('404')
        }

        return res.render('reset-password', { resetData })

    } catch (error) {
        return res.render('404')
    }
}

const updatePassword = async (req, res) => {
    try {

        const errors = validationResult(req)

        const { user_id, password, cpassword } = req.body
        const resetData = await PasswordReset.findOne({ user_id })


        if (!errors.isEmpty()) {
            return res.render('reset-password', { resetData, error: errors.array()[0].msg })
        }

        if (password != cpassword) {
            return res.render('reset-password', { resetData, error: 'Passwords are not matching!' })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        await User.findByIdAndUpdate({ _id: user_id }, {
            $set: {
                password: hashedPassword
            }
        })

        await PasswordReset.deleteMany({ user_id })

        return res.redirect('/reset-success')

    } catch (error) {
        return res.render('404')
    }

}

const resetSuccess = async (req, res) => {
    try {
        return res.render('reset-success')

    } catch (error) {
        return res.render('404')
    }
}

const generateAccessToken = async (user) => {
    const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "2h" })
    return token
}
const generateRefreshToken = async (user) => {
    const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "4h" })
    return token
}

const loginUser = async (req, res) => {
    try {

        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                msg: 'Errors',
                errors: errors.array()
            })
        }


        const { email, password } = req.body
        const userData = await User.findOne({ email })

        if (!userData) {
            return res.status(401).json({
                success: false,
                msg: "Email or password is incorrect"
            })
        }

        const passwordMatch = await bcrypt.compare(password, userData.password)

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                msg: "Email or password is incorrect"
            })
        }

        const accessToken = await generateAccessToken({ user: userData })
        const refreshToken = await generateRefreshToken({ user: userData })

        if (!userData.isVerified) {
            return res.status(401).json({
                success: true,
                msg: "Please verify your account",
                accessToken: accessToken,
                refreshToken: refreshToken,
                tokenType: 'Bearer'
            })
        }

        req.body.token = accessToken
        req.body.method = "email"

        return res.status(200).json({
            success: true,
            msg: "Logged in successfully",
            accessToken: accessToken,
            refreshToken: refreshToken,
            tokenType: 'Bearer'
        })

    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        })
    }
}

const userProfile = async (req, res) => {

    const userData = req.user.user

    try {
        return res.status(400).json({
            success: true,
            msg: "User Profile Data",
            data: userData
        })

    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        })
    }

}

const updateProfile = async (req, res) => {
    try {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                msg: 'Errors',
                errors: errors.array()
            })
        }

        const { firstname, lastname, dob, mobile } = req.body

        const data = {
            name: firstname + " " + lastname,
            dob,
            mobile
        }

        const userData = await User.findByIdAndUpdate({ _id: req.user.user._id }, {
            $set: data
        }, { new: true })

        return res.status(200).json({
            success: true,
            msg: "User updated successfully",
            user: userData
        })

    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        })
    }
}

const refreshToken = async (req, res) => {
    try {
        const userId = req.user.user._id
        const userData = await User.findOne({ _id: userId })

        const accessToken = await generateAccessToken({ user: userData })
        const refreshToken = await generateRefreshToken({ user: userData })

        return res.status(200).json({
            success: true,
            msg: "Token Refreshed!",
            accessToken: accessToken,
            refreshToken: refreshToken
        })


    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        })
    }
}

const logoutUser = async (req, res) => {
    try {
        const token = req.body.token || req.query.token || req.headers["Authorization"]

        const bearer = token.split(' ')
        const beaerToken = bearer[1]

        const newBlacklist = new Blacklist({
            token: beaerToken
        })

        await newBlacklist.save()

        res.setHeader('Clear-Site-Data', '"cookies","storage"')

        return res.status(200).json({
            success: true,
            msg: "You are logged out!"
        })


    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        })
    }
}

const adminLogin = async (req, res) => {
    try {
        res.render('admin-login')
    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        })
    }
}

const adminLogout = async (req, res) => {
    try {
        res.redirect('/admin')
    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        })
    }
}

const adminDashboard = async (req, res) => {
    try {
        let userData = await User.find()
        const query = req.query.search
        if (query) {
            userData = await User.find({
                $or: [
                    { name: { $regex: query, $options: 'i' } },
                    { email: { $regex: query, $options: 'i' } },
                ],
            })
        }
        const token = req.headers["Authorization"]
        return res.render('admin-dashboard', { user: userData, token })
    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        })
    }
}

const deleteUser = async (req, res) => {
    try {
        const id = req.query.id
        const userToDelete = await User.findOne({ _id: id })
        if (!userToDelete.isAdmin) {
            await User.findByIdAndDelete({ _id: id })
            res.redirect('/dashboard')
        }
        else {
            return res.status(400).json({
                success: false,
                msg: "Cannot delete admin"
            })
        }
    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        })
    }
}

const memberDetails = async (req, res) => {
    try {
        const id = req.query.id
        const userToShow = await User.findOne({ _id: id })
        const formattedDate = userToShow.dob.toISOString().split('T')[0]
        const parts = formattedDate.split('-');
        const mmddyyyy = `${parts[1]}-${parts[2]}-${parts[0]}`;
        return res.render('member-details', { user: userToShow, mmddyyyy })
    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        })
    }
}

const addInfo = async (req, res) => {
    try {
        const id = req.query.id
        const userUpdate = await User.findById(id)
        return res.render('add-info', { userUpdate })
    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        })
    }
}

const updateDobAndMobile = async (req, res) => {
    try {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                msg: 'Errors',
                errors: errors.array()
            })
        }

        const id = req.query.id
        const { dob, mobile } = req.body

        const data = {
            dob,
            mobile
        }

        const userData = await User.findByIdAndUpdate({ _id: id }, {
            $set: data
        }, { new: true })

        res.redirect('/admin');

    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        })
    }
}

const updateByAdmin = async (req, res) => {
    try {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                msg: 'Errors',
                errors: errors.array()
            })
        }

        const id = req.query.id
        const { name, email, mobile, lang, dob } = req.body

        const myDate = new Date(moment(dob).format('YYYY-MM-DD'));

        const data = {
            name,
            email,
            mobile,
            lang,
            dob: myDate
        }

        await User.findByIdAndUpdate({ _id: id }, {
            $set: data
        }, { new: true })

        res.redirect('/dashboard');

    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        })
    }
}

const weblogin = async (req, res) => {
    try {
        res.render('weblogin')
    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        })
    }
}

module.exports = {
    userRegister,
    mailVerification,
    sendMailVerification,
    forgotPassword,
    resetPassword,
    updatePassword,
    resetSuccess,
    loginUser,
    userProfile,
    updateProfile,
    refreshToken,
    logoutUser,
    adminLogin,
    adminDashboard,
    deleteUser,
    memberDetails,
    addInfo,
    updateDobAndMobile,
    updateByAdmin,
    weblogin,
    adminLogout
}