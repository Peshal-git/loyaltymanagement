const hbs = require('hbs')

hbs.registerHelper('startFromOne', function (value) {
    return parseInt(value) + 1
})

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
