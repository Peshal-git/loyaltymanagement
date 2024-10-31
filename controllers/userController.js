const User = require('../models/userModel')
const { validationResult } = require('express-validator')


const dashboardRedirect = async (req, res) => {
    try {
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
        const formattedDate = userData.dob.toISOString().split('T')[0]
        const parts = formattedDate.split('-');
        const mmddyyyy = `${parts[1]}-${parts[2]}-${parts[0]}`;
        res.render('user-profile', { user: userData, mmddyyyy })
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

const updateAdditionalInfoAndConsent = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const enteredFields = req.body;
            const id = req.query.id;
            return res.render('add-info', { userToUpdate: { id }, enteredFields, error: errors.errors[0].msg });
        }

        const { dob, mobile, hasAcceptedPrivacyPolicy } = req.body;
        let hasGivenMarketingConsent = req.body.hasGivenMarketingConsent
        const id = req.query.id;

        if(!hasGivenMarketingConsent){
            hasGivenMarketingConsent = false;
        }

        const user = await User.findById(id);

        let privacyCreated = new Date()
        let marketingCreated = new Date()
        if (user?.privacy?.createdAt) {
            privacyCreated = userExits.privacy.createdAt
        }
        if (user?.marketing?.createdAt) {
            marketingCreated = userExits.marketing.createdAt
        }


        const data = {
            dob,
            mobile,
            "privacy.hasAcceptedPrivacyPolicy": hasAcceptedPrivacyPolicy,
            "marketing.hasGivenMarketingConsent": hasGivenMarketingConsent,
            "privacy.createdAt": privacyCreated,
            "marketing.createdAt": marketingCreated,
        };

        const updatedUser = await User.findByIdAndUpdate(id, { $set: data }, { new: true });

        res.redirect('/dashboard')

    } catch (error) {
        return res.status(500).json({ success: false, msg: error.message });
    }
};


module.exports = {
    profilePage,
    addInfoPage,
    dashboardRedirect,
    updateAdditionalInfoAndConsent
}