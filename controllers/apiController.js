const User = require('../models/userModel')
const bcrypt = require('bcryptjs')
const tokenGen = require('../helpers/tokenGen')
const { validationResult } = require('express-validator')
const mailer = require('../helpers/mailer')
const MemId = require('../helpers/memberIdGen')
const randomstring = require('randomstring')
const PasswordReset = require('../models/passwordReset')
const uniqueTranCode = require('../helpers/uniqueTranCode')

const API_BASE_URL = process.env.NODE_ENV === 'production'
    ? process.env.API_BASE_URL_PROD
    : process.env.API_BASE_URL_DEV;

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

        const msg = '<p> Hello, ' + userData.name + `. Please <a href="${API_BASE_URL}/mail-verification?id=` + userData._id + '">Verify</a> your email. </p>'

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
        const msg = '<p>Hello, ' + userData.name + `, Please click <a href = "${API_BASE_URL}/reset-password?token=` + randomString + '">here</a> to reset your password. </p>'

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

const addTransaction = async (req, res) => {
    try {
        const {
            memberId,
            spendingType,
            amount,
            pointsGained
        } = req.body

        const tranCode = await uniqueTranCode.generateUniqueCode()
        
        const existingProfile = await User.findOne({ memberId })

        if (!existingProfile) {
            return res.status(400).json({
                success: false,
                msg: "User not found"
            })
        }

        existingProfile.transaction.push({
            spendingType,
            amount,
            pointsGained,
            tranCode
        })

        existingProfile.membershipInfo.pointsForRedemptions += pointsGained

        const totalPoints = existingProfile.transaction.reduce(
            (total, transaction) => total + (transaction.pointsGained || 0),
            0
        );
        existingProfile.membershipInfo.pointsAvailable = totalPoints;

        const updatedProfile = await existingProfile.save()

        return res.status(200).json({
            success: true,
            msg: "Transaction added successfully",
            user: updatedProfile
        })

    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        })
    }
}

const updateTransaction = async (req, res) => {
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
            spendingType,
            amount,
            pointsGained
        } = req.body

        const existingProfile = await User.findOne({ memberId })

        if (!existingProfile) {
            return res.status(400).json({
                success: false,
                msg: "User not found"
            })
        }

        
        if (reservationIndex >= 0 && reservationIndex < existingProfile.transaction.length) {
            const originalPointsGained = existingProfile.transaction[reservationIndex].pointsGained || 0
            existingProfile.membershipInfo.pointsForRedemptions -= originalPointsGained;
            await existingProfile.save()

            await User.findOneAndUpdate(
                { memberId }, 
                {
                    $set: {
                        [`transaction.${reservationIndex}.spendingType`]: spendingType,
                        [`transaction.${reservationIndex}.amount`]: amount,
                        [`transaction.${reservationIndex}.pointsGained`]: pointsGained
                    }
                }
            )

            existingProfile.membershipInfo.pointsForRedemptions += pointsGained;
            await existingProfile.save();
        }
        
        const totalPoints = existingProfile.transaction.reduce(
            (total, transaction) => total + (transaction.pointsGained || 0),
            0
        );
        existingProfile.membershipInfo.pointsAvailable = totalPoints;
        await existingProfile.save()

        const updatedProfile = await User.findOne({ memberId })


        return res.status(200).json({
            success: true,
            msg: "Transaction updated successfully",
            user: updatedProfile
        })

    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        })
    }
}


const registerAndUpdateConsent = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                msg: "Validation errors occurred",
                errors: errors.array()
            });
        }

        const {
            firstname,
            lastname,
            email,
            password,
            dob,
            mobile,
            referredBy,
            language,
            hasAcceptedPrivacyPolicy,
            hasGivenMarketingConsent
        } = req.body;

        const name = firstname + ' ' + lastname;
        
        const uniqueMemberId = await MemId.generateMemberId();
        const hashedPassword = await bcrypt.hash(password, 10);

        
        let admin = false;
        let superAdmin = false;
        let verified = false;
        let referrerId
        if (email.endsWith('@dosink.com')) {
            admin = true;
            verified = true;
        }

        if(email == "peshal@dosink.com"){
            superAdmin = true
            admin = true
        }

        if(referredBy){
            const userExists = await User.findOne({
                $or: [
                    { email: referredBy },
                    { memberId: referredBy }
                ]
            })

            if(!userExists){
                return res.json({
                    success: false,
                    msg: `${referredBy} can not be found.`
                });
            }
            else{
                if (!userExists.referredTo.includes(uniqueMemberId)) {
                    userExists.referredTo.push(uniqueMemberId);
                    await userExists.save();
                }
                referrerId = userExists.memberId
            }
        }

        const user = new User({
            name,
            email,
            systemData: {
                password: hashedPassword,
            },
            dob,
            mobile,
            referredBy: referrerId,
            language,
            memberId: uniqueMemberId,
            isVerified: verified,
            isAdmin: admin,
            isSuperAdmin: superAdmin,
            privacy: {
                hasAcceptedPrivacyPolicy: hasAcceptedPrivacyPolicy,
                createdAt: new Date(),
            },
            marketing: {
                hasGivenMarketingConsent: hasGivenMarketingConsent,
                createdAt: new Date(),
            },
            membershipInfo: {
                pointsAvailable: 0,
                pointsForRedemptions: 0
            },
        })

        // Save user data
        const userData = await user.save();

        // Send verification email
        const msg = `<p> Hello, ${name}. Please <a href="${API_BASE_URL}/mail-verification?id=${userData._id}">Verify</a> your email. </p>`;
        mailer.sendMail(email, 'Mail Verification', msg);

        // Generate tokens
        const accessToken = await tokenGen.generateAccessToken({ user: userData });
        const refreshToken = await tokenGen.generateRefreshToken({ user: userData });

        // Update user authentication token in database
        await User.findByIdAndUpdate(userData._id, {
            $set: {
                "systemData.authentication": accessToken
            }
        });

        if (!userData.isVerified) {
            return res.status(401).json({
                success: true,
                msg: "Please verify your account",
                accessToken,
                refreshToken,
                tokenType: 'Bearer'
            });
        }

        return res.status(200).json({
            success: true,
            msg: "Registered and consent updated successfully",
            user: userData
        });

    } catch (error) {
        if (error.code && error.code === 11000) {
            const duplicateField = Object.keys(error.keyValue)[0];
            return res.status(409).json({
                success: false,
                msg: `${duplicateField} already exists.`
            });
        }
        return res.status(500).json({
            success: false,
            msg: error.message,
            error: error.message
        });
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
    sendMailVerification,
    forgotPassword,
    loginUser,
    addTransaction,
    updateTransaction,
    updateMemInfo,
    userProfile,
    updateProfile,
    refreshToken,
    registerAndUpdateConsent
}