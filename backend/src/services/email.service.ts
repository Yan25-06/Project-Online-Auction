import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST || '';
const SMTP_PORT = Number(process.env.SMTP_PORT) || 587;
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const FROM_NAME = process.env.EMAIL_FROM_NAME || 'Sàn Đấu Giá';
const FROM_ADDRESS = SMTP_USER;

export const EmailService = {
  async sendMail(to: string, subject: string, html: string) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS
        }
      });

      await transporter.sendMail({
        from: `"Sàn đấu giá" <${FROM_ADDRESS}>`,
        to,
        subject,
        html
      });

      console.log(`Email sent to ${to} - ${subject}`);
    } catch (err) {
      console.error('Failed to send email', err);
      throw err;
    }
  }
};
