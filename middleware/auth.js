const jwt = require('jsonwebtoken')
const Blacklist = require('../models/blacklist')
const passport = require('passport')

const customAuth = async (req, res, next) => {
    if (req.isAuthenticated()) {
        next()
    }
    else {
        const token = req.headers["Authorization"] || req.query.token || req.headers["authorization"]

        if (!token) {
            return res.status(403).json({
                success: false,
                msg: 'A token is required for authentication'
            })
        } else {
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
                req.headers["Authorization"] = token
                next()

            } catch (error) {
                return res.status(401).json({
                    success: false,
                    msg: 'Invalid token'
                })
            }
        }
    }
}

module.exports = customAuth