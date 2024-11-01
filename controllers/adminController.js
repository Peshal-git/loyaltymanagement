const User = require('../models/userModel')
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

const addReservationPage = async (req, res) => {
    try {
        const { id } = req.query
        res.render('add-reservation', { id })
    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        })
    }
}

const makeReservation = async (req, res) => {
    try {
        const { id } = req.query
        const user = await User.findById(id)
        const { transactionDate,
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

        const enteredFields = req.body

        const tranCodes = await User.aggregate([
            { $unwind: "$reservation" },
            { $project: { _id: 0, tranCode: "$reservation.tranCode" } }
        ])

        const tranCodeValues = tranCodes.map(item => item.tranCode)
        const tranCodeExists = tranCodeValues.includes(Number(tranCode))

        if (tranCodeExists) {
            const error = 'Transaction code already exists. Try a new one.'
            return res.render('add-reservation', { error, id, enteredFields })
        }

        const response = await fetch(`${API_BASE_URL}/api/add-reservation`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                memberId: user.memberId,
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
                service
            })
        })

        const responseData = await response.json()

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        if (responseData?.errors) {
            const error = responseData?.errors[0]?.msg
            return res.render('add-reservation', { error, id })
        }

        const message = "Reservation Done"
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

const deleteReservation = async (req, res) => {
    try {
        const { id, reservationIndex } = req.query
        const requestedUser = await User.findById(id)

        if (reservationIndex < 0 || reservationIndex >= requestedUser.reservation.length) {
            return res.status(400).json({
                success: false,
                msg: 'Invalid reservation index'
            });
        }

        requestedUser.reservation.splice(reservationIndex, 1);
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

const systemData = async (req, res) => {
    try {
        const id = req.query.id
        const userToShow = await User.findOne({ _id: id })
        return res.render('system-data', { user: userToShow, activePage: 'system' })
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
        return res.render('membership-info', { user: userToShow, activePage: 'membership' })
    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        })
    }
}

const reservationInformation = async (req, res) => {
    try {
        const id = req.query.id
        const requestedUser = await User.findOne({ _id: id })

        return res.render('reservation-info', { user: requestedUser, activePage: 'reservation' })
    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        })
    }
}

const reservationDetails = async (req, res) => {
    try {

        const { id, reservationIndex } = req.query
        const userToShow = await User.findById(id)
        const reservationObj = userToShow.reservation[reservationIndex]

        return res.render('reservation-details', { user: userToShow, reservationObj, reservationIndex, activePage: 'reservation' })
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

const updateReservationInfo = async (req, res) => {
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

module.exports = {
    adminDashboard,
    addReservationPage,
    makeReservation,
    deleteUser,
    deleteReservation,
    profileInformation,
    updateProfile,
    mainlogin,
    systemData,
    privacyAndPreferences,
    membershipInformation,
    reservationInformation,
    reservationDetails,
    updatePrivacyAndPreference,
    updateMembershipInfo,
    updateReservationInfo,
    getCSV
}