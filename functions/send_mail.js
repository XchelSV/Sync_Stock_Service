const dotenv = require('dotenv');
dotenv.config({ path: __dirname + '/./../.env' });
const nodemailer = require("nodemailer");

// async..await is not allowed in global scope, must use a wrapper
exports.sendMail = async (mails, subject, html_body) => {

    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    let testAccount = await nodemailer.createTestAccount();

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
    host: process.env.smtp_server,
    port: parseInt(process.env.smtp_port),
    secure: true, // true for 465, false for other ports
    auth: {
        type: 'OAuth2',
        user: process.env.smtp_user,
        serviceClient: process.env.client_id,
        privateKey: process.env.private_key
    }
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: 'Sync MT App <notificaciones@mtsport.com.mx>',
        to: mails,
        subject: subject,
        html: html_body
    });
    console.log("Message sent: %s", info.messageId);
}