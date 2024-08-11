const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20')
const FacebookStrategy = require('passport-facebook')
const User = require('../models/userModel')
const MemId = require('../helpers/memberIdGen')

passport.serializeUser((user, done) => {
    done(null, user.id)
})

passport.deserializeUser((id, done) => {
    User.findById(id).then((user) => {
        done(null, user)
    })
})

passport.use(new GoogleStrategy({
    callbackURL: '/auth/google/redirect',
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
    callbackURL: '/auth/facebook/redirect',
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    profileFields: ['id', 'displayName', 'email']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const currentUser = await User.findOne({ facebookId: profile.id })
        if (currentUser) {
            console.log(`User is ${currentUser}`)
            done(null, currentUser)

        } else {
            const val = await MemId.generateMemberId();
            const uniqueMemberId = val.toString();
            new User({
                method: "Facebook",
                name: profile.displayName,
                facebookId: profile.id,
                email: profile.emails[0].value,
                isVerified: true,
                memberId: uniqueMemberId
            })
            const savedUser = await newUser.save();
            console.log(`New user created: ${savedUser}`);
            done(null, savedUser);
        }
    } catch (error) {
        console.error("Error during authentication:", error);
        done(error)
    }
}))