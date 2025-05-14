const sendgridMailer = require("@sendgrid/mail");

sendgridMailer.setApiKey(process.env.SENDGRID_API);

const sendMail = async (email, subject, content) => {
  try {
    var message = {
      from: {
        name: process.env.SENDGRID_NAME,
        email: process.env.SENDGRID_MAIL,
      },
      to: email,
      subject: subject,
      html: content,
    };

    await sendgridMailer.send(message);
    console.log(`Email sent to ${email}`);
  } catch (error) {
    if (error.response) {
      console.error(
        "SendGrid Error:",
        error.response.body.errors || error.message
      );
    } else {
      console.error("Error:", error.message);
    }
  }
};

module.exports = {
  sendMail,
};
