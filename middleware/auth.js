const jwt = require('jsonwebtoken')
const Blacklist = require('../models/blacklist')
const passport = require('passport')

const customAuth = async (req, res, next) => {
    if (req.isAuthenticated()) {
        return next()
    }
    else {
        const token = req.body.token || req.query.token || req.headers["authorization"]

        if (!token) {
            return res.status(403).json({
                success: false,
                msg: 'A token is required for authentication'
            })
        }

        try {
            const bearer = token.split(' ')
            const bearerToken = bearer[1]

            const blacklistedToken = await Blacklist.findOne({ token: bearerToken })

            if (blacklistedToken) {
                return res.status(400).json({
                    success: false,
                    msg: 'This session has already expired. Please login again.'
                })

            }

            const decodedData = jwt.verify(bearerToken, process.env.ACCESS_TOKEN_SECRET)
            req.user = decodedData


        } catch (error) {
            return res.status(401).json({
                success: false,
                msg: 'Invalid token'
            })
        }

        return next()
    }
}

module.exports = customAuth