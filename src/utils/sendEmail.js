import nodemailer from 'nodemailer';
import { SMTP } from '../constants/index.js';
import { env } from '../utils/env.js';
import createHttpError from 'http-errors';

const transporter = nodemailer.createTransport({
  host: env(SMTP.HOST),
  port: Number(env(SMTP.PORT)),
  auth: {
    user: env(SMTP.USER),
    pass: env(SMTP.PASSWORD),
  },
});

export const sendEmail = async (options) => {
  try {
    await transporter.sendMail(options);
  } catch (err) {
    console.log(err.message);
    throw createHttpError(
      500,
      'Failed to send the email, please try again later.',
    );
  }
};
