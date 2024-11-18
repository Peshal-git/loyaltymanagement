const { check } = require('express-validator')

const validateDate = (value) => {
    const mmddyyyyRegex = /^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])-\d{4}$/
    const yyyymmddRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/

    if (mmddyyyyRegex.test(value) || yyyymmddRegex.test(value)) {
        return true
    }
    return false
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
    check('mobile', 'Please enter a valid phone number.').isMobilePhone()
]

exports.emailValidator = [
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
        .custom(validateDate)
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

exports.transactionUpdateValidator = [
    check('amount', 'Please enter the amount').not().isEmpty()
]

exports.discountsUpdateValidator = [
    check('balanceDiscountp')
        .not().isEmpty().withMessage('Fill all the fields')
        .matches(/^\d+(\.\d+)?%?$/).withMessage('Must be a number with at most one "%" symbol'),
    
    check('vitalityDiscountp')
        .not().isEmpty().withMessage('Fill all the fields')
        .matches(/^\d+(\.\d+)?%?$/).withMessage('Must be a number with at most one "%" symbol'),
    
    check('harmonyDiscountp')
        .not().isEmpty().withMessage('Fill all the fields')
        .matches(/^\d+(\.\d+)?%?$/).withMessage('Must be a number with at most one "%" symbol'),
    
    check('serenityDiscountp')
        .not().isEmpty().withMessage('Fill all the fields')
        .matches(/^\d+(\.\d+)?%?$/).withMessage('Must be a number with at most one "%" symbol')
];

exports.multipliersUpdateValidator = [
    check('lifeCafeMultiplier', 'Fill all the fields').not().isEmpty(),
    check('yogaClassMultiplier', 'Fill all the fields').not().isEmpty(),
    check('vitaSpaMultiplier', 'Fill all the fields').not().isEmpty(),
    check('retreatsMultiplier', 'Fill all the fields').not().isEmpty()
]