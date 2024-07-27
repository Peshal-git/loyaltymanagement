const User = require('../models/userModel')
const askForAddInfo = async (req, res, next) => {
    try {
        const userId = req.user.id
        const checkUser = await User.findById(userId)

        if (!checkUser.mobile || !checkUser.dob) {
            return res.redirect(`/provide-addinfo?id=${userId}`)
        }

        next()
    } catch (error) {
        return res.json({
            success: false,
            msg: 'Additional info error'
        })
    }

}

const adminCheck = (req, res, next) => {
    if (req.user?.isAdmin || req.user?.user?.isAdmin) {
        next()
    } else {
        res.redirect('/admin')
    }
}

const userCheck = (req, res, next) => {
    if (!req.user) {
        res.redirect('/admin')
    } else {
        next()
    }
}

const getTokenFromLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const apiResponse = await fetch('http://localhost:8000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await apiResponse.json();
        const token = `Bearer ${data.accessToken}`
        req.headers['Authorization'] = token
        next()

    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const logout = async (req, res, next) => {
    try {
        const token = req.headers["Authorization"]
        if (token) {
            await fetch('http://localhost:8000/api/logout', {
                method: 'GET',
                headers: {
                    'Authorization': token
                },
            })
            next()

        } else {
            req.logout(() => {
                next()
            })
        }

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
    askForAddInfo,
    adminCheck,
    userCheck,
    getTokenFromLogin,
    logout,
    updateMembershipInfo,
    updateReservationInfo
}