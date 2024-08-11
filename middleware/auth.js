const jwt = require('jsonwebtoken')
const Blacklist = require('../models/blacklist')
const User = require('../models/userModel')

const customAuth = async (req, res, next) => {
    if (req.isAuthenticated() || req.body?.isAuthenticated) {
        next()
    }
    else {
        let token = req.session.token

        if (!token) {
            if (req.originalUrl.startsWith('/api/')) {
                return res.status(401).json({ message: 'Unauthorized access' });
            }
            res.redirect('/')
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

                const decodedUser = await User.findById(decodedData._id)

                req.user = decodedUser
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