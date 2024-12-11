const getMultipliersDiscounts = require('../helpers/getMultipliersDiscounts');
const User = require('../models/userModel')

const API_BASE_URL = process.env.NODE_ENV === 'production'
    ? process.env.API_BASE_URL_PROD
    : process.env.API_BASE_URL_DEV;

const registerUser = async (req, res, next) => {
    try {
        const { firstname,
            lastname,
            email,
            password,
            dob,
            mobile,
            referredBy,
            language,
            hasAcceptedPrivacyPolicy,
            hasGivenMarketingConsent } = req.body
        const response = await fetch(`${API_BASE_URL}/api/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
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
            })
        })

        const responseData = await response.json()

        if (responseData?.errors) {
            const enteredFields = req.body
            return res.render('register', { enteredFields, error: responseData.errors[0].msg })
        }
        else {
            if (!responseData.success) {
                const enteredFields = req.body
                return res.render('register', { enteredFields, error: responseData.msg })
            }
            else {
                req.session.registrationMessage = responseData?.msg
                const memberId = responseData?.user?.memberId
                req.session.memberId = memberId
            }
        }

        next()
    } catch (error) {
        return res.json({
            success: false,
            msg: error.message
        })
    }
}

const createToken = async (req, res, next) => {
    try {
        const { email, password } = req.body

        const apiResponse = await fetch(`${API_BASE_URL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        })

        const data = await apiResponse.json()

        if (!data?.success) {
            if (data?.errors) {
                return res.render('main-login', { error: data.errors[0].msg })
            }
            return res.render('main-login', { error: data.msg })
        }
        next()

    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const logout = async (req, res, next) => {
    try {
        if (req.user?.systemData?.authentication) {
            const token = req.user?.systemData?.authentication
            await fetch(`${API_BASE_URL}/api/logout`, {
                method: 'GET',
                headers: {
                    'Authorization': token
                },
            })
        }

        next()
    } catch (error) {
        return res.json({
            success: false,
            msg: error.message
        })
    }
}

const updateMembershipInfo = async (req, res, next) => {
    try {
        const id = req.query.id
        const userToUpdate = await User.findById(id)

        const {
            pointsAvailable,
            lastVisit,
            lastCommunication,
            lastMarketingCommunication,
            expiringPoints,
            lastUsagePoints,
            totalLifetimePoints

        } = req.body

        const response = await fetch(`${API_BASE_URL}/api/update-member-info`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                memberId: userToUpdate.memberId,
                pointsAvailable,
                lastVisit,
                lastCommunication,
                lastMarketingCommunication,
                expiringPoints,
                lastUsagePoints,
                totalLifetimePoints
            })
        })

        const data = await response.json()

        if (!data?.success) {
            if (data?.errors) {
                return res.render('membership-info', { error: data.errors[0].msg })
            }
            return res.render('membership-info', { error: data.msg })
        }

        next()

    } catch (error) {
        return res.json({
            success: false,
            msg: error.message
        })
    }
}

const updateTransactionInfo = async (req, res, next) => {
    try {
        const { id, reservationIndex } = req.query
        const userToUpdate = await User.findById(id)

        const {
            spendingType,
            amount
        } = req.body
        
        const multiplier = await getMultipliersDiscounts.getMultiplier(spendingType)
        const pointsGained = amount * multiplier

        const response = await fetch(`${API_BASE_URL}/api/update-transaction`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                reservationIndex,
                memberId: userToUpdate.memberId,
                spendingType,
                amount,
                pointsGained
            })
        })

        const data = await response.json()

        if (!data?.success) {
            if (data?.errors) {
                return res.render('transaction-details', { error: data.errors[0].msg })
            }
            return res.render('points-wallet', { error: data.msg })
        }

        next()

    } catch (error) {
        return res.json({
            success: false,
            msg: error.message
        })
    }
}


module.exports = {
    registerUser,
    createToken,
    logout,
    updateMembershipInfo,
    updateTransactionInfo
}