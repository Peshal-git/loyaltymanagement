const User = require('../models/userModel')
const { validationResult } = require('express-validator')

const consentPage = async (req, res) => {
    try {
        let memberId
        if (req.session?.memberId) {
            memberId = req.session.memberId
        }
        const enteredFields = req.body
        if (req?.session?.errorResponse) {
            const errorMessage = req?.session?.errorResponse
            return res.render('register', { enteredFields, error: errorMessage })
        }
        res.render('consent', { memberId })
    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        })
    }
}

const consentUpdate = async (req, res) => {
    try {
        let privacyPolicy
        let marketingConsent
        let memId

        const { hasAcceptedPrivacyPolicy, hasGivenMarketingConsent } = req.body

        console.log(req.query.memberId)

        if (req.query?.memberId) {
            memId = req.query.memberId
        }
        else {
            memId = req.user.memberId
        }


        if (hasAcceptedPrivacyPolicy === "true") {
            privacyPolicy = true
        } else {
            privacyPolicy = false
        }

        if (hasGivenMarketingConsent === "true") {
            marketingConsent = true
        } else {
            marketingConsent = false
        }

        await fetch('http://localhost:8000/api/policy-and-consent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                memberId: memId,
                hasAcceptedPrivacyPolicy: privacyPolicy,
                hasGivenMarketingConsent: marketingConsent
            })
        })

        res.redirect('/dashboard')
    } catch (error) {
        return res.json({
            success: false,
            msg: error.message
        })
    }
}


const profilePage = async (req, res) => {
    try {
        let userData

        if (req?.user?.user) {
            userData = req.user.user
        }
        else {
            userData = req.user
        }
        res.render('user-profile', { user: userData })
    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        })
    }
}

const addInfoPage = async (req, res) => {
    try {
        const id = req.query.id
        const userToUpdate = await User.findById(id)
        return res.render('add-info', { userToUpdate })
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
        const enteredFields = req.body
        const id = req.query.id

        const userToUpdate = {
            id
        }

        if (!errors.isEmpty()) {
            return res.render('add-info', { userToUpdate, enteredFields, error: errors.errors[0].msg })
        }

        const { dob, mobile } = req.body

        const data = {
            dob,
            mobile
        }

        const userData = await User.findByIdAndUpdate({ _id: id }, {
            $set: data
        }, { new: true })

        res.redirect('/consent')
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        })
    }
}

module.exports = {
    consentPage,
    consentUpdate,
    profilePage,
    addInfoPage,
    updateDobAndMobile,
}