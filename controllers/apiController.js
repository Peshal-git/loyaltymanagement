const User = require('../models/userModel')
const bcrypt = require('bcryptjs')
const tokenGen = require('../helpers/tokenGen')
const { validationResult } = require('express-validator')
const mailer = require('../helpers/mailer')
const MemId = require('../helpers/memberIdGen')
const randomstring = require('randomstring')
const PasswordReset = require('../models/passwordReset')


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

        let admin = false
        let verified = false

        if (email && email.endsWith('@vikasa.com')) {
            admin = true
            verified = true
        }

        const user = new User({
            name,
            email,
            systemData: {
                password: hashpassword,
            },
            dob,
            mobile,
            language,
            memberId: uniqueMemberId,
            isVerified: verified,
            isAdmin: admin
        })

        const userData = await user.save()

        const msg = '<p> Hello, ' + name + '. Please <a href="http://127.0.0.1:8000/mail-verification?id=' + userData._id + '">Verify</a> your email. </p>'

        mailer.sendMail(email, 'Mail Verification', msg)

        const accessToken = await tokenGen.generateAccessToken({ user: userData })
        const refreshToken = await tokenGen.generateRefreshToken({ user: userData })

        await User.findByIdAndUpdate(userData._id, {
            $set: {
                "systemData.authentication": accessToken
            }
        })

        if (!userData.isVerified) {
            return res.status(401).json({
                success: true,
                msg: "Please verify your account",
                accessToken: accessToken,
                refreshToken: refreshToken,
                tokenType: 'Bearer'
            })
        }

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
        const msg = '<p>Hello, ' + userData.name + ', Please click <a href = "http://127.0.0.1:8000/reset-password?token=' + randomString + '">here</a> to reset your password. </p>'

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

        const passwordMatch = await bcrypt.compare(password, userData.systemData.password)

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                msg: "Email or password is incorrect"
            })
        }

        const accessToken = await tokenGen.generateAccessToken({ user: userData })
        const refreshToken = await tokenGen.generateRefreshToken({ user: userData })

        await User.findByIdAndUpdate(userData._id, {
            $set: {
                "systemData.authentication": accessToken
            }
        })

        if (!userData.isVerified) {
            return res.status(401).json({
                success: true,
                msg: "Please verify your account",
                accessToken: accessToken,
                refreshToken: refreshToken,
                tokenType: 'Bearer'
            })
        }

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

const addReservation = async (req, res) => {
    try {
        const {
            memberId,
            transactionDate,
            transactionTime,
            outletcode,
            shiftcode,
            checkNo,
            reference,
            folioNo,
            roomNo,
            guestNo,
            tranCode,
            billRemark,
            paymentRemark,
            paymentFlag,
            amount,
            tax,
            additionalTax,
            service } = req.body

        const existingProfile = await User.findOne({ memberId })

        const dotTime = transactionTime
        const timeParts = dotTime.split(':');
        const timeWithSecs = `${timeParts[0]}:${timeParts[1]}:00`

        const transDateAndTime = new Date(`${transactionDate}T${timeWithSecs}`);

        if (existingProfile) {
            existingProfile.reservation.push({
                transactionDateTime: transDateAndTime,
                outletcode,
                shiftcode,
                checkNo,
                reference,
                folioNo,
                roomNo,
                guestNo,
                tranCode,
                billRemark,
                paymentRemark,
                paymentFlag,
                amount,
                tax,
                additionalTax,
                service
            })
        }
        const updatedProfile = await existingProfile.save()

        return res.status(200).json({
            success: true,
            msg: "Reservation added successfully",
            user: updatedProfile
        })

    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        })
    }
}

const updateReservation = async (req, res) => {
    try {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                msg: "Errors",
                errors: errors.array()
            })
        }

        const {
            reservationIndex,
            memberId,
            transactionDate,
            transactionTime,
            outletcode,
            shiftcode,
            checkNo,
            reference,
            folioNo,
            roomNo,
            guestNo,
            tranCode,
            billRemark,
            paymentRemark,
            paymentFlag,
            amount,
            tax,
            additionalTax,
            service } = req.body

        const existingProfile = await User.findOne({ memberId })

        const mmddyyyy = transactionDate
        const parts = mmddyyyy.split('-');
        const dateInYyyymmdd = `${parts[2]}-${parts[0]}-${parts[1]}`

        const transDateAndTime = new Date(`${dateInYyyymmdd}T${transactionTime}`);

        if (existingProfile) {
            if (reservationIndex >= 0 && reservationIndex < existingProfile.reservation.length) {
                existingProfile.reservation[reservationIndex] = {
                    transactionDateTime: transDateAndTime,
                    outletcode,
                    shiftcode,
                    checkNo,
                    reference,
                    folioNo,
                    roomNo,
                    guestNo,
                    tranCode,
                    billRemark,
                    paymentRemark,
                    paymentFlag,
                    amount,
                    tax,
                    additionalTax,
                    service

                }
            } else {
                console.log('Index out of bounds')
            }
        } else {
            console.log('Profile not found')
        }
        const updatedProfile = await existingProfile.save()

        return res.status(200).json({
            success: true,
            msg: "Reservation updated successfully",
            user: updatedProfile
        })

    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        })
    }
}

const updatePrivacyAndMarketing = async (req, res) => {
    try {
        const { memberId, hasAcceptedPrivacyPolicy, hasGivenMarketingConsent } = req.body
        const userExits = await User.findOne({ memberId })

        if (!userExits) {
            return res.status(200).json({
                success: false,
                msg: "User does not exist"
            })

        } else {
            let privacyCreated = new Date()
            let marketingCreated = new Date()
            if (userExits?.privacy?.createdAt) {
                privacyCreated = userExits.privacy.createdAt
            }
            if (userExits?.marketing?.createdAt) {
                marketingCreated = userExits.marketing.createdAt
            }
            const updatedUserData = await User.findByIdAndUpdate({ _id: userExits._id }, {
                $set: {
                    "privacy.hasAcceptedPrivacyPolicy": hasAcceptedPrivacyPolicy,
                    "marketing.hasGivenMarketingConsent": hasGivenMarketingConsent,
                    "privacy.createdAt": privacyCreated,
                    "marketing.createdAt": marketingCreated,
                },
            }, { new: true })

            return res.status(200).json({
                success: true,
                msg: "Policy and Content updated successfully",
                user: updatedUserData
            })

        }

    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        })
    }
}

const updateMemInfo = async (req, res) => {
    try {
        const {
            memberId,
            pointsAvailable,
            lastVisit,
            lastCommunication,
            lastMarketingCommunication,
            expiringPoints,
            lastUsagePoints,
            totalLifetimePoints

        } = req.body

        const userExits = await User.findOne({ memberId })

        if (!userExits) {
            return res.status(200).json({
                success: false,
                msg: "User does not exist"
            })

        } else {
            const updatedUserData = await User.findByIdAndUpdate({ _id: userExits._id }, {
                $set: {
                    "membershipInfo.memberId": memberId,
                    "membershipInfo.pointsAvailable": pointsAvailable,
                    "membershipInfo.lastVisit": lastVisit,
                    "membershipInfo.lastCommunication": lastCommunication,
                    "membershipInfo.lastMarketingCommunication": lastMarketingCommunication,
                    "membershipInfo.expiringPoints": expiringPoints,
                    "membershipInfo.lastUsagePoints": lastUsagePoints,
                    "membershipInfo.totalLifetimePoints": totalLifetimePoints
                }
            }, { new: true })

            return res.status(200).json({
                success: true,
                msg: "Membership Info updated successfully",
                user: updatedUserData
            })

        }

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

        const accessToken = await tokenGen.generateAccessToken({ user: userData })
        const refreshToken = await tokenGen.generateRefreshToken({ user: userData })

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


module.exports = {
    userRegister,
    sendMailVerification,
    forgotPassword,
    loginUser,
    addReservation,
    updateReservation,
    updatePrivacyAndMarketing,
    updateMemInfo,
    userProfile,
    updateProfile,
    refreshToken,
}