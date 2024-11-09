const User = require('../models/userModel')
const Pricing = require('../models/pricingModel')
const getValues = require('../helpers/getValues')
const moment = require('moment')
const CsvParser = require('json2csv').Parser


const { validationResult } = require('express-validator')

const API_BASE_URL = process.env.NODE_ENV === 'production'
    ? process.env.API_BASE_URL_PROD
    : process.env.API_BASE_URL_DEV;

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
        if (req?.session?.reservationMessage) {
            message = req.session.reservationMessage
            req.session.reservationMessage = null
            return res.render('admin-dashboard', { user: userData, message })
        }
        return res.render('admin-dashboard', { user: userData })
    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        })
    }
}

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
            amount,
            pointsGained,
            tranCode
         } = req.body

        const enteredFields = req.body

        const tranCodes = await User.aggregate([
            { $unwind: "$transaction" },
            { $project: { _id: 0, tranCode: "$transaction.tranCode" } }
        ])

        const tranCodeValues = tranCodes.map(item => item.tranCode)
        const tranCodeExists = tranCodeValues.includes(tranCode)

        if (tranCodeExists) {
            const error = 'Transaction code already exists. Try a new one.'
            return res.render('add-transaction', { error, id, enteredFields })
        }

        const response = await fetch(`${API_BASE_URL}/api/add-transaction`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                memberId: user.memberId,
                spendingType,
                amount,
                pointsGained,
                tranCode
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
        return res.redirect('/dashboard')

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
            res.render('admin-dashboard', {user: userData, error: "Cannot delete admin"})
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
            });
        }

        requestedUser.transaction.splice(reservationIndex, 1);
        await requestedUser.save();
        res.redirect('/dashboard')

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
        return res.render('profile-info', { user: userToShow, mmddyyyy, activePage: 'profile'})
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
        return res.render('redemption', { user: userToShow, activePage: 'redemption' })
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
        return res.render('privacy-preference', { user: userToShow, activePage: 'privacy' })
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

        const totalPoints = userToShow.transaction.reduce((total, transaction) => {
            return total + (transaction.pointsGained || 0)
          }, 0)
        
        userToShow.membershipInfo.pointsAvailable = totalPoints;
        await userToShow.save();
        
        return res.render('membership-info', { user: userToShow, activePage: 'membership' })
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

        return res.render('points-wallet', { user: requestedUser, activePage: 'pointsWallet' })
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

        return res.render('transaction-details', { user: userToShow, transactionObj, reservationIndex, activePage: 'pointsWallet' })
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

        if (req.user?.isSuperAdmin || req.user?.user?.isSuperAdmin) {
            return res.render('super-admin', { user: userToShow, activePage: 'discounts', discounts, multipliers })
        } else {
            return res.render('discounts', { user: userToShow, activePage: 'discounts', discounts, multipliers })
        }
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

        res.redirect('/dashboard');

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

        res.redirect('/dashboard');

    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        })
    }
}

const updateMembershipInfo = async (req, res) => {
    try {
        res.redirect('/dashboard')
    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        })
    }
}

const updateTransactionInfo = async (req, res) => {
    try {
        res.redirect('/dashboard')
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

const getDiscount = async(req,res) => {
    try {
        const id = req.query.id
        const user = await User.findOne({ _id: id })
        const discountPercent = await Pricing.findOne({ "tierDiscount.tier": user.tier })
        if (discountPercent.tierDiscount) {
            res.json({ discount: discountPercent.tierDiscount.discount });
        } else {
            res.status(404).send('Discount not found');
        }
    } catch (err) {
        res.status(500).send('Server error');
    }
}

const getMultiplier = async(req,res) => {
    try {
        const typeSelected = req.query.spendingType
        const multiplierForSpending = await Pricing.findOne({ "spendingMultiplier.spendingType": typeSelected })
        if (multiplierForSpending.spendingMultiplier) {
            res.json({ multiplier: multiplierForSpending.spendingMultiplier.multiplier })
        } else {
            res.status(404).send('Multiplier not found')
        }
    } catch (err) {
        res.status(500).send('Server error');
    }
}

const updateDiscounts = async(req,res) => {
    try {
        const { id } = req.query
        const userToShow = await User.findById(id)

        var discounts = await getValues.getDiscountValues()
        var multipliers = await getValues.getMultiplierValues()

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const discountError = errors.errors[0].msg
            return res.render('super-admin', { discountError, user: userToShow, discounts, multipliers })
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
        return res.render('super-admin', { discountMessage, user: userToShow , activePage: 'discounts', discounts, multipliers})

    } catch (error) {
        const { id } = req.query
        const userToShow = await User.findById(id)

        console.log("Error")

        const discounts = await getValues.getDiscountValues()
        const multipliers = await getValues.getMultiplierValues()

        return res.render('super-admin', { discountError: "An error occured", user: userToShow, activePage: 'discounts', discounts, multipliers  })
    }
}

const updateMultipliers = async(req,res) => {
    try {
        const { id } = req.query
        const userToShow = await User.findById(id)

        var discounts = await getValues.getDiscountValues()
        var multipliers = await getValues.getMultiplierValues()

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const multiplierError = errors.errors[0].msg
            return res.render('super-admin', { multiplierError, user: userToShow, discounts, multipliers })
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
        return res.render('super-admin', { multiplierMessage, user: userToShow , activePage: 'discounts', discounts, multipliers})

    } catch (error) {
        const { id } = req.query
        const userToShow = await User.findById(id)

        console.log("Error")

        const discounts = await getValues.getDiscountValues()
        const multipliers = await getValues.getMultiplierValues()

        return res.render('super-admin', { multiplierError: "An error occured", user: userToShow, activePage: 'discounts', discounts, multipliers  })
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
    getDiscount,
    getMultiplier,
    updateDiscounts,
    updateMultipliers
}