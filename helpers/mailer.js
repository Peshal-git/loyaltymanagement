// const nodemailer = require('nodemailer')
const sendgridMailer = require('@sendgrid/mail')

sendgridMailer.setApiKey(process.env.SENDGRID_API)

// const transporter = nodemailer.createTransport({
//     host: process.env.SMTP_HOST,
//     port: process.env.SMTP_PORT,
//     secure: false,
//     requireTLS: true,
//     auth: {
//         user: process.env.SMTP_MAIL,
//         pass: process.env.SMTP_PASSWORD
//     }
// })

const sendMail = async (email, subject, content) => {
    try {
        var message = {
            from: {
                name: 'Peshal',
                email: process.env.SENDGRID_MAIL
            },
            to: email,
            subject: subject,
            html: content
        }

        // transporter.sendMail(message, (error, info) => {
        //     if (error) {
        //         console.log(error)
        //     }
        //     console.log('Mail Sent ', info.messageId)
        // })

        await sendgridMailer.send(message)

    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    sendMail
}