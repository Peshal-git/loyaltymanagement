const express = require("express");
const router = express.Router();

router.use(express.json());

const bodyParser = require("body-parser");
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

const publicController = require("../controllers/publicController");
const {
  emailValidator,
  passwordStrengthValidator,
} = require("../middleware/validation");
const { loginCheck } = require("../middleware/middlewares");
const auth = require("../middleware/auth");

const { logout } = require("../middleware/fetchAPI");

router.get("/mail-verification", publicController.verifyMail);
router.get("/register", publicController.registerPage);
router.get("/", loginCheck, publicController.loginPage);
router.get("/forgot-password", publicController.forgotPasswordPage);
router.post(
  "/forgot-password",
  emailValidator,
  publicController.sendMailToChangePassword
);

router.get("/reset-password", publicController.resetPasswordPage);
router.post(
  "/reset-password",
  passwordStrengthValidator,
  publicController.updatePassword
);

router.get("/logout", auth, logout, publicController.logout);

module.exports = router;
