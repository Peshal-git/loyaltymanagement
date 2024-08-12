const User = require('../models/userModel')

const registerUser = async (req, res, next) => {
    try {
        const { firstname,
            lastname,
            email,
            password,
            dob,
            mobile,
            language } = req.body
        const response = await fetch('http://localhost:8000/api/register', {
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
                language
            })
        })

        const responseData = await response.json()

        if (responseData?.errors) {
            req.session.errorResponse = responseData?.errors[0]?.msg

        }
        else {
            if (responseData?.msg) {
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

        const apiResponse = await fetch('http://localhost:8000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        })

        const data = await apiResponse.json()

        if (!data?.success) {
            if (data?.errors) {
                return res.render('weblogin', { error: data.errors[0].msg })
            }
            return res.render('weblogin', { error: data.msg })
        }
        next()

    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const logout = async (req, res, next) => {
    try {
        const token = req.user.systemData.authentication

        await fetch('http://localhost:8000/api/logout', {
            method: 'GET',
            headers: {
                'Authorization': token
            },
        })

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

        const response = await fetch('http://localhost:8000/api/update-member-info', {
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

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        next()

    } catch (error) {
        return res.json({
            success: false,
            msg: error.message
        })
    }
}

const updateReservationInfo = async (req, res, next) => {
    try {
        const { id, reservationIndex } = req.query
        const userToUpdate = await User.findById(id)

        const {
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

        const response = await fetch('http://localhost:8000/api/update-reservation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                reservationIndex,
                memberId: userToUpdate.memberId,
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

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
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
    updateReservationInfo,
}