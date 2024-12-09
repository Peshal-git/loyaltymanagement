const User = require('../models/userModel')
const Pricing = require('../models/pricingModel')
const Reward = require('../models/rewardsModel')
const getValues = require('../helpers/getValues')
const moment = require('moment')
const CsvParser = require('json2csv').Parser
const MemId = require('../helpers/memberIdGen')
const bcrypt = require('bcryptjs')
const randomstring = require('randomstring')
const mailer = require('../helpers/mailer')
const PasswordReset = require('../models/passwordReset')
const tokenGen = require('../helpers/tokenGen')
const getPaginations = require('../helpers/getPaginations')
const csv = require('csvtojson')
const uniqueTranCode = require('../helpers/uniqueTranCode')
const getMultipliersDiscounts = require('../helpers/getMultipliersDiscounts')


const { validationResult } = require('express-validator')
const pointsHistoryCalc = require('../helpers/pointsHistoryCalc')

const API_BASE_URL = process.env.NODE_ENV === 'production'
    ? process.env.API_BASE_URL_PROD
    : process.env.API_BASE_URL_DEV;

const adminDashboard = async (req, res) => {
    try {
        const query = req.query.search || ''
        const page = Number(req.query.page) || 1
        const limit = 5
        
        const { user, totalPages, prevPage, nextPage, currentPage, pages } = await getPaginations.getPaginatedUsers(query, page, limit)
        
        if (req?.session?.reservationMessage || req?.session?.reservationError) {
            let message = req.session.reservationMessage
            let error = req.session.reservationError
            req.session.reservationMessage = null
            req.session.reservationError = null
            return res.render('admin-dashboard', { 
                user, 
                message,
                error, 
                currentPage,
                totalPages,
                prevPage,
                nextPage,
                pages 
            });
        }

        return res.render('admin-dashboard', {
             user,
             currentPage,
             totalPages,
             prevPage,
             nextPage,
             pages 
            })

    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message,
        });
    }
};
    

const addTransactionPage = async (req, res) => {
    try {
        const { id } = req.query
        const user = await User.findById(id)

        res.render('add-transaction', { user, id })
    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        })
    }
}

const makeTransaction = async (req, res) => {
    try {
        const { id } = req.query
        const user = await User.findById(id)
        const { 
            spendingType,
            amount
        } = req.body

        const multiplier = await getMultipliersDiscounts.getMultiplier(spendingType)
        const pointsGained = amount * multiplier

        const response = await fetch(`${API_BASE_URL}/api/add-transaction`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                memberId: user.memberId,
                spendingType,
                amount,
                pointsGained
            })
        })

        const responseData = await response.json()

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        if (responseData?.errors) {
            const error = responseData?.errors[0]?.msg
            return res.render('add-transaction', { error, id })
        }

        const message = "Transaction Done"
        req.session.reservationMessage = message
        return res.redirect(`/profile-info?id=${id}`)

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
            req.session.reservationError = "Cannot delete admin"
            res.redirect('/dashboard')
        }
    } catch (error) {
        res.render('admin-dashboard', {error: error.message})
    }
}

const deleteTransaction = async (req, res) => {
    try {
        const { id, reservationIndex } = req.query
        const requestedUser = await User.findById(id)

        if (reservationIndex < 0 || reservationIndex >= requestedUser.transaction.length) {

            return res.status(400).json({
                success: false,
                msg: 'Invalid reservation index'
            })

        }
        
        const originalPointsGained = requestedUser.transaction[reservationIndex].pointsGained || 0
        requestedUser.membershipInfo.pointsForRedemptions -= originalPointsGained

        await pointsHistoryCalc.deletePointsRecord(requestedUser.transaction[reservationIndex].tranCode)

        requestedUser.transaction.splice(reservationIndex, 1)
        await requestedUser.save()

        res.redirect(`/profile-info?id=${id}`)

    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        })
    }
}

const profileInformation = async (req, res) => {
    try {
        const id = req.query.id
        const userToShow = await User.findOne({ _id: id })
        const formattedDate = userToShow.dob.toISOString().split('T')[0]
        const parts = formattedDate.split('-');
        const mmddyyyy = `${parts[1]}-${parts[2]}-${parts[0]}`;
        const refUser = await User.findOne({memberId: userToShow.referredBy})


        let rewardMessage
        let rewardError

        if (req?.session?.rewardError || req?.session?.rewardMessage) {
            rewardMessage = req.session.rewardMessage
            rewardError = req.session.rewardError
            req.session.rewardMessage = null
            req.session.rewardError = null
        }
        

        const user = req?.user?.user || req.user
        const superadmin = user.isSuperAdmin


        const discounts = await getValues.getDiscountValues()
        const multipliers = await getValues.getMultiplierValues()

        return res.render('admin-page', { 
            user: userToShow, 
            refUser, 
            mmddyyyy, 
            superadmin, 
            activePage: 'profile', 
            discounts, 
            multipliers,
            rewardMessage,
            rewardError
        })
    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        })
    }
}

const redemption = async (req, res) => {
    try {
        const id = req.query.id
        const userToShow = await User.findOne({ _id: id })
        
        const yogaRewards = await getValues.getYogaRewardPoints()
        const fnbRewards = await getValues.getFnBRewardPoints()
        const vitaSpaRewards = await getValues.getVitaSpaRewardPoints()
        const retreatRewards = await getValues.getRetreatsRewardPoints()

        return res.render('redemption', { 
            user: userToShow, 
            activePage: 'redemption', 
            yogaRewards,
            fnbRewards,
            vitaSpaRewards,
            retreatRewards 
        })

    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        })
    }
}

const privacyAndPreferences = async (req, res) => {
    try {
        const id = req.query.id
        const userToShow = await User.findOne({ _id: id })

        return res.render('admin-page', { user: userToShow, activePage: 'privacy' })
    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        })
    }
}

const membershipInformation = async (req, res) => {
    try {
        const id = req.query.id
        const userToShow = await User.findOne({ _id: id })

        // const totalPoints = userToShow.transaction.reduce((total, transaction) => {
        //     return total + (transaction.pointsGained || 0)
        //   }, 0)
        
        // userToShow.membershipInfo.pointsAvailable = totalPoints;
        // await userToShow.save();

        return res.render('admin-page', { user: userToShow, activePage: 'membership' })
    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        })
    }
}

const pointsWallet = async (req, res) => {
    try {
        const id = req.query.id
        const requestedUser = await User.findOne({ _id: id })

        return res.render('admin-page', { user: requestedUser, activePage: 'pointsWallet' })
    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        })
    }
}

const transactionDetails = async (req, res) => {
    try {

        const { id, reservationIndex } = req.query
        const userToShow = await User.findById(id)
        const transactionObj = userToShow.transaction[reservationIndex]

        const user = req?.user?.user || req.user
        const superadmin = user.isSuperAdmin

        const discount = await getMultipliersDiscounts.getDiscount(id)
        // const netAmount = netAmount - (discount * netAmount)/100
        return res.render('transaction-details', { user: userToShow, transactionObj, superadmin, reservationIndex, activePage: 'pointsWallet' })
    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        })
    }
}

const discounts = async (req, res) => {
    try {

        const { id } = req.query
        const userToShow = await User.findById(id)

        const discounts = await getValues.getDiscountValues()
        const multipliers = await getValues.getMultiplierValues()

        const user = req?.user?.user || req.user
        const superadmin = user.isSuperAdmin

        return res.render('admin-page', { user: userToShow, activePage: 'discounts', discounts, multipliers, superadmin })

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

        res.redirect(`/admin-page?id=${id}`);

    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        })
    }
}

const updatePrivacyAndPreference = async (req, res) => {
    try {
        const id = req.query.id
        const { hasAcceptedPrivacyPolicy, hasGivenMarketingConsent } = req.body

        await User.findByIdAndUpdate({ _id: id }, {
            $set: {
                'privacy.hasAcceptedPrivacyPolicy': hasAcceptedPrivacyPolicy,
                'marketing.hasGivenMarketingConsent': hasGivenMarketingConsent
            }
        }, { new: true })

        res.redirect(`/profile-info?id=${id}`);

    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        })
    }
}

const updateMembershipInfo = async (req, res) => {
    try {
        res.redirect(`/profile-info`)
    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        })
    }
}

const updateTransactionInfo = async (req, res) => {
    try {
        const id = req.query.id
        res.redirect(`/profile-info?id=${id}`)
    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        })
    }
}

const mainlogin = async (req, res) => {
    try {
        res.render('main-login')
    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        })
    }
}

const getCSV = async (req, res) => {
    try {
        let users = []
        const userData = await User.find()

        userData.forEach((user) => {

            const { id, name, email, language, isVerified, isAdmin, isVendor, memberId, method, dob, mobile } = user

            const myDate = dob.toISOString().split('T')[0]

            users.push({
                'Id': id,
                'Member Id': memberId,
                'Name': name,
                'Email': email,
                'Language': language,
                'isVerified': isVerified,
                'isAdmin': isAdmin,
                'isVendor': isVendor,
                'Method': method,
                'DOB': myDate,
                'Mobile': mobile
            })
        })

        const csvFields = ['Id', 'Member Id', 'Name', 'Email', 'Language', 'isVerified', 'isAdmin', 'isVendor', 'Method', 'DOB', 'Mobile']

        const csvParser = new CsvParser({ fields: csvFields })
        const csvData = csvParser.parse(users)

        res.setHeader("Content-Type", "text/csv")
        res.setHeader("Content-Disposition", "attachment; filename=usersData.csv")

        res.status(200).end(csvData)

    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        })
    }
}

const updateDiscounts = async(req,res) => {
    try {
        const { id } = req.query
        const userToShow = await User.findById(id)
        const user = req?.user?.user || req.user
        const superadmin = user.isSuperAdmin

        var discounts = await getValues.getDiscountValues()
        var multipliers = await getValues.getMultiplierValues()

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const discountError = errors.errors[0].msg
            return res.render('admin-page', { discountError, user: userToShow, discounts, multipliers })
        }

        const {
            balanceDiscountp,
            vitalityDiscountp,
            harmonyDiscountp,
            serenityDiscountp
        } = req.body;

        const balanceDiscountNew = parseFloat(balanceDiscountp.replace('%', ''));
        const vitalityDiscountNew = parseFloat(vitalityDiscountp.replace('%', ''));
        const harmonyDiscountNew = parseFloat(harmonyDiscountp.replace('%', ''));
        const serenityDiscountNew = parseFloat(serenityDiscountp.replace('%', ''));

        await Pricing.updateOne({ "tierDiscount.tier": "Balance" }, { $set: { "tierDiscount.discount": balanceDiscountNew } })
        await Pricing.updateOne({ "tierDiscount.tier": "Vitality" }, { $set: { "tierDiscount.discount": vitalityDiscountNew } })
        await Pricing.updateOne({ "tierDiscount.tier": "Harmony" }, { $set: { "tierDiscount.discount": harmonyDiscountNew } })
        await Pricing.updateOne({ "tierDiscount.tier": "Serenity" }, { $set: { "tierDiscount.discount": serenityDiscountNew } })

        discounts = await getValues.getDiscountValues()
        multipliers = await getValues.getMultiplierValues()

        const discountMessage = "Discounts Updated"

        return res.render('admin-page', { discountMessage, user: userToShow , activePage: 'discounts', discounts, multipliers, superadmin})

    } catch (error) {
        const { id } = req.query
        const userToShow = await User.findById(id)

        const discounts = await getValues.getDiscountValues()
        const multipliers = await getValues.getMultiplierValues()

        const user = req?.user?.user || req.user
        const superadmin = user.isSuperAdmin
        return res.render('admin-page', { discountError: "An error occured", user: userToShow, activePage: 'discounts',superadmin, discounts, multipliers  })
    }
}

const updateMultipliers = async(req,res) => {
    try {
        const { id } = req.query
        const userToShow = await User.findById(id)
        const user = req?.user?.user || req.user
        const superadmin = user.isSuperAdmin

        var discounts = await getValues.getDiscountValues()
        var multipliers = await getValues.getMultiplierValues()

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const multiplierError = errors.errors[0].msg
            return res.render('admin-page', { multiplierError, user: userToShow, discounts, multipliers, superadmin })
        }

        const {
            lifeCafeMultiplier,
            yogaClassMultiplier,
            vitaSpaMultiplier,
            retreatsMultiplier
        } = req.body;

        await Pricing.updateOne({ "spendingMultiplier.spendingType": "Life Café" }, { $set: { "spendingMultiplier.multiplier": lifeCafeMultiplier } })
        await Pricing.updateOne({ "spendingMultiplier.spendingType": "Yoga Class" }, { $set: { "spendingMultiplier.multiplier": yogaClassMultiplier } })
        await Pricing.updateOne({ "spendingMultiplier.spendingType": "Vita Spa" }, { $set: { "spendingMultiplier.multiplier": vitaSpaMultiplier } })
        await Pricing.updateOne({ "spendingMultiplier.spendingType": "Retreats and YTT Packages" }, { $set: { "spendingMultiplier.multiplier": retreatsMultiplier } })

        discounts = await getValues.getDiscountValues()
        multipliers = await getValues.getMultiplierValues()

        const multiplierMessage = "Multipliers Updated"
        return res.render('admin-page', { multiplierMessage, user: userToShow , activePage: 'discounts', discounts, multipliers, superadmin})

    } catch (error) {
        const { id } = req.query
        const userToShow = await User.findById(id)

        console.log("Error")

        const discounts = await getValues.getDiscountValues()
        const multipliers = await getValues.getMultiplierValues()

        const user = req?.user?.user || req.user
        const superadmin = user.isSuperAdmin
        return res.render('admin-page', { multiplierError: "An error occured", user: userToShow, activePage: 'discounts', discounts, multipliers, superadmin })
    }
}

const addMemberPage = async (req, res) => {
    try {
        res.render('add-member')
    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        })
    }
}

const addMember = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const validationError = errors.errors[0].msg
            return res.render('add-member', { validationError })
        }

        const {
            firstname,
            lastname,
            email,
            dob,
            mobile,
            referredBy,
            language,
            hasAcceptedPrivacyPolicy,
            hasGivenMarketingConsent
        } = req.body;

        const password = `${firstname}123`

        const name = firstname + ' ' + lastname;
        
        const uniqueMemberId = await MemId.generateMemberId();
        const hashedPassword = await bcrypt.hash(password, 10);

        
        let admin = false;
        let superAdmin = false;
        let verified = false;
        let referrerId

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

        const randomString = randomstring.generate()
        const msg = '<p>Hello, ' + userData.name + `, Please click <a href = "${API_BASE_URL}/reset-password?token=` + randomString + '">here</a> to set your password. </p>'

        await PasswordReset.deleteMany({ user_id: userData._id })

        const passwordReset = new PasswordReset({
            user_id: userData._id,
            token: randomString
        })
        await passwordReset.save()

        mailer.sendMail(userData.email, 'Reset Password', msg)

        const accessToken = await tokenGen.generateAccessToken({ user: userData })

        await User.findByIdAndUpdate(userData._id, {
            $set: {
                "systemData.authentication": accessToken
            }
        })

        return res.render('add-member', { message: `Member added.` })

    } catch (error) {
        const enteredFields = req.body
        if (error.code && error.code === 11000) {
            const duplicateField = Object.keys(error.keyValue)[0]
            return res.render('add-member', { enteredFields, error: `${duplicateField} already exists.` })
        }
        return res.render('add-member', { enteredFields, error: error.message })
    }
}

const importAdmins = async (req,res) => {
    try {
        const usersData = []
        const response = await csv().fromFile(req.file.path)

        for (var x = 0; x < response.length; x++) {
            let password = `${response[x].firstname}123`
            let name = response[x].firstname + " " + response[x].lastname
            let uniqueMemberId = await MemId.generateMemberId()
            let hashedPassword = await bcrypt.hash(password, 10)

            let mobile = response[x].mobile.replace(/[^\d]/g, '')
            if (mobile && mobile[0] !== '+') {
                mobile = '+' + mobile
            }
            
            let admin = true
            let superAdmin = false
            let verified = true

            usersData.push({
                name,
                email: response[x].email,
                systemData: {
                    password: hashedPassword,
                },
                dob: response[x].dob,
                mobile,
                memberId: uniqueMemberId,
                isVerified: verified,
                isAdmin: admin,
                isSuperAdmin: superAdmin,
                privacy: {
                    hasAcceptedPrivacyPolicy: true,
                    createdAt: new Date(),
                },
                marketing: {
                    hasGivenMarketingConsent: true,
                    createdAt: new Date(),
                },
                membershipInfo: {
                    pointsAvailable: 0,
                    pointsForRedemptions: 0
                }
            })
        }

        let users

        try {
            users = await User.insertMany(usersData)
        } catch (error) {
            if (error.code && error.code === 11000) {

                reservationError = error.writeErrors.map((writeError) => {
                    return writeError.err.op.name
                })

                req.session.reservationError = "Duplicate error for the record: " + reservationError
                return res.redirect('/dashboard')
            }

            req.session.reservationError = error.message
            return res.redirect('/dashboard')
        }


        for (const user of users){
            let randomString = randomstring.generate()
            let msg = '<p>Hello, ' + user.name + `, Please click <a href = "${API_BASE_URL}/reset-password?token=` + randomString + '">here</a> to set your password. </p>'
           
            await PasswordReset.deleteMany({ user_id: user.id })
            const passwordReset = new PasswordReset({
                user_id: user.id,
                token: randomString
            })
            await passwordReset.save()
            mailer.sendMail(user.email, 'Reset Password', msg)

            let accessToken = await tokenGen.generateAccessToken({user})
            await User.findByIdAndUpdate(user.id, {
                $set: {
                    "systemData.authentication": accessToken
                }
            })   
        }
        
        req.session.reservationMessage = "Admins added successfully"
        return res.redirect('/dashboard')
                
    } catch (error) {
        req.session.reservationError = error.message
        return res.redirect('/dashboard')
    }
}

const redeemPoints = async(req,res) => {
    try {
        const id = req.query.id
        const reward = req.body.reward
        const discounts = await getValues.getDiscountValues()
        const multipliers = await getValues.getMultiplierValues()

        const userToShow = await User.findById(id)
        let pointsToDeduct = 0

        const rewardYoga = await Reward.findOne({ "yogaRewards.yRewards": reward })
        const rewardFb = await Reward.findOne({ "fnbRewards.fbRewards": reward })
        const rewardVita = await Reward.findOne({ "vitaSpaRewards.vsRewards": reward })
        const rewardRetreat = await Reward.findOne({ "retreatRewards.rRewards": reward })

        if(rewardYoga){
            pointsToDeduct = rewardYoga.yogaRewards.yPointRequired
        }
        else if(rewardFb){
            pointsToDeduct = rewardFb.fnbRewards.fbPointRequired
        }
        else if(rewardVita){
            pointsToDeduct = rewardVita.vitaSpaRewards.vsPointRequired
        }
        else if(rewardRetreat){
            pointsToDeduct = rewardRetreat.retreatRewards.rPointRequired
        }

        const yogaRewards = await getValues.getYogaRewardPoints()
        const fnbRewards = await getValues.getFnBRewardPoints()
        const vitaSpaRewards = await getValues.getVitaSpaRewardPoints()
        const retreatRewards = await getValues.getRetreatsRewardPoints()

        if(userToShow.membershipInfo.pointsForRedemptions < pointsToDeduct){
            const error = "You don't have enough points to redeem this reward."
            req.session.rewardError = error
            return res.redirect(`/profile-info?id=${id}`)
        }

        const tranCode = await uniqueTranCode.generateUniqueCode()
        userToShow.redeem.push({
            reward,
            pointsLost: pointsToDeduct,
            tranCode
        })

        const userId = userToShow.id
        const totalPointsBefore = userToShow.membershipInfo.pointsForRedemptions

        await pointsHistoryCalc.subtractPoints(userId, pointsToDeduct, totalPointsBefore, reward, tranCode)

        userToShow.membershipInfo.pointsForRedemptions -= pointsToDeduct
        await userToShow.save()
        
        const message = `You have successfully redeemed ${reward}`
        req.session.rewardMessage = message
        return res.redirect(`/profile-info?id=${id}`)

        // return res.render('redemption', { 
        //     user: userToShow, 
        //     activePage: 'redemption', 
        //     yogaRewards,
        //     fnbRewards,
        //     vitaSpaRewards,
        //     retreatRewards,
        //     message
        // })

    } catch (error) {
        return res.status(500).json({ success: false, msg: error.message });
    }
}


module.exports = {
    adminDashboard,
    addTransactionPage,
    makeTransaction,
    deleteUser,
    deleteTransaction,
    profileInformation,
    updateProfile,
    mainlogin,
    redemption,
    privacyAndPreferences,
    membershipInformation,
    pointsWallet,
    transactionDetails,
    discounts,
    updatePrivacyAndPreference,
    updateMembershipInfo,
    updateTransactionInfo,
    getCSV,
    updateDiscounts,
    updateMultipliers,
    addMemberPage,
    addMember,
    importAdmins,
    redeemPoints
}