const hbs = require('hbs')

hbs.registerHelper('startFromOne', function (value) {
    return parseInt(value) + 1
})

hbs.registerHelper('ifEquals', function(arg1, arg2, options) {
    return arg1 === arg2 ? options.fn(this) : options.inverse(this);
});

hbs.registerHelper('makeDate', function (value) {
    if (value) {
        const formattedDate = value.toISOString().split('T')[0]
        const parts = formattedDate.split('-')
        const mmddyyyy = `${parts[1]}-${parts[2]}-${parts[0]}`
        return mmddyyyy
    }
    else {
        return "Date not available"
    }
})

hbs.registerHelper('makeTime', function (value) {
    if (value) {
        const date = new Date(value);
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        const formattedTime = `${hours}:${minutes}:${seconds}`;
        return formattedTime;
    }
    else {
        return "Time not available"
    }
})

hbs.registerHelper('isActive', function (currentPage, page) {
    return currentPage === page ? 'active' : '';
});

hbs.registerHelper("formatPoints", function (points) {
    if (points === undefined || isNaN(points)) {
        return "0.00";
    }
    return points.toFixed(2);
});

hbs.registerHelper("getValue", function(transactionField, enteredField) {
    return transactionField || enteredField;
});

hbs.registerHelper("getTier", function(userTier, enteredField) {
    return userTier || enteredField;
});

hbs.registerHelper('lowercase', function(str) {
    return str.toLowerCase();
});

hbs.registerHelper("eq", function (a, b) {
    return a === b;
});

hbs.registerHelper("makeType", function (value) {
    if(value=="add"){
        return 'Transaction'
    }
    if(value="subtract"){
        return 'Redemption'
    }
    return 'Error'
    
});

hbs.registerHelper('getColor', function (value) {
    if(value=='add'){
        return 'colorGreen'
    }
    if(value="subtract"){
        return 'colorRed'
    }
    return 'Error'

});

hbs.registerHelper('getUsedOrGained', function (value) {
    if(value=='add'){
        return 'Gained: '
    }
    if(value="subtract"){
        return 'Used: '
    }
    return 'Error'

});

hbs.registerHelper('commaFormat', function (number) {
    if (typeof number !== 'number') {
        return number;
    }
    return number.toLocaleString('en-US');
});