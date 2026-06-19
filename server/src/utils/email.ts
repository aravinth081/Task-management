import nodemailer from 'nodemailer';
import { logger } from './logger';

export const sendEmail = async (options: {
  email: string;
  subject: string;
  message: string;
  html?: string;
}): Promise<void> => {
  try {
    const transporter = nodemailer.createTransport({
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
      logger.info(`Email sent successfully to ${options.email}`);
    } else {
      logger.warn(`SMTP credentials not configured. Skipping email send. Content:`);
      console.log(`----------------------------------------`);
      console.log(`TO: ${options.email}`);
      console.log(`SUBJECT: ${options.subject}`);
      console.log(`BODY: ${options.message}`);
      console.log(`----------------------------------------`);
    }
  } catch (err) {
    logger.error(`Error sending email to ${options.email}`, err);
  }
};
