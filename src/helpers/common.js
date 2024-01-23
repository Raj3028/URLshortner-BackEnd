const jwt = require("jsonwebtoken");
const logger = require('../../logger/index');
const customError = require('../handler/errorHandler');
const commonServices = require('../services/Common');
const con = require("../constants/index");
const emailService = require('config').get('emailService');
const nodemailer = require('nodemailer');


const common = {
    eventLog(req, error, message, data = null, userId) {
        const response_data = {
            error: error ? true : false,
            message: message,
            data: data,
        };
        logger.info("user :" + userId + " | ipAddress :" + req.ip + " | response :" + JSON.stringify(response_data));
    },
    trimBody: (body) => {
        for (var all in body) {
            if (typeof body[all] !== 'number' && typeof body[all] !== 'object' && typeof body[all] !== 'boolean') {
                body[all] = body[all].trim();
            }
        }
        return body;
    },
    createToken: (payload, tokenTime) => {
        return jwt.sign(payload, process.env.JWTKEY, {
            algorithm: process.env.ALGORITHM,
            expiresIn: tokenTime
        })
    },
    decryptData: async (data) => {
        try {
            let EncodedData = await decodeURIComponent(data);
            const bytes = await cryptoJs.AES.decrypt(EncodedData, 'my_secret_key');
            const originalData = await bytes.toString(cryptoJs.enc.Utf8);
            return originalData;
        } catch (error) {
            throw new customError('Unable to decrypt token', error.message);
        }
    },
    sendNodeMailerEmail: async (templateData, attachments, emailId) => {
        try {
            var subject = templateData[0].subject;
            let mailBody = templateData[0].html;

            const transporter = nodemailer.createTransport(emailService);

            const mailOptions = {
                from: 'support@lenshub.in',
                to: emailId,
                subject: subject,
                html: mailBody,
                attachments: attachments ? attachments : null
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error:', error);
                } else {
                    console.log('Email sent:', info.response);
                }
            });


        } catch (error) {
            logger.info(JSON.stringify(error));
            return error;
        }
    },
    capitalizeFirstLetter: (value) => {
        if (typeof value === 'string') {
            return value.charAt(0).toUpperCase() + value.slice(1);
        } else {
            return value;
        }
    }
}
module.exports = common;