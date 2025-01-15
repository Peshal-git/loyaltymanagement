const Reward = require("../models/rewardsModel");
const User = require("../models/userModel");
const { validationResult } = require("express-validator");
const getValues = require("../helpers/getValues");
const PointsHistory = require("../models/pointsHistoryModel");
const getPaginations = require("../helpers/getPaginations");
const CsvParser = require("json2csv").Parser;
const Pricing = require('../models/pricingModel')

const dashboardRedirect = async (req, res) => {
  try {
    res.redirect("/dashboard");
  } catch (error) {
    return res.json({
      success: false,
      msg: error.message,
    });
  }
};

const profilePage = async (req, res) => {
  try {
    let userData;

    if (req?.user?.user) {
      userData = req.user.user;
    } else {
      userData = req.user;
    }

    const totalPoints = userData.transaction.reduce((total, transaction) => {
      return total + (transaction.pointsGained || 0);
    }, 0);

    userData.membershipInfo.pointsAvailable = totalPoints;
    await userData.save();

    return res.render("user-profile", { user: userData });
  } catch (error) {
    return res.status(400).json({
      success: false,
      msg: error.message,
    });
  }
};

const walletPage = async (req, res) => {
  try {
    let userData;

    if (req?.user?.user) {
      userData = req.user.user;
    } else {
      userData = req.user;
    }

    const userId = userData.id;

    const history = await PointsHistory.find({ userId }).sort({
      transactionDate: -1,
    });

    const page = Number(req.query.page) || 1;
    const limit = 5;

    const {
      historiesToShow,
      totalPages,
      prevPage,
      nextPage,
      currentPage,
      pages,
    } = await getPaginations.getPaginatedHistory(history, page, limit);

    let message;
    if (req?.session?.walletMessage) {
      message = req.session.walletMessage;
      req.session.walletMessage = null;
    }

    return res.render("wallet", {
      historiesToShow,
      totalPages,
      prevPage,
      nextPage,
      currentPage,
      pages,
      message,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      msg: error.message,
    });
  }
};

const aboutUsPage = async (req, res) => {
  try {
    let userData;

    if (req?.user?.user) {
      userData = req.user.user;
    } else {
      userData = req.user;
    }

    res.render("about-us", { user: userData });
  } catch (error) {
    return res.status(400).json({
      success: false,
      msg: error.message,
    });
  }
};

const membershipPage = async (req, res) => {
  try {
    let userData;

    if (req?.user?.user) {
      userData = req.user.user;
    } else {
      userData = req.user;
    }

    const tiers = await Pricing.find({}, 'tierDiscount.tier');
    const tierValues = tiers
    .filter(doc => doc.tierDiscount && doc.tierDiscount.tier)
    .map(doc => doc.tierDiscount.tier)

    const allTiers = tierValues.reduce((acc, tier, index) => {
      acc[`tier${index + 1}`] = tier;
      return acc
    }, {})

    const tiersDoc = await Pricing.find({'tierDiscount.tier': { $in: ["Balance", "Vitality", "Harmony", "Serenity"] }})

    const basePoints = tiersDoc.reduce((acc, tier) => {
      const tierName = tier.tierDiscount.tier;
      const points = tier.tierDiscount.basePoints;
      acc[tierName] = points;
      return acc;
    }, {});

    res.render("membership", { basePoints, allTiers, user: userData });
  } catch (error) {
    return res.status(400).json({
      success: false,
      msg: error.message,
    });
  }
};

const addInfoPage = async (req, res) => {
  try {
    const id = req.query.id;
    const userToUpdate = await User.findById(id);
    return res.render("add-info", { userToUpdate });
  } catch (error) {
    return res.status(400).json({
      success: false,
      msg: error.message,
    });
  }
};

const updateAdditionalInfoAndConsent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const enteredFields = req.body;
      const id = req.query.id;
      return res.render("add-info", {
        userToUpdate: { id },
        enteredFields,
        error: errors.errors[0].msg,
      });
    }

    const { dob, mobile, referredBy, hasAcceptedPrivacyPolicy } = req.body;
    let hasGivenMarketingConsent = req.body.hasGivenMarketingConsent;
    const id = req.query.id;

    if (!hasGivenMarketingConsent) {
      hasGivenMarketingConsent = false;
    }

    const user = await User.findById(id);

    let privacyCreated = new Date();
    let marketingCreated = new Date();
    if (user?.privacy?.createdAt) {
      privacyCreated = userExits.privacy.createdAt;
    }
    if (user?.marketing?.createdAt) {
      marketingCreated = userExits.marketing.createdAt;
    }

    let referrerId;
    if (referredBy) {
      const userExists = await User.findOne({
        $or: [{ email: referredBy }, { memberId: referredBy }],
      });

      if (!userExists) {
        return res.render("add-info", {
          userToUpdate: user,
          error: `${referredBy} can not be found.`,
        });
      } else {
        if (!userExists.referredTo.includes(user.memberId)) {
          userExists.referredTo.push(user.memberId);
          await userExists.save();
        }
        referrerId = userExists.memberId;
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
      "membershipInfo.pointsAvailable": 0.0,
      "membershipInfo.pointsForRedemptions": 0.0,
      isAdmin: false,
      isSuperAdmin: false,
    };

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    );

    res.redirect("/dashboard");
  } catch (error) {
    const id = req.query.id;
    const user = await User.findById(id);

    if (error.code && error.code === 11000) {
      const duplicateField = Object.keys(error.keyValue)[0];
      return res.render("add-info", {
        userToUpdate: user,
        error: `${duplicateField} already exists.`,
      });
    }
    return res.status(500).json({ success: false, msg: error.message });
  }
};

const downloadPointsHistory = async (req, res) => {
  try {
    let user;

    if (req?.user?.user) {
      user = req.user.user;
    } else {
      user = req.user;
    }

    let userPointsHistory = [];

    const userId = user.id;
    const histories = await PointsHistory.find({ userId }).sort({
      transactionDate: -1,
    });

    histories.forEach((history) => {
      const {
        transactionType,
        points,
        totalPointsBefore,
        totalPointsAfter,
        service,
        tranCode,
        transactionDate,
      } = history;

      const type = transactionType === "add" ? "Transaction" : "Redemption";

      const myDate = transactionDate.toISOString().split("T")[0];

      userPointsHistory.push({
        "Transaction Code": tranCode,
        Date: myDate,
        Type: type,
        "Service/Reward": service,
        Points: points,
        "Points Before": totalPointsBefore,
        "Points After": totalPointsAfter,
      });
    });

    const csvFields = [
      "Transaction Code",
      "Date",
      "Type",
      "Service/Reward",
      "Points",
      "Points Before",
      "Points After",
    ];

    const csvParser = new CsvParser({ fields: csvFields });
    const csvData = csvParser.parse(userPointsHistory);

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=userPointsHistory.csv"
    );
    res.status(200).send("\uFEFF" + csvData);
  } catch (error) {
    return res.status(400).json({
      success: false,
      msg: error.message,
    });
  }
};

module.exports = {
  profilePage,
  aboutUsPage,
  membershipPage,
  walletPage,
  addInfoPage,
  dashboardRedirect,
  updateAdditionalInfoAndConsent,
  downloadPointsHistory,
};
