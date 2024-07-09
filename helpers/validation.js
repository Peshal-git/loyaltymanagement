const { check } = require('express-validator')

const validateDate = (value) => {
    const dateRegex = /^(\d{2})-(\d{2})-(\d{4})$/;
    return dateRegex.test(value);
}

exports.registerValidator = [
    check('firstname', 'Name is required').not().isEmpty(),
    check('lastname', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail().normalizeEmail({
        gmail_remove_dots: true
    }),
    check('password', 'Password must have more than 6 characters, and must contain at least one uppercase letter, one lowercase letter, one special character, and one number').isStrongPassword({
        minLength: 6,
        minUppercase: 1,
        minLowercase: 1,
        minNumbers: 1,
        minSymbols: 1
    }),
    check('dob', 'Date must be in correct format mm-dd-yyyy').custom(validateDate).isLength({
        min: 10,
        max: 10
    }),
    check('mobile', 'Mobile number should contain 10 digits').isLength({
        min: 10,
        max: 10
    }),
]

exports.sendMailVerificationValidator = [
    check('email', 'Please include a valid email').isEmail().normalizeEmail({
        gmail_remove_dots: true
    }),

]

exports.passwordResetValidator = [
    check('email', 'Please include a valid email').isEmail().normalizeEmail({
        gmail_remove_dots: true
    }),
]

exports.passwordStrengthValidator = [
    check('password', 'Password must have more than 6 characters, and must contain at least one uppercase letter, one lowercase letter, one special character, and one number').isStrongPassword({
        minLength: 6,
        minUppercase: 1,
        minLowercase: 1,
        minNumbers: 1,
        minSymbols: 1
    }),
]

exports.loginValidator = [
    check('email', 'Please include a valid email').isEmail().normalizeEmail({
        gmail_remove_dots: true
    }),
    check('password', 'Password is required').not().isEmpty(),

]

exports.updateProfileValidator = [
    check('firstname', 'Name is required').not().isEmpty(),
    check('lastname', 'Name is required').not().isEmpty(),
    check('dob', 'Date must be in correct format mm-dd-yyyy').custom(validateDate).isLength({
        min: 10,
        max: 10
    }),
    check('mobile', 'Mobile number should contain 10 digits').isLength({
        min: 10,
        max: 10
    }),
]

exports.updateSocialAuthValidator = [
    check('dob', 'Date must be in correct format mm-dd-yyyy')
        .custom((value) => {
            function isValidDateFormat(dateString) {
                const regex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
                return regex.test(dateString);
            }
            return isValidDateFormat(value);
        })
        .isLength({ min: 10, max: 10 }),
    check('mobile', 'Mobile number should contain 10 digits').isLength({
        min: 10,
        max: 10
    }),
]

exports.adminUpdateValidator = [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail().normalizeEmail({
        gmail_remove_dots: true
    }),
    check('dob', 'Date must be in correct format mm-dd-yyyy').custom(validateDate).isLength({
        min: 10,
        max: 10
    }),
    check('mobile', 'Mobile number should contain 10 digits').isLength({
        min: 10,
        max: 10
    }),
]