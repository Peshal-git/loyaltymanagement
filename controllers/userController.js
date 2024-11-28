const Reward = require('../models/rewardsModel')
const User = require('../models/userModel')
const { validationResult } = require('express-validator')
const getValues = require('../helpers/getValues')


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

        const totalPoints = userData.transaction.reduce((total, transaction) => {
            return total + (transaction.pointsGained || 0)
        }, 0)
        
        userData.membershipInfo.pointsAvailable = totalPoints;
        await userData.save();

        res.render('user-profile', { user: userData })
    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        })
    }
}

const activitiesPage = async (req, res) => {
    try {
        let userData

        if (req?.user?.user) {
            userData = req.user.user
        }
        else {
            userData = req.user
        }

        
        const yogaRewards = await getValues.getYogaRewardPoints()
        const fnbRewards = await getValues.getFnBRewardPoints()
        const vitaSpaRewards = await getValues.getVitaSpaRewardPoints()
        const retreatRewards = await getValues.getRetreatsRewardPoints()

        return res.render('activities', { 
            user: userData, 
            activePage: 'redemption', 
            yogaRewards,
            fnbRewards,
            vitaSpaRewards,
            retreatRewards 
        })

    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        })
    }
}

const aboutUsPage = async (req, res) => {
    try {
        let userData

        if (req?.user?.user) {
            userData = req.user.user
        }
        else {
            userData = req.user
        }

        res.render('about-us', { user: userData })
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

        const { dob, mobile, referredBy, hasAcceptedPrivacyPolicy } = req.body;
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

        let referrerId
        if(referredBy){
            const userExists = await User.findOne({
                $or: [
                    { email: referredBy },
                    { memberId: referredBy }
                ]
            })

            if(!userExists){
                return res.render('add-info', {userToUpdate: user, error: `${referredBy} can not be found.`});
            }
            else{
                if (!userExists.referredTo.includes(user.memberId)) {
                    userExists.referredTo.push(user.memberId);
                    await userExists.save();
                }
                referrerId = userExists.memberId
            }
        }

        const data = {
            dob,
            mobile,
            referredBy: referrerId,
            "privacy.hasAcceptedPrivacyPolicy": hasAcceptedPrivacyPolicy,
            "marketing.hasGivenMarketingConsent": hasGivenMarketingConsent,
            "privacy.createdAt": privacyCreated,
            "marketing.createdAt": marketingCreated,
            "membershipInfo.pointsAvailable": 0.00,
            "membershipInfo.pointsForRedemptions": 0.00,
            isAdmin: false,
            isSuperAdmin: false
        }

        const updatedUser = await User.findByIdAndUpdate(id, { $set: data }, { new: true });

        res.redirect('/dashboard')

    } catch (error) {
        const id = req.query.id;
        const user = await User.findById(id);

        if (error.code && error.code === 11000) {
            const duplicateField = Object.keys(error.keyValue)[0];
            return res.render('add-info', {userToUpdate: user, error: `${duplicateField} already exists.`});
        }
        return res.status(500).json({ success: false, msg: error.message });
    }
};

const reedemPoints = async(req,res) => {
    try {
        const id = req.query.id
        const reward = req.body.reward
        const userToShow = await User.findById(id)
        let pointsToDeduct = 0

        const rewardYoga = await Reward.findOne({ "yogaRewards.yRewards": reward })
        const rewardFb = await Reward.findOne({ "fnbRewards.fbRewards": reward })
        const rewardVita = await Reward.findOne({ "vitaSpaRewards.vsRewards": reward })
        const rewardRetreat = await Reward.findOne({ "retreatRewards.rRewards": reward })

        if(rewardYoga){
            pointsToDeduct = rewardYoga.yogaRewards.yPointRequired
        }
        else if(rewardFb){
            pointsToDeduct = rewardFb.fnbRewards.fbPointRequired
        }
        else if(rewardVita){
            pointsToDeduct = rewardVita.vitaSpaRewards.vsPointRequired
        }
        else if(rewardRetreat){
            pointsToDeduct = rewardRetreat.retreatRewards.rPointRequired
        }

        const yogaRewards = await getValues.getYogaRewardPoints()
        const fnbRewards = await getValues.getFnBRewardPoints()
        const vitaSpaRewards = await getValues.getVitaSpaRewardPoints()
        const retreatRewards = await getValues.getRetreatsRewardPoints()

        if(userToShow.membershipInfo.pointsForRedemptions < pointsToDeduct){
            const error = "You don't have enough points to redeem this reward."

            return res.render('redemption', { 
                user: userToShow, 
                activePage: 'redemption', 
                yogaRewards,
                fnbRewards,
                vitaSpaRewards,
                retreatRewards,
                error
            })
        }

        userToShow.membershipInfo.pointsForRedemptions -= pointsToDeduct;
        await userToShow.save()
        
        
        const message = `You have successfully redeemed ${reward}`

        return res.render('redemption', { 
            user: userToShow, 
            activePage: 'redemption', 
            yogaRewards,
            fnbRewards,
            vitaSpaRewards,
            retreatRewards,
            message
        })

    } catch (error) {
        return res.status(500).json({ success: false, msg: error.message });
    }
}


module.exports = {
    profilePage,
    aboutUsPage,
    activitiesPage,
    addInfoPage,
    dashboardRedirect,
    updateAdditionalInfoAndConsent,
    reedemPoints
}