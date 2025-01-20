const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20')
const FacebookStrategy = require('passport-facebook')
const LocalStrategy = require('passport-local').Strategy
const User = require('../models/userModel')
const MemId = require('../helpers/memberIdGen')
const bcrypt = require('bcryptjs')

passport.serializeUser((user, done) => {
    done(null, user.id)
})

passport.deserializeUser((id, done) => {
    User.findById(id).then((user) => {
        done(null, user)
    })
})

const API_BASE_URL = process.env.NODE_ENV === 'production'
    ? process.env.API_BASE_URL_PROD
    : process.env.API_BASE_URL_DEV;

passport.use(new GoogleStrategy({
    callbackURL: `${API_BASE_URL}/auth/google/redirect`,
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const currentUser = await User.findOne({ googleId: profile.id })

        if (currentUser) {
            currentUser.systemData = {
                authentication: accessToken
            }
            await currentUser.save()
            done(null, currentUser)
        } else {
            const val = await MemId.generateMemberId()
            const uniqueMemberId = val.toString()

            const newUser = new User({
                method: "Google",
                name: profile.displayName,
                googleId: profile.id,
                email: profile.emails[0].value,
                isVerified: true,
                memberId: uniqueMemberId,
            })

            await newUser.save()
            done(null, newUser)
        }
    } catch (error) {
        console.error("Error during authentication:", error);
        done(error)
    }
}))

passport.use(new FacebookStrategy({
    callbackURL: `${API_BASE_URL}/auth/facebook/redirect`,
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    profileFields: ['id', 'displayName', 'email']
}, async (accessToken, refreshToken, profile, done) => {
    try {

        const currentUser = await User.findOne({ facebookId: profile.id })

        if (currentUser) {
            currentUser.systemData = {
                authentication: accessToken
            }
            await currentUser.save()
            done(null, currentUser)
        } else {
            const val = await MemId.generateMemberId()
            const uniqueMemberId = val.toString()

            const newUser = new User({
                method: "Facebook",
                name: profile.displayName,
                facebookId: profile.id,
                email: profile.emails[0].value,
                isVerified: true,
                memberId: uniqueMemberId
            })
            await newUser.save()
            done(null, newUser)
        }
    } catch (error) {
        console.error("Error during authentication:", error);
        done(error)
    }
}))

passport.use(new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
        try {
            const user = await User.findOne({ email: email })
            const passwordMatch = await bcrypt.compare(password, user.systemData.password)

            if (!user || !passwordMatch) {
                return done(null, false, { message: 'Invalid email or password' });
            }

            return done(null, user)
        } catch (err) {
            return done(err);
        }
    }
))