"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const logger_1 = require("./logger");
const sendEmail = async (options) => {
    try {
        const transporter = nodemailer_1.default.createTransport({
            host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
            port: parseInt(process.env.SMTP_PORT || '2525', 10),
            auth: {
                user: process.env.SMTP_USER || '',
                pass: process.env.SMTP_PASS || '',
            },
        });
        const mailOptions = {
            from: process.env.SMTP_FROM || 'TaskFlow <noreply@taskflow.io>',
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html,
        };
        if (process.env.SMTP_USER && process.env.SMTP_PASS) {
            await transporter.sendMail(mailOptions);
            logger_1.logger.info(`Email sent successfully to ${options.email}`);
        }
        else {
            logger_1.logger.warn(`SMTP credentials not configured. Skipping email send. Content:`);
            console.log(`----------------------------------------`);
            console.log(`TO: ${options.email}`);
            console.log(`SUBJECT: ${options.subject}`);
            console.log(`BODY: ${options.message}`);
            console.log(`----------------------------------------`);
        }
    }
    catch (err) {
        logger_1.logger.error(`Error sending email to ${options.email}`, err);
    }
};
exports.sendEmail = sendEmail;
